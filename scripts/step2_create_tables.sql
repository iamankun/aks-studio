-- Create Tables for DMG Project
-- Author: An Kun Studio Digital Music Distribution
-- This script will DROP existing tables and CREATE new ones with fresh structure

-- START TRANSACTION
BEGIN;

-- Drop existing tables in correct order (considering foreign keys)
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.artist CASCADE;
DROP TABLE IF EXISTS public.label_manager CASCADE;

-- 1. CREATE LABEL_MANAGER TABLE (Full Admin Privileges)
CREATE TABLE public.label_manager (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    company_name VARCHAR(100),
    
    -- Permission flags (all TRUE for label managers)
    can_edit_all_submissions BOOLEAN DEFAULT TRUE,
    can_manage_artists BOOLEAN DEFAULT TRUE,
    can_edit_usernames BOOLEAN DEFAULT TRUE,
    can_access_analytics BOOLEAN DEFAULT TRUE,
    can_manage_royalties BOOLEAN DEFAULT TRUE,
    
    -- Contact info
    phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Profile
    avatar_url VARCHAR(500),
    bio TEXT,
    social_links JSONB,
    
    -- System settings
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{
        "email_submissions": true,
        "email_analytics": true,
        "email_system": true
    }'
);

-- 2. CREATE ARTIST TABLE (Restricted Privileges)
CREATE TABLE public.artist (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Artist-specific info
    artist_name VARCHAR(100) NOT NULL,
    stage_name VARCHAR(100),
    real_name VARCHAR(100),
    
    -- Permission flags (restricted for artists)
    can_edit_own_submissions BOOLEAN DEFAULT TRUE,
    can_view_own_analytics BOOLEAN DEFAULT TRUE,
    can_edit_usernames BOOLEAN DEFAULT FALSE, -- RESTRICTED
    can_access_all_data BOOLEAN DEFAULT FALSE, -- RESTRICTED
    can_manage_others BOOLEAN DEFAULT FALSE, -- RESTRICTED
    
    -- Artist profile
    genre VARCHAR(50),
    bio TEXT,
    website VARCHAR(255),
    social_links JSONB,
    
    -- Contact info
    phone VARCHAR(20),
    address TEXT,
    
    -- Label relationship
    label_manager_id INTEGER REFERENCES public.label_manager(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    is_verified_artist BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Profile media
    avatar_url VARCHAR(500),
    banner_url VARCHAR(500),
    
    -- Settings
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{
        "email_submissions": true,
        "email_updates": true
    }'
);

-- 3. CREATE SUBMISSIONS TABLE (Enhanced)
CREATE TABLE public.submissions (
    id SERIAL PRIMARY KEY,
    
    -- Owner (can be either label_manager or artist)
    submitted_by_label_manager_id INTEGER REFERENCES public.label_manager(id) ON DELETE CASCADE,
    submitted_by_artist_id INTEGER REFERENCES public.artist(id) ON DELETE CASCADE,
    
    -- Ensure only one owner type
    CONSTRAINT check_single_owner CHECK (
        (submitted_by_label_manager_id IS NOT NULL AND submitted_by_artist_id IS NULL) OR
        (submitted_by_label_manager_id IS NULL AND submitted_by_artist_id IS NOT NULL)
    ),
    
    -- Track metadata
    track_title VARCHAR(200) NOT NULL,
    artist_name VARCHAR(100) NOT NULL,
    album_name VARCHAR(200),
    genre VARCHAR(50),
    release_date DATE,
    
    -- File information
    audio_file_url VARCHAR(500),
    cover_art_url VARCHAR(500),
    file_size_mb DECIMAL(10,2),
    duration_seconds INTEGER,
    audio_format VARCHAR(10),
    
    -- Submission status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'processing', 'published'
    )),
    
    -- Review data
    reviewed_by_label_manager_id INTEGER REFERENCES public.label_manager(id),
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Distribution data
    distribution_platforms JSONB DEFAULT '[]',
    royalty_percentage DECIMAL(5,2) DEFAULT 70.00,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    
    -- Publishing info
    published_at TIMESTAMP WITH TIME ZONE,
    publish_schedule TIMESTAMP WITH TIME ZONE
);

-- CREATE INDEXES for better performance
CREATE INDEX idx_label_manager_username ON public.label_manager(username);
CREATE INDEX idx_label_manager_email ON public.label_manager(email);
CREATE INDEX idx_label_manager_active ON public.label_manager(is_active);

CREATE INDEX idx_artist_username ON public.artist(username);
CREATE INDEX idx_artist_email ON public.artist(email);
CREATE INDEX idx_artist_active ON public.artist(is_active);
CREATE INDEX idx_artist_label ON public.artist(label_manager_id);

CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_label_manager ON public.submissions(submitted_by_label_manager_id);
CREATE INDEX idx_submissions_artist ON public.submissions(submitted_by_artist_id);
CREATE INDEX idx_submissions_created ON public.submissions(created_at);

-- CREATE TRIGGERS for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_label_manager_updated_at
    BEFORE UPDATE ON public.label_manager
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_artist_updated_at
    BEFORE UPDATE ON public.artist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- COMMIT TRANSACTION
COMMIT;

-- Success message
SELECT 
    'DMG Tables created successfully!' as message,
    CURRENT_TIMESTAMP as created_at;
