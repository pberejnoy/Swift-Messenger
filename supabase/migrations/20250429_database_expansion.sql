-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update existing tables if needed
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  recipient_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  attachments JSONB
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  message_id UUID NOT NULL,
  message_type TEXT CHECK (message_type IN ('channel', 'direct')) NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id, message_type, emoji)
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL,
  message_type TEXT CHECK (message_type IN ('channel', 'direct')) NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) NOT NULL
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create presence table
CREATE TABLE IF NOT EXISTS public.presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('online', 'offline', 'away', 'busy')) DEFAULT 'offline',
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on new tables
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for direct_messages
CREATE POLICY "Users can view their direct messages" 
  ON public.direct_messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert direct messages" 
  ON public.direct_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their direct messages" 
  ON public.direct_messages FOR UPDATE 
  USING (auth.uid() = sender_id);

-- RLS Policies for reactions
CREATE POLICY "Users can view all reactions" 
  ON public.reactions FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their reactions" 
  ON public.reactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their reactions" 
  ON public.reactions FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments" 
  ON public.attachments FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert attachments" 
  ON public.attachments FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for user_settings
CREATE POLICY "Users can view their settings" 
  ON public.user_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their settings" 
  ON public.user_settings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their settings" 
  ON public.user_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for presence
CREATE POLICY "Users can view all presence data" 
  ON public.presence FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their presence" 
  ON public.presence FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their presence" 
  ON public.presence FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create functions and triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_channels
BEFORE UPDATE ON public.channels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_messages
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_direct_messages
BEFORE UPDATE ON public.direct_messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_user_settings
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_presence
BEFORE UPDATE ON public.presence
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user's last_seen
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_seen = NOW()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_seen_at when user sends a message
CREATE TRIGGER update_last_seen_on_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_user_last_seen();

CREATE TRIGGER update_last_seen_on_direct_message
AFTER INSERT ON public.direct_messages
FOR EACH ROW EXECUTE FUNCTION update_user_last_seen();
