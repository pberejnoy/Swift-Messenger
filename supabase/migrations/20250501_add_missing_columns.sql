-- Add is_edited column to messages table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'messages'
        AND column_name = 'is_edited'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add is_edited column to direct_messages table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'direct_messages'
        AND column_name = 'is_edited'
    ) THEN
        ALTER TABLE public.direct_messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add any other missing columns here if needed
