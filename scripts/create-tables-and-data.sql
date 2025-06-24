-- Tạo bảng label_manager nếu chưa có
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
    -- Background settings
    background_type VARCHAR(50) DEFAULT 'gradient',
    background_gradient TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background_video_url TEXT DEFAULT '',
    background_opacity DECIMAL(3,2) DEFAULT 0.3,
    background_playlist TEXT DEFAULT ''
);

-- Tạo bảng artist nếu chưa có
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

-- Tạo bảng submissions nếu chưa có
CREATE TABLE IF NOT EXISTS public.submissions (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES public.artist(id),
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    release_type VARCHAR(50) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    release_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tracks JSONB DEFAULT '[]',
    artwork_url TEXT,
    isrc_code VARCHAR(50),
    copyright_info JSONB DEFAULT '{}'
);

-- Insert dữ liệu mặc định cho label_manager nếu chưa có
INSERT INTO public.label_manager (
    username, password, fullname, email, avatar, bio, createdat,
    facebook, youtube, spotify, applemusic, tiktok, instagram,
    background_playlist
) VALUES (
    'ankunstudio', 'admin', 'An Kun Studio Digital Music Distribution', 
    'admin@ankun.dev', '/face.png', '', '2025-06-24 09:54:55.895016+00',
    '', '', '', '', '', '',
    'PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO'
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    fullname = EXCLUDED.fullname,
    email = EXCLUDED.email,
    background_playlist = EXCLUDED.background_playlist;

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_label_manager_username ON public.label_manager(username);
CREATE INDEX IF NOT EXISTS idx_label_manager_email ON public.label_manager(email);
CREATE INDEX IF NOT EXISTS idx_artist_username ON public.artist(username);
CREATE INDEX IF NOT EXISTS idx_artist_email ON public.artist(email);
CREATE INDEX IF NOT EXISTS idx_submissions_artist_id ON public.submissions(artist_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.label_manager ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho label_manager
DROP POLICY IF EXISTS "label_manager_select_policy" ON public.label_manager;
CREATE POLICY "label_manager_select_policy" ON public.label_manager FOR SELECT USING (true);

DROP POLICY IF EXISTS "label_manager_insert_policy" ON public.label_manager;
CREATE POLICY "label_manager_insert_policy" ON public.label_manager FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "label_manager_update_policy" ON public.label_manager;
CREATE POLICY "label_manager_update_policy" ON public.label_manager FOR UPDATE USING (true);

-- RLS Policies cho artist
DROP POLICY IF EXISTS "artist_select_policy" ON public.artist;
CREATE POLICY "artist_select_policy" ON public.artist FOR SELECT USING (true);

DROP POLICY IF EXISTS "artist_insert_policy" ON public.artist;
CREATE POLICY "artist_insert_policy" ON public.artist FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "artist_update_policy" ON public.artist;
CREATE POLICY "artist_update_policy" ON public.artist FOR UPDATE USING (true);

-- RLS Policies cho submissions
DROP POLICY IF EXISTS "submissions_select_policy" ON public.submissions;
CREATE POLICY "submissions_select_policy" ON public.submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "submissions_insert_policy" ON public.submissions;
CREATE POLICY "submissions_insert_policy" ON public.submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "submissions_update_policy" ON public.submissions;
CREATE POLICY "submissions_update_policy" ON public.submissions FOR UPDATE USING (true);
