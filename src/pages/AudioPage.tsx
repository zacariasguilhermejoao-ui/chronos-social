import { useParams } from "react-router-dom";

export default function AudioPage() {
  const { id } = useParams();
  return (
    <div className="max-w-md mx-auto px-4 py-8 text-center">
      <h1 className="font-display font-bold text-xl">Áudio</h1>
      <p className="text-sm text-muted-foreground mt-2">ID: {id}</p>
    </div>
  );
}
