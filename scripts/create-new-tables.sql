-- Tạo bảng label_manager
CREATE TABLE IF NOT EXISTS "public"."label_manager" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "fullname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "avatar" VARCHAR(500) DEFAULT '/face.png',
    "bio" TEXT DEFAULT '',
    "createdat" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "facebook" VARCHAR(255) DEFAULT '',
    "youtube" VARCHAR(255) DEFAULT '',
    "spotify" VARCHAR(255) DEFAULT '',
    "applemusic" VARCHAR(255) DEFAULT '',
    "tiktok" VARCHAR(255) DEFAULT '',
    "instagram" VARCHAR(255) DEFAULT ''
);

-- Tạo bảng artistAttachment  
CREATE TABLE IF NOT EXISTS "public"."artistAttachment" (
    "id" SERIAL PRIMARY KEY,
    "artist_id" UUID REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "attachment_type" VARCHAR(100) NOT NULL, -- 'contract', 'id_card', 'portfolio', etc.
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "status" VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    "notes" TEXT
);

-- Insert dữ liệu chính xác cho label_manager
INSERT INTO "public"."label_manager" ("id", "username", "password", "fullname", "email", "avatar", "bio", "createdat", "facebook", "youtube", "spotify", "applemusic", "tiktok", "instagram") 
VALUES ('1', 'ankunstudio', 'admin', 'An Kun Studio Digital Music Distribution', 'admin@ankun.dev', '/face.png', '', '2025-06-24 09:54:55.895016+00', '', '', '', '', '', '')
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    fullname = EXCLUDED.fullname,
    email = EXCLUDED.email,
    avatar = EXCLUDED.avatar,
    bio = EXCLUDED.bio,
    facebook = EXCLUDED.facebook,
    youtube = EXCLUDED.youtube,
    spotify = EXCLUDED.spotify,
    applemusic = EXCLUDED.applemusic,
    tiktok = EXCLUDED.tiktok,
    instagram = EXCLUDED.instagram;

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_label_manager_username ON "public"."label_manager"("username");
CREATE INDEX IF NOT EXISTS idx_label_manager_email ON "public"."label_manager"("email");
CREATE INDEX IF NOT EXISTS idx_artist_attachment_artist_id ON "public"."artistAttachment"("artist_id");
CREATE INDEX IF NOT EXISTS idx_artist_attachment_type ON "public"."artistAttachment"("attachment_type");

-- Thiết lập Row Level Security (RLS) cho bảng label_manager
ALTER TABLE "public"."label_manager" ENABLE ROW LEVEL SECURITY;

-- Policy cho label_manager - chỉ cho phép SELECT
CREATE POLICY "Enable read access for label_manager" ON "public"."label_manager"
    FOR SELECT USING (true);

-- Policy cho artistAttachment - chỉ artist có thể xem attachment của mình
ALTER TABLE "public"."artistAttachment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view own attachments" ON "public"."artistAttachment"
    FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Artists can insert own attachments" ON "public"."artistAttachment"
    FOR INSERT WITH CHECK (auth.uid() = artist_id);

-- Cập nhật sequence cho id
SELECT setval('label_manager_id_seq', 1, true);
