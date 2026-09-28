import { useState } from "react";
import { Send } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";

export function CommentComposer({
  onSubmit,
}: {
  onSubmit: (
    payload:
      | { kind: "text"; content: string }
      | { kind: "audio"; audio_url: string; audio_path: string; audio_duration_sec: number }
  ) => Promise<void> | void;
}) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!user || !text.trim() || sending) return;
    setSending(true);
    try {
      await onSubmit({ kind: "text", content: text.trim() });
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder={user ? "Escreve um comentário…" : "Inicia sessão para comentar"}
        disabled={!user || sending}
        className="flex-1 h-10 rounded-full bg-secondary px-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />
      <button
        onClick={send}
        disabled={!user || !text.trim() || sending}
        className="w-10 h-10 rounded-full gradient-money grid place-items-center text-primary-foreground disabled:opacity-40"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
