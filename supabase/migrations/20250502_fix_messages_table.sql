-- Ensure messages table has the correct structure
DO $$
BEGIN
    -- Check if the messages table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'messages'
    ) THEN
        -- Table exists, check if it has the required columns
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'messages' 
            AND column_name = 'user_id'
        ) THEN
            -- Add user_id column if it doesn't exist
            ALTER TABLE public.messages ADD COLUMN user_id UUID REFERENCES public.users(id);
        END IF;
        
        -- Ensure channel_id column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'messages' 
            AND column_name = 'channel_id'
        ) THEN
            -- Add channel_id column if it doesn't exist
            ALTER TABLE public.messages ADD COLUMN channel_id UUID REFERENCES public.channels(id);
        END IF;
        
        -- Ensure content column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'messages' 
            AND column_name = 'content'
        ) THEN
            -- Add content column if it doesn't exist
            ALTER TABLE public.messages ADD COLUMN content TEXT NOT NULL DEFAULT '';
        END IF;
        
        -- Ensure created_at column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'messages' 
            AND column_name = 'created_at'
        ) THEN
            -- Add created_at column if it doesn't exist
            ALTER TABLE public.messages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    ELSE
        -- Create the messages table if it doesn't exist
        CREATE TABLE public.messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            channel_id UUID REFERENCES public.channels(id),
            user_id UUID REFERENCES public.users(id),
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Ensure RLS policy exists for messages
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'messages' 
        AND schemaname = 'public' 
        AND policyname = 'Allow insert for authenticated'
    ) THEN
        -- Add RLS policy if it doesn't exist
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow insert for authenticated"
            ON public.messages
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Allow select for authenticated"
            ON public.messages
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END $$;
