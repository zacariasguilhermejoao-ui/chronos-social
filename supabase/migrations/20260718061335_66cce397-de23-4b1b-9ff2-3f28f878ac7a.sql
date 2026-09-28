ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS played_at timestamptz;
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS played_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON public.messages(receiver_id, read_at) WHERE read_at IS NULL;
