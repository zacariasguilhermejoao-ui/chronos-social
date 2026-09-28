import { Smartphone, Plus } from "@/lib/icons";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function Install() {
  const ios = isIOS();
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full glass rounded-2xl border border-border p-6 space-y-4">
        <h1 className="font-display font-bold text-2xl text-center">Instalar Chrónos</h1>
        <p className="text-sm text-muted-foreground text-center">
          Adiciona a app ao ecrã inicial para uma experiência nativa.
        </p>
        {ios ? (
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 mt-0.5 shrink-0" />
              <span>1. Toca em <strong>Partilhar</strong> no Safari</span>
            </li>
            <li className="flex items-start gap-2">
              <Plus className="w-4 h-4 mt-0.5 shrink-0" />
              <span>2. Escolhe <strong>Adicionar ao ecrã principal</strong></span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Abre o menu do Chrome (⋮)</li>
            <li>2. Escolhe <strong>Instalar app</strong></li>
            <li>3. Confirma — aparece um ícone no ecrã inicial</li>
          </ol>
        )}
      </div>
    </div>
  );
}
