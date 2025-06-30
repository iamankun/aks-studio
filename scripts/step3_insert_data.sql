-- Insert Initial Data for DMG Project
-- Author: An Kun Studio Digital Music Distribution

BEGIN;

-- Clear existing data
DELETE FROM public.submissions;
DELETE FROM public.artist; 
DELETE FROM public.label_manager;

-- Reset sequences
ALTER SEQUENCE public.label_manager_id_seq RESTART WITH 1;
ALTER SEQUENCE public.artist_id_seq RESTART WITH 1;
ALTER SEQUENCE public.submissions_id_seq RESTART WITH 1;

-- Insert Label Managers (Full Admin)
INSERT INTO public.label_manager (
    username, email, password_hash, full_name, company_name, phone, website, bio
) VALUES 
('ankun_admin', 'admin@ankun.dev', '$2b$10$dummy.hash', 'An Kun Admin', 'AKS Studio', '+84123456789', 'https://aks.ankun.dev', 'Admin user'),
('manager1', 'manager1@ankun.dev', '$2b$10$dummy.hash', 'Manager One', 'AKS Label', '+84987654321', 'https://akslabel.com', 'Label manager');

-- Insert Artists (Restricted)
INSERT INTO public.artist (
    username, email, password_hash, artist_name, real_name, genre, bio, label_manager_id
) VALUES 
('artist1', 'artist1@ankun.dev', '$2b$10$dummy.hash', 'Moonlight Beats', 'Tran Thi B', 'Electronic', 'Electronic producer', 1),
('artist2', 'artist2@ankun.dev', '$2b$10$dummy.hash', 'Saigon Indie', 'Le Van C', 'Indie Rock', 'Indie rock band', 2),
('artist3', 'artist3@ankun.dev', '$2b$10$dummy.hash', 'Acoustic Dreams', 'Pham Thi D', 'Acoustic', 'Solo artist', NULL);

-- Insert Sample Submissions
INSERT INTO public.submissions (
    submitted_by_label_manager_id, submitted_by_artist_id,
    track_title, artist_name, album_name, genre, release_date,
    audio_file_url, cover_art_url, status
) VALUES 
(1, NULL, 'Midnight Vibes', 'Moonlight Beats', 'Chill EP', 'Electronic', '2024-12-01', 'https://aks.ankun.dev/audio1.mp3', 'https://aks.ankun.dev/cover1.jpg', 'published'),
(NULL, 1, 'Ocean Waves', 'Moonlight Beats', 'Ambient Album', 'Ambient', '2024-12-15', 'https://aks.ankun.dev/audio2.mp3', 'https://aks.ankun.dev/cover2.jpg', 'approved'),
(2, NULL, 'Saigon Nights', 'Saigon Indie', 'City Stories', 'Indie Rock', '2025-01-01', 'https://aks.ankun.dev/audio3.mp3', 'https://aks.ankun.dev/cover3.jpg', 'processing'),
(NULL, 3, 'Coffee Morning', 'Acoustic Dreams', 'Simple Moments', 'Acoustic', '2024-11-20', 'https://aks.ankun.dev/audio4.mp3', 'https://aks.ankun.dev/cover4.jpg', 'pending');

-- Mark some as verified
UPDATE public.artist SET is_verified_artist = TRUE, email_verified = TRUE WHERE username IN ('artist1', 'artist2');
UPDATE public.label_manager SET email_verified = TRUE;

COMMIT;

-- Show results
SELECT 'Initial data inserted successfully!' as message,
       (SELECT COUNT(*) FROM public.label_manager) as label_managers,
       (SELECT COUNT(*) FROM public.artist) as artists,
       (SELECT COUNT(*) FROM public.submissions) as submissions;
