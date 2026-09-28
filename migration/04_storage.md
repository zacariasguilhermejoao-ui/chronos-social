# Copiar ficheiros do Storage

Buckets: fotos, vídeos, avatares, anexos de chat, áudio de comentários, downloads de reels, produtos de grupos.

## Opção recomendada — rclone

Configura dois remotes S3 (Supabase Storage é compatível S3) e sincroniza:

```bash
rclone sync old:bucket-name new:bucket-name --progress
```

Repete para cada bucket usado pela app.
