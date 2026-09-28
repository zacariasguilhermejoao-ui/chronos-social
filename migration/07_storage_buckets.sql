-- =====================================================================
-- CHRÓNOS SOCIAL — RECRIAÇÃO COMPLETA DO STORAGE (buckets + políticas)
-- Executar UMA vez no Supabase > SQL Editor.
-- Não altera tabelas, dados, utilizadores nem autenticação.
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('avatars',           'avatars',           true,  NULL),
  ('photos',            'photos',            true,  NULL),
  ('videos',            'videos',            true,  NULL),
  ('group-photos',      'group-photos',      true,  NULL),
  ('marketplace',       'marketplace',       true,  NULL),
  ('page-media',        'page-media',        true,  NULL),
  ('chat-attachments',  'chat-attachments',  false, 10485760),
  ('group-attachments', 'group-attachments', false, NULL),
  ('comment-audio',     'comment-audio',     false, 4194304),
  ('reel-downloads',    'reel-downloads',    false, NULL),
  ('payout-receipts',   'payout-receipts',   false, NULL)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit;

-- AVATARS
DROP POLICY IF EXISTS "avatars_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own"   ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- PHOTOS
DROP POLICY IF EXISTS "photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "photos_insert_own"  ON storage.objects;
DROP POLICY IF EXISTS "photos_update_own"  ON storage.objects;
DROP POLICY IF EXISTS "photos_delete_own"  ON storage.objects;
CREATE POLICY "photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "photos_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "photos_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "photos_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- VIDEOS
DROP POLICY IF EXISTS "videos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "videos_insert_own"  ON storage.objects;
DROP POLICY IF EXISTS "videos_update_own"  ON storage.objects;
DROP POLICY IF EXISTS "videos_delete_own"  ON storage.objects;
CREATE POLICY "videos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "videos_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "videos_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "videos_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- GROUP-PHOTOS
DROP POLICY IF EXISTS "group_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "group_photos_insert_own"  ON storage.objects;
DROP POLICY IF EXISTS "group_photos_update_own"  ON storage.objects;
DROP POLICY IF EXISTS "group_photos_delete_own"  ON storage.objects;
CREATE POLICY "group_photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'group-photos');
CREATE POLICY "group_photos_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'group-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "group_photos_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'group-photos' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'group-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "group_photos_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'group-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- MARKETPLACE
DROP POLICY IF EXISTS "marketplace_public_read" ON storage.objects;
DROP POLICY IF EXISTS "marketplace_insert_own"  ON storage.objects;
DROP POLICY IF EXISTS "marketplace_update_own"  ON storage.objects;
DROP POLICY IF EXISTS "marketplace_delete_own"  ON storage.objects;
CREATE POLICY "marketplace_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace');
CREATE POLICY "marketplace_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'marketplace' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "marketplace_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'marketplace' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'marketplace' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "marketplace_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'marketplace' AND (storage.foldername(name))[1] = auth.uid()::text);

-- PAGE-MEDIA
DROP POLICY IF EXISTS "page_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "page_media_insert_own"  ON storage.objects;
DROP POLICY IF EXISTS "page_media_update_own"  ON storage.objects;
DROP POLICY IF EXISTS "page_media_delete_own"  ON storage.objects;
CREATE POLICY "page_media_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'page-media');
CREATE POLICY "page_media_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'page-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "page_media_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'page-media' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'page-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "page_media_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'page-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- CHAT-ATTACHMENTS (private)
DROP POLICY IF EXISTS "chat_attachments_select_own" ON storage.objects;
DROP POLICY IF EXISTS "chat_attachments_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "chat_attachments_update_own" ON storage.objects;
DROP POLICY IF EXISTS "chat_attachments_delete_own" ON storage.objects;
CREATE POLICY "chat_attachments_select_own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "chat_attachments_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "chat_attachments_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "chat_attachments_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- GROUP-ATTACHMENTS
DROP POLICY IF EXISTS "group_attachments_select" ON storage.objects;
DROP POLICY IF EXISTS "group_attachments_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "group_attachments_update_own" ON storage.objects;
DROP POLICY IF EXISTS "group_attachments_delete_own" ON storage.objects;
CREATE POLICY "group_attachments_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'group-attachments');
CREATE POLICY "group_attachments_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'group-attachments' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "group_attachments_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'group-attachments' AND (storage.foldername(name))[2] = auth.uid()::text) WITH CHECK (bucket_id = 'group-attachments' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "group_attachments_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'group-attachments' AND (storage.foldername(name))[2] = auth.uid()::text);

-- COMMENT-AUDIO
DROP POLICY IF EXISTS "comment_audio_read_authed" ON storage.objects;
DROP POLICY IF EXISTS "comment_audio_insert_own"  ON storage.objects;
DROP POLICY IF EXISTS "comment_audio_update_own"  ON storage.objects;
DROP POLICY IF EXISTS "comment_audio_delete_own"  ON storage.objects;
CREATE POLICY "comment_audio_read_authed" ON storage.objects FOR SELECT TO authenticated, anon USING (bucket_id = 'comment-audio');
CREATE POLICY "comment_audio_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'comment-audio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "comment_audio_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'comment-audio' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'comment-audio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "comment_audio_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'comment-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- REEL-DOWNLOADS
DROP POLICY IF EXISTS "reel downloads readable by authenticated" ON storage.objects;
CREATE POLICY "reel downloads readable by authenticated" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'reel-downloads');

-- PAYOUT-RECEIPTS
DROP POLICY IF EXISTS "payout_receipts_select_own" ON storage.objects;
CREATE POLICY "payout_receipts_select_own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payout-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

SELECT id, public, file_size_limit FROM storage.buckets ORDER BY id;
