import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import chronosLogoAsset from "@/assets/chronos-c.png.asset.json";
import { Download, Share, Plus, Smartphone, CheckCircle2 } from "@/lib/icons";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-ignore iOS
    window.navigator.standalone === true);

export default function Install() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const installedHandler = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <img
            src={chronosLogoAsset.url}
            alt="Chrónos"
            className="w-20 h-20 rounded-2xl shadow-lg"
          />
          <h1 className="text-2xl font-bold">Instala o Chrónos</h1>
          <p className="text-sm text-muted-foreground">
            Instala a app no teu telefone para acesso rápido, ecrã cheio e
            experiência nativa.
          </p>
        </div>

        {installed ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium">App já instalada — bom uso!</p>
          </div>
        ) : deferred ? (
          <Button onClick={handleInstall} size="lg" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Instalar agora
          </Button>
        ) : isIOS() ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Instalar no iPhone:</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Share className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>1. Toca em <strong>Partilhar</strong> na barra do Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <Plus className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>2. Escolhe <strong>Adicionar ao ecrã principal</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>3. Confirma e abre o Chrónos do teu ecrã inicial</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">Instalar no Android:</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Abre o menu do Chrome (⋮)</li>
              <li>2. Escolhe <strong>Instalar app</strong> ou <strong>Adicionar ao ecrã inicial</strong></li>
              <li>3. Confirma — vai aparecer um ícone como app real</li>
            </ol>
            <p className="text-xs text-muted-foreground pt-2">
              Se não vês a opção, recarrega esta página depois de uns segundos.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          Versão app web (PWA) • Funciona offline depois de instalada
        </div>
      </Card>
    </div>
  );
}
