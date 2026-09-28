DROP POLICY IF EXISTS "videos_select_all_auth" ON public.videos;
CREATE POLICY "videos_select_public" ON public.videos FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_select_all_auth" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (video_id, user_id)
);
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_likes_select_public" ON public.video_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "video_likes_insert_own" ON public.video_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "video_likes_delete_own" ON public.video_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
