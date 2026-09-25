export async function generateVideoThumbnail(file: File, opts?: { seekTo?: number; quality?: number; maxSize?: number }): Promise<Blob | null> {
  const seekTo = opts?.seekTo ?? 0.1;
  const quality = opts?.quality ?? 0.8;
  const maxSize = opts?.maxSize ?? 720;

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    let settled = false;
    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(blob);
    };

    const capture = () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return finish(null);
        const scale = Math.min(1, maxSize / Math.max(w, h));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return finish(null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => finish(b), "image/jpeg", quality);
      } catch {
        finish(null);
      }
    };

    video.addEventListener("loadeddata", () => {
      try {
        video.currentTime = Math.min(seekTo, (video.duration || 1) / 2);
      } catch {
        capture();
      }
    });
    video.addEventListener("seeked", capture);
    video.addEventListener("error", () => finish(null));

    setTimeout(() => finish(null), 8000);
  });
}
