import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import { MessageBubble, type ChatMessage } from "@/components/chat/MessageBubble";
import { Send } from "@/lib/icons";

export default function Messages() {
  const { user } = useAuth();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("messages")
      .select("id, sender_id, receiver_id, content, created_at, read_at")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        // Group by peer
        const map = new Map<string, any>();
        for (const m of data ?? []) {
          const peer = m.sender_id === user.id ? m.receiver_id : m.sender_id;
          if (!map.has(peer)) map.set(peer, { peer, last: m });
        }
        setThreads([...map.values()]);
      });
  }, [user]);

  useEffect(() => {
    if (!user || !threadId) return;
    supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${threadId}),and(sender_id.eq.${threadId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        setMessages(
          (data ?? []).map((m: any) => ({
            id: m.id,
            type: m.type ?? "text",
            content: m.content,
            file_url: m.file_url,
            file_name: m.file_name,
            file_size: m.file_size,
            file_mime: m.file_mime,
            sender_id: m.sender_id,
            created_at: m.created_at,
            read_at: m.read_at,
            played_at: m.played_at,
          }))
        );
      });
  }, [user, threadId]);

  const send = async () => {
    if (!user || !threadId || !text.trim()) return;
    const content = text.trim();
    setText("");
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: threadId,
      content,
      type: "text",
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        type: "text",
        content,
        file_url: null,
        file_name: null,
        file_size: null,
        file_mime: null,
        sender_id: user.id,
        created_at: new Date().toISOString(),
        status: "sent",
      },
    ]);
  };

  if (threadId) {
    return (
      <div className="flex flex-col h-[100dvh]">
        <header className="p-3 border-b border-border font-bold text-sm">Conversa</header>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m) => (
            <MessageBubble key={m.id} m={m} own={m.sender_id === user?.id} />
          ))}
        </div>
        <div className="p-3 border-t border-border flex gap-2 safe-bottom">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 h-10 rounded-full bg-secondary px-4 text-sm outline-none"
            placeholder="Mensagem…"
          />
          <button onClick={send} className="w-10 h-10 rounded-full gradient-money grid place-items-center text-primary-foreground">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-3 space-y-2">
      <h1 className="font-display font-extrabold text-xl mb-2">Mensagens</h1>
      {threads.length === 0 && <p className="text-sm text-muted-foreground">Sem conversas ainda</p>}
      {threads.map((t) => (
        <button
          key={t.peer}
          onClick={() => navigate(`/messages/${t.peer}`)}
          className="w-full flex items-center gap-3 glass rounded-xl border border-border p-3 text-left press"
        >
          <UserAvatar userId={t.peer} size={44} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{t.peer.slice(0, 8)}…</p>
            <p className="text-xs text-muted-foreground truncate">{t.last?.content}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
