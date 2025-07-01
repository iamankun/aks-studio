-- Alter tables to support binary image storage
-- Author: An Kun Studio Digital Music Distribution

-- START TRANSACTION
BEGIN;

-- Alter artist table to add avatar_binary column
ALTER TABLE public.artist
ADD COLUMN IF NOT EXISTS avatar_binary BYTEA,
ADD COLUMN IF NOT EXISTS avatar_mime_type VARCHAR(50);

-- Alter label_manager table to add avatar_binary column
ALTER TABLE public.label_manager
ADD COLUMN IF NOT EXISTS avatar_binary BYTEA,
ADD COLUMN IF NOT EXISTS avatar_mime_type VARCHAR(50);

-- Create function to set updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- COMMIT TRANSACTION
COMMIT;

-- Success message
SELECT 
    'Tables altered successfully to support binary image storage!' as message,
    CURRENT_TIMESTAMP as executed_at;
