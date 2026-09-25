import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsPage, Section, Row } from "./SettingsLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, signOut } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AccountSettings() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [emailDlg, setEmailDlg] = useState(false);
  const [phoneDlg, setPhoneDlg] = useState(false);
  const [pwDlg, setPwDlg] = useState(false);
  const [deleteDlg, setDeleteDlg] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);

  const updateEmail = async () => {
    if (!newEmail.includes("@")) return toast.error("Email inválido");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Verifica o novo email para confirmar");
    setEmailDlg(false);
  };
  const updatePhone = async () => {
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ phone: newPhone });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Telefone atualizado");
    setPhoneDlg(false);
  };
  const updatePw = async () => {
    if (newPw.length < 6) return toast.error("Mínimo 6 caracteres");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password alterada");
    setNewPw("");
    setPwDlg(false);
  };

  return (
    <SettingsPage title="Conta">
      <Section title="Perfil">
        <Row label="Editar perfil" desc="Nome, username, bio, avatar" onClick={() => navigate("/me/edit")} />
        <Row label="Username" desc={profile?.username ? `@${profile.username}` : "—"} onClick={() => navigate("/me/edit")} />
      </Section>

      <Section title="Credenciais">
        <Row
          label="Email"
          desc={user?.email ?? "Não definido"}
          onClick={() => {
            setNewEmail(user?.email ?? "");
            setEmailDlg(true);
          }}
        />
        <Row
          label="Telefone"
          desc={user?.phone ?? "Não definido"}
          onClick={() => {
            setNewPhone(user?.phone ?? "");
            setPhoneDlg(true);
          }}
        />
        <Row label="Alterar password" onClick={() => setPwDlg(true)} />
      </Section>

      <Section title="Zona de perigo">
        <Row
          label="Desativar conta"
          desc="Termina a sessão. Podes voltar a entrar."
          destructive
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        />
        <Row
          label="Eliminar conta"
          desc="Pedido permanente. Será revisto em até 30 dias."
          destructive
          onClick={() => setDeleteDlg(true)}
        />
      </Section>

      <Dialog open={emailDlg} onOpenChange={setEmailDlg}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar email</DialogTitle>
            <DialogDescription>Receberás um link de confirmação no novo email.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="ne">Novo email</Label>
          <Input id="ne" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEmailDlg(false)}>Cancelar</Button>
            <Button onClick={updateEmail} disabled={busy}>Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={phoneDlg} onOpenChange={setPhoneDlg}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar telefone</DialogTitle>
            <DialogDescription>Inclui o indicativo (ex: +244 9XX XXX XXX).</DialogDescription>
          </DialogHeader>
          <Label htmlFor="np">Novo telefone</Label>
          <Input id="np" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPhoneDlg(false)}>Cancelar</Button>
            <Button onClick={updatePhone} disabled={busy}>Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwDlg} onOpenChange={setPwDlg}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova password</DialogTitle>
            <DialogDescription>Mínimo 6 caracteres.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="npw">Nova password</Label>
          <Input id="npw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPwDlg(false)}>Cancelar</Button>
            <Button onClick={updatePw} disabled={busy}>Alterar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDlg} onOpenChange={setDeleteDlg}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar conta?</DialogTitle>
            <DialogDescription>
              Esta ação é permanente. Todos os teus vídeos, fotos e mensagens serão removidos. Para
              prosseguir, contacta o suporte em <strong>suporte@chronos.app</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDlg(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                window.location.href = "mailto:suporte@chronos.app?subject=Eliminar%20conta";
              }}
            >
              Contactar suporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsPage>
  );
}
