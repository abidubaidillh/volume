-- Add missing tables for dashboard functionality

-- User goals table for reading targets
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  yearly_goal INTEGER DEFAULT 24,
  monthly_goal INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Reading list table
CREATE TABLE IF NOT EXISTS reading_list (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books_metadata(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'want_to_read' CHECK (status IN ('want_to_read', 'currently_reading', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books_metadata(id) ON DELETE CASCADE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Book genres table for better categorization
CREATE TABLE IF NOT EXISTS book_genres (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID REFERENCES books_metadata(id) ON DELETE CASCADE NOT NULL,
  genre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reading sessions for tracking reading time
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books_metadata(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  pages_read INTEGER DEFAULT 0,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_user_id ON reading_list(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_status ON reading_list(status);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_book_id ON book_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_genre ON book_genres(genre);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON reading_sessions(session_date DESC);

-- Enable RLS on new tables
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for reading_list
CREATE POLICY "Users can view their own reading list" ON reading_list
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own reading list" ON reading_list
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading list" ON reading_list
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own reading list" ON reading_list
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wishlist
CREATE POLICY "Users can view their own wishlist" ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own wishlist" ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist" ON wishlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist" ON wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for book_genres (public read, authenticated write)
CREATE POLICY "Book genres are viewable by everyone" ON book_genres
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert book genres" ON book_genres
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for reading_sessions
CREATE POLICY "Users can view their own reading sessions" ON reading_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading sessions" ON reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading sessions" ON reading_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update reading list status automatically
CREATE OR REPLACE FUNCTION update_reading_list_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set started_at when status changes to currently_reading
  IF NEW.status = 'currently_reading' AND OLD.status != 'currently_reading' THEN
    NEW.started_at = NOW();
  END IF;
  
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
    NEW.progress = 100;
  END IF;
  
  -- Update updated_at
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reading list updates
CREATE TRIGGER reading_list_update_trigger
  BEFORE UPDATE ON reading_list
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_list_timestamps();

-- Function to calculate reading streak
CREATE OR REPLACE FUNCTION calculate_reading_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  current_date DATE := CURRENT_DATE;
  check_date DATE;
BEGIN
  -- Start from today and go backwards
  check_date := current_date;
  
  LOOP
    -- Check if user has any activity on this date
    IF EXISTS (
      SELECT 1 FROM reviews 
      WHERE user_id = user_uuid 
      AND DATE(created_at) = check_date
    ) OR EXISTS (
      SELECT 1 FROM reading_sessions 
      WHERE user_id = user_uuid 
      AND session_date = check_date
    ) THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      -- Break the streak
      EXIT;
    END IF;
    
    -- Safety check to prevent infinite loop
    IF streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user reading stats
CREATE OR REPLACE FUNCTION get_user_reading_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
  total_reviews INTEGER;
  avg_rating NUMERIC;
  books_this_month INTEGER;
  books_this_year INTEGER;
  reading_streak INTEGER;
BEGIN
  -- Get total reviews
  SELECT COUNT(*) INTO total_reviews
  FROM reviews
  WHERE user_id = user_uuid;
  
  -- Get average rating
  SELECT ROUND(AVG(rating), 1) INTO avg_rating
  FROM reviews
  WHERE user_id = user_uuid;
  
  -- Get books this month
  SELECT COUNT(*) INTO books_this_month
  FROM reviews
  WHERE user_id = user_uuid
  AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
  
  -- Get books this year
  SELECT COUNT(*) INTO books_this_year
  FROM reviews
  WHERE user_id = user_uuid
  AND DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE);
  
  -- Get reading streak
  SELECT calculate_reading_streak(user_uuid) INTO reading_streak;
  
  -- Build JSON response
  stats := json_build_object(
    'totalReviews', COALESCE(total_reviews, 0),
    'averageRating', COALESCE(avg_rating, 0),
    'booksThisMonth', COALESCE(books_this_month, 0),
    'booksThisYear', COALESCE(books_this_year, 0),
    'readingStreak', COALESCE(reading_streak, 0),
    'favoriteGenres', '[]'::json
  );
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;