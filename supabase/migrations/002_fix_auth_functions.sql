-- Fix the handle_new_user function for better profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate username from metadata or email
  new_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Clean username (remove special characters, make lowercase)
  new_username := lower(regexp_replace(new_username, '[^a-zA-Z0-9_]', '_', 'g'));
  
  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) LOOP
    counter := counter + 1;
    new_username := COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'user_' || substr(NEW.id::text, 1, 8)
    ) || '_' || counter::text;
    new_username := lower(regexp_replace(new_username, '[^a-zA-Z0-9_]', '_', 'g'));
    
    -- Prevent infinite loop
    IF counter > 100 THEN
      new_username := 'user_' || substr(NEW.id::text, 1, 8) || '_' || extract(epoch from now())::bigint;
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, username, avatar_url, bio)
    VALUES (
      NEW.id,
      new_username,
      NEW.raw_user_meta_data->>'avatar_url',
      NULL
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- If still a unique violation, use UUID-based username
      INSERT INTO public.profiles (id, username, avatar_url, bio)
      VALUES (
        NEW.id,
        'user_' || replace(NEW.id::text, '-', ''),
        NEW.raw_user_meta_data->>'avatar_url',
        NULL
      );
    WHEN OTHERS THEN
      -- Log error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add function to manually create missing profiles
CREATE OR REPLACE FUNCTION public.create_missing_profile(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
  new_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Get user data
  SELECT * INTO user_record FROM auth.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Generate username
  new_username := COALESCE(
    user_record.raw_user_meta_data->>'username',
    user_record.raw_user_meta_data->>'full_name',
    split_part(user_record.email, '@', 1),
    'user_' || substr(user_id::text, 1, 8)
  );
  
  -- Clean username
  new_username := lower(regexp_replace(new_username, '[^a-zA-Z0-9_]', '_', 'g'));
  
  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) LOOP
    counter := counter + 1;
    new_username := COALESCE(
      user_record.raw_user_meta_data->>'username',
      user_record.raw_user_meta_data->>'full_name',
      split_part(user_record.email, '@', 1),
      'user_' || substr(user_id::text, 1, 8)
    ) || '_' || counter::text;
    new_username := lower(regexp_replace(new_username, '[^a-zA-Z0-9_]', '_', 'g'));
    
    IF counter > 100 THEN
      new_username := 'user_' || substr(user_id::text, 1, 8) || '_' || extract(epoch from now())::bigint;
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert profile
  BEGIN
    INSERT INTO public.profiles (id, username, avatar_url, bio)
    VALUES (
      user_id,
      new_username,
      user_record.raw_user_meta_data->>'avatar_url',
      NULL
    );
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create profile for user %: %', user_id, SQLERRM;
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_missing_profile(UUID) TO authenticated;