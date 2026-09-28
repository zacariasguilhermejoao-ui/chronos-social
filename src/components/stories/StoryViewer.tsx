import { X } from "@/lib/icons";

export function StoryViewer({
  userId,
  users,
  onChangeUser,
  onClose,
}: {
  userId: string;
  users: string[];
  onChangeUser: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <header className="flex items-center justify-between p-4 safe-top">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <span className="text-white text-sm">{users.indexOf(userId) + 1}/{users.length}</span>
        <span className="w-10" />
      </header>
      <div className="flex-1 grid place-items-center text-white/70 text-sm">
        História de {userId.slice(0, 8)}…
      </div>
    </div>
  );
}
