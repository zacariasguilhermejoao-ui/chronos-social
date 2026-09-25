import { useState } from "react";
import { SettingsPage, Section, Row } from "./SettingsLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SecuritySettings() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const change = async () => {
    if (pw.length < 6) return toast.error("Mínimo 6 caracteres");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password alterada");
    setPw("");
    setOpen(false);
  };

  const signOutAll = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) return toast.error(error.message);
    toast.success("Sessões terminadas");
    navigate("/");
  };

  return (
    <SettingsPage title="Segurança">
      <Section title="Password">
        <Row label="Alterar password" onClick={() => setOpen(true)} />
      </Section>

      <Section title="Sessões">
        <Row
          label="Terminar todas as sessões"
          desc="Termina sessão neste e em todos os outros dispositivos"
          destructive
          onClick={signOutAll}
        />
      </Section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova password</DialogTitle>
            <DialogDescription>Mínimo 6 caracteres.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="npw">Nova password</Label>
          <Input id="npw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={change} disabled={busy}>Alterar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsPage>
  );
}
