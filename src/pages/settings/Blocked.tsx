import { useNavigate } from "react-router-dom";
import { SettingsPage, Section } from "./SettingsLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { useBlockedList } from "@/hooks/useBlock";
import { toast } from "sonner";

export default function BlockedSettings() {
  const { rows, loading, unblock } = useBlockedList();
  const navigate = useNavigate();

  return (
    <SettingsPage title="Bloqueados">
      <Section
        title="Utilizadores bloqueados"
        desc="Pessoas bloqueadas não te podem seguir, enviar mensagens, comentar nem reagir ao teu conteúdo."
      >
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">A carregar…</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Ainda não bloqueaste ninguém.</div>
        ) : (
          <ul>
            {rows.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                <button onClick={() => navigate(`/u/${p.username}`)} className="shrink-0">
                  <UserAvatar userId={p.id} fallbackUrl={p.avatar_url} fallbackName={p.display_name} size={44} />
                </button>
                <p className="flex-1 min-w-0 truncate text-[15px] font-semibold">{p.display_name}</p>
                <button
                  onClick={async () => {
                    await unblock(p.id);
                    toast.success("Desbloqueado");
                  }}
                  className="shrink-0 h-9 px-4 rounded-full bg-secondary text-foreground text-[13px] font-bold"
                >
                  Desbloquear
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </SettingsPage>
  );
}
