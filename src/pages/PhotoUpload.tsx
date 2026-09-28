import { useNavigate } from "react-router-dom";

export default function PhotoUpload() {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto px-4 py-8 text-center space-y-4">
      <h1 className="font-display font-bold text-xl">Carregar foto</h1>
      <p className="text-sm text-muted-foreground">Usa o botão Criar na barra inferior para publicar.</p>
      <button onClick={() => navigate("/")} className="rounded-full gradient-money text-primary-foreground px-5 py-2 text-sm font-bold">
        Ir ao feed
      </button>
    </div>
  );
}
