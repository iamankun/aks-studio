-- Xóa tất cả dữ liệu cũ và tạo lại đúng cách
-- Chỉ tạo 1 tài khoản admin duy nhất trong schema public

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.artist CASCADE;
DROP TABLE IF EXISTS public.label_manager CASCADE;

-- Tạo lại bảng label_manager trong schema public
CREATE TABLE public.label_manager (
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

-- Tạo lại bảng artist trong schema public
CREATE TABLE public.artist (
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

-- Tạo lại bảng submissions trong schema public
CREATE TABLE public.submissions (
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

-- CHỈ INSERT 1 TÀI KHOẢN ADMIN DUY NHẤT
INSERT INTO public.label_manager (
    username, 
    password, 
    fullname, 
    email, 
    avatar, 
    bio, 
    createdat,
    facebook, 
    youtube, 
    spotify, 
    applemusic, 
    tiktok, 
    instagram,
    background_type,
    background_gradient,
    background_video_url,
    background_opacity,
    background_playlist
) VALUES (
    'ankunstudio',
    'admin',
    'An Kun Studio Digital Music Distribution',
    'admin@ankun.dev',
    '/face.png',
    'Digital Music Distribution Platform',
    '2025-06-24 09:54:55.895016+00',
    '',
    '',
    '',
    '',
    '',
    '',
    'video',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '',
    0.3,
    'PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO'
);

-- Tạo indexes
CREATE INDEX idx_label_manager_username ON public.label_manager(username);
CREATE INDEX idx_label_manager_email ON public.label_manager(email);
CREATE INDEX idx_artist_username ON public.artist(username);
CREATE INDEX idx_artist_email ON public.artist(email);
CREATE INDEX idx_submissions_artist_id ON public.submissions(artist_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);

-- Disable RLS để tránh permission issues
ALTER TABLE public.label_manager DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.label_manager TO anon;
GRANT ALL ON public.artist TO anon;
GRANT ALL ON public.submissions TO anon;
GRANT ALL ON public.label_manager TO authenticated;
GRANT ALL ON public.artist TO authenticated;
GRANT ALL ON public.submissions TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
