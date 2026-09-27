import { useParams, Navigate } from "react-router-dom";

/** Redireciona /v/:id para o player de reels com o vídeo focado. */
export default function VideoView() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" replace />;
  return <Navigate to={`/reels?v=${id}`} replace />;
}
