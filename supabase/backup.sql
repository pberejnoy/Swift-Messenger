-- Backup script for Swift Messenger database
-- Run this script to create a backup of all tables

-- Users table
COPY (SELECT * FROM public.users) TO '/tmp/users_backup.csv' WITH CSV HEADER;

-- Channels table
COPY (SELECT * FROM public.channels) TO '/tmp/channels_backup.csv' WITH CSV HEADER;

-- Messages table
COPY (SELECT * FROM public.messages) TO '/tmp/messages_backup.csv' WITH CSV HEADER;

-- Direct Messages table
COPY (SELECT * FROM public.direct_messages) TO '/tmp/direct_messages_backup.csv' WITH CSV HEADER;

-- Reactions table
COPY (SELECT * FROM public.reactions) TO '/tmp/reactions_backup.csv' WITH CSV HEADER;

-- Attachments table
COPY (SELECT * FROM public.attachments) TO '/tmp/attachments_backup.csv' WITH CSV HEADER;

-- User Settings table
COPY (SELECT * FROM public.user_settings) TO '/tmp/user_settings_backup.csv' WITH CSV HEADER;

-- Presence table
COPY (SELECT * FROM public.presence) TO '/tmp/presence_backup.csv' WITH CSV HEADER;

-- Note: This script requires appropriate permissions to write to the /tmp directory
-- For production use, consider using pg_dump for a more comprehensive backup
