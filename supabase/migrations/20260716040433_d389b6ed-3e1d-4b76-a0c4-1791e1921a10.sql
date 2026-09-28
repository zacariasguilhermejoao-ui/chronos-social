CREATE OR REPLACE FUNCTION public.follow_page(p_page_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  INSERT INTO public.page_followers(page_id, user_id) VALUES (p_page_id, auth.uid())
  ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.unfollow_page(p_page_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  DELETE FROM public.page_followers WHERE page_id = p_page_id AND user_id = auth.uid();
END $$;

CREATE OR REPLACE FUNCTION public.page_stats(p_page_id UUID)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'followers', (SELECT COUNT(*) FROM public.page_followers WHERE page_id = p_page_id),
    'videos', (SELECT COUNT(*) FROM public.videos WHERE page_id = p_page_id),
    'photos', (SELECT COUNT(*) FROM public.photos WHERE page_id = p_page_id),
    'total_views', (SELECT COALESCE(SUM(views_count),0) FROM public.videos WHERE page_id = p_page_id)
  );
$$;
