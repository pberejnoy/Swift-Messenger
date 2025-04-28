-- Create message_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- Add parent_id column to messages table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN parent_id UUID REFERENCES public.messages(id);
  END IF;
END $$;

-- Enable RLS on message_reactions table
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for message_reactions
CREATE POLICY "Users can view all message reactions" 
  ON public.message_reactions FOR SELECT 
  USING (true);

CREATE POLICY "Users can add their own reactions" 
  ON public.message_reactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
  ON public.message_reactions FOR DELETE 
  USING (auth.uid() = user_id);
