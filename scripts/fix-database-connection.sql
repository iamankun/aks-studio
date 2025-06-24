-- Kiểm tra và tạo lại bảng với RLS policies đúng
-- Drop existing policies first
DROP POLICY IF EXISTS "label_manager_select_policy" ON public.label_manager;
DROP POLICY IF EXISTS "label_manager_insert_policy" ON public.label_manager;
DROP POLICY IF EXISTS "label_manager_update_policy" ON public.label_manager;

DROP POLICY IF EXISTS "artist_select_policy" ON public.artist;
DROP POLICY IF EXISTS "artist_insert_policy" ON public.artist;
DROP POLICY IF EXISTS "artist_update_policy" ON public.artist;

-- Disable RLS temporarily to allow access
ALTER TABLE public.label_manager DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist DISABLE ROW LEVEL SECURITY;

-- Recreate tables if needed
CREATE TABLE IF NOT EXISTS public.label_manager (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar TEXT DEFAULT '/face.png',
    bio TEXT DEFAULT '',
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    facebook TEXT DEFAULT '',
    youtube TEXT DEFAULT '',
    spotify TEXT DEFAULT '',
    applemusic TEXT DEFAULT '',
    tiktok TEXT DEFAULT '',
    instagram TEXT DEFAULT '',
    background_type VARCHAR(50) DEFAULT 'video',
    background_gradient TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background_video_url TEXT DEFAULT '',
    background_opacity DECIMAL(3,2) DEFAULT 0.3,
    background_playlist TEXT DEFAULT 'PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO'
);

CREATE TABLE IF NOT EXISTS public.artist (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar TEXT DEFAULT '/face.png',
    bio TEXT DEFAULT '',
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    facebook TEXT DEFAULT '',
    youtube TEXT DEFAULT '',
    spotify TEXT DEFAULT '',
    applemusic TEXT DEFAULT '',
    tiktok TEXT DEFAULT '',
    instagram TEXT DEFAULT ''
);

-- Insert test data
INSERT INTO public.label_manager (
    username, password, fullname, email, avatar, bio, createdat,
    facebook, youtube, spotify, applemusic, tiktok, instagram,
    background_playlist
) VALUES (
    'ankunstudio', 'admin', 'An Kun Studio Digital Music Distribution', 
    'admin@ankun.dev', '/face.png', '', '2025-06-24 09:54:55.895016+00',
    '', '', '', '', '', '',
    'PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO'
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    fullname = EXCLUDED.fullname,
    email = EXCLUDED.email,
    background_playlist = EXCLUDED.background_playlist;

-- Grant permissions
GRANT ALL ON public.label_manager TO anon;
GRANT ALL ON public.artist TO anon;
GRANT ALL ON public.label_manager TO authenticated;
GRANT ALL ON public.artist TO authenticated;

-- Create simple policies that allow all access for now
ALTER TABLE public.label_manager ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_label_manager" ON public.label_manager FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_artist" ON public.artist FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_label_manager_username ON public.label_manager(username);
CREATE INDEX IF NOT EXISTS idx_label_manager_email ON public.label_manager(email);
CREATE INDEX IF NOT EXISTS idx_artist_username ON public.artist(username);
CREATE INDEX IF NOT EXISTS idx_artist_email ON public.artist(email);
