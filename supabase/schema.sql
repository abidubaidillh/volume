-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create books_metadata table
CREATE TABLE books_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  google_books_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books_metadata(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id) -- One review per user per book
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_books_metadata_google_books_id ON books_metadata(google_books_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Books metadata policies (public read, authenticated write)
CREATE POLICY "Books metadata is viewable by everyone" ON books_metadata
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert books metadata" ON books_metadata
  FOR INSERT TO authenticated WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own reviews" ON reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enhanced function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $
BEGIN
  -- Update the auth.users metadata when profile is updated
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'username', NEW.username,
      'avatar_url', NEW.avatar_url,
      'bio', NEW.bio
    )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync profile updates with auth metadata
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();

-- Function to check username availability
CREATE OR REPLACE FUNCTION public.is_username_available(username_to_check TEXT, exclude_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $
BEGIN
  IF exclude_user_id IS NULL THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE username = username_to_check
    );
  ELSE
    RETURN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE username = username_to_check 
      AND id != exclude_user_id
    );
  END IF;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add session management policies
CREATE POLICY "Users can view their own sessions" ON auth.sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Add audit log table for security
CREATE TABLE IF NOT EXISTS auth_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on auth_logs
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Auth logs policies
CREATE POLICY "Users can view their own auth logs" ON auth_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Function to log auth events
CREATE OR REPLACE FUNCTION public.log_auth_event(
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $
BEGIN
  INSERT INTO public.auth_logs (user_id, event_type, ip_address, user_agent)
  VALUES (user_id, event_type, ip_address, user_agent);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;