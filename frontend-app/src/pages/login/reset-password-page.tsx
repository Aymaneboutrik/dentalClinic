import { useState } from "react";
import { authService } from "@apis/services/auth";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Lien de réinitialisation invalide ou manquant.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const resp = await authService.resetPasswordWithToken(token, newPassword);
      toast.success(resp.message || "Mot de passe réinitialisé avec succès.");
      navigate("/auth/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 text-center">
        <div>
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Lien invalide</h1>
          <p className="text-muted-foreground mb-6">Le token de réinitialisation est introuvable.</p>
          <Button onClick={() => navigate("/auth/login")}>Retour à la connexion</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[500px] px-6">
        <div className="glass rounded-[2rem] px-10 py-12 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Nouveau mot de passe
              </h1>
              <p className="text-muted-foreground mt-2 text-sm font-medium">
                Veuillez sécuriser votre compte Dentiste
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Nouveau mot de passe</label>
                <Input
                  type="password"
                  placeholder="Minimum 8 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="bg-background/50 border-white/5 h-12 rounded-xl focus:ring-emerald-500 w-full"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Confirmer le mot de passe</label>
                <Input
                  type="password"
                  placeholder="Confirmez"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="bg-background/50 border-white/5 h-12 rounded-xl focus:ring-emerald-500 w-full"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              {isLoading ? "Enregistrement..." : "Sauvegarder et se connecter"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
