import { Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function Admin() {
  const { isAdmin, loading } = useIsAdmin();
  if (loading) return <div className="p-8 text-center text-muted-foreground">A carregar…</div>;
  if (!isAdmin) return <div className="p-8 text-center">Acesso restrito</div>;

  const links = [
    { to: "/admin/moderation", label: "Moderação" },
    { to: "/admin/payouts", label: "Levantamentos" },
    { to: "/admin/ads", label: "Anúncios" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
      <h1 className="font-display font-extrabold text-2xl">Admin</h1>
      {links.map((l) => (
        <Link key={l.to} to={l.to} className="block glass rounded-xl border border-border p-4 font-semibold press">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
