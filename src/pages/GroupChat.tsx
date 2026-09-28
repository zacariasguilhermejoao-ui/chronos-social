import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageBubble, type ChatMessage } from "@/components/chat/MessageBubble";
import { Send, ArrowLeft } from "@/lib/icons";

export default function GroupChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!id) return;
    supabase.from("groups").select("*").eq("id", id).maybeSingle().then(({ data }) => setGroup(data));
    supabase
      .from("group_messages")
      .select("*")
      .eq("group_id", id)
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
          }))
        );
      });
  }, [id]);

  const send = async () => {
    if (!user || !id || !text.trim()) return;
    const content = text.trim();
    setText("");
    await supabase.from("group_messages").insert({ group_id: id, sender_id: user.id, content, type: "text" });
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

  return (
    <div className="flex flex-col h-[100dvh]">
      <header className="p-3 border-b border-border flex items-center gap-2">
        <button onClick={() => navigate("/groups")} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={() => navigate(`/groups/${id}/info`)} className="font-bold text-sm flex-1 text-left">
          {group?.name ?? "Grupo"}
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} own={m.sender_id === user?.id} scope="group" />
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
