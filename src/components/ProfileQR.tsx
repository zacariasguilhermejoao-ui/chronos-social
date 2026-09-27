import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share } from "@/lib/icons";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  username: string;
  displayName?: string | null;
};

export function ProfileQR({ open, onOpenChange, username, displayName }: Props) {
  const url = `${window.location.origin}/u/${username}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const download = async () => {
    setBusy(true);
    try {
      const svg = wrapRef.current?.querySelector("svg");
      if (!svg) throw new Error("no svg");
      const xml = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.src = blobUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      const size = 720;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size + 120;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 60, 60, size - 120, size - 120);
      ctx.fillStyle = "#0b0b0f";
      ctx.font = "bold 36px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`@${username}`, size / 2, size + 50);
      ctx.font = "20px system-ui, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText("chronossocial.com", size / 2, size + 90);
      const a = document.createElement("a");
      a.download = `chronos-${username}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      URL.revokeObjectURL(blobUrl);
      toast.success("QR guardado");
    } catch {
      toast.error("Falha ao guardar QR");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Perfil de ${displayName ?? username}`, text: `Vê o meu perfil na Chrónos`, url });
      } catch {
        /* user cancel */
      }
    } else {
      copy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Partilhar perfil</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div ref={wrapRef} className="bg-white p-4 rounded-2xl">
            <QRCodeSVG
              value={url}
              size={220}
              level="H"
              includeMargin={false}
              fgColor="#0b0b0f"
              bgColor="#ffffff"
            />
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-lg leading-tight">
              {displayName ?? username}
            </p>
            <p className="text-xs text-muted-foreground">@{username}</p>
          </div>
          <div className="w-full text-xs font-mono text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2 truncate">
            {url}
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={copy}>
              <Copy className="w-4 h-4 mr-1" /> Copiar
            </Button>
            <Button variant="outline" size="sm" onClick={download} disabled={busy}>
              <Download className="w-4 h-4 mr-1" /> Guardar
            </Button>
            <Button size="sm" onClick={share} className="gradient-money text-primary-foreground">
              <Share className="w-4 h-4 mr-1" /> Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
