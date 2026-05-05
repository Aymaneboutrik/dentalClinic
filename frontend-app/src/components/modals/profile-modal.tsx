import { useState } from "react";
import Text from "@components/commons/text";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import { useModal } from "@saimin/react-modal-manager";
import useAuthStore from "@stores/auth-store";
import { authService } from "@apis/services/auth";
import { userService } from "@apis/services/user";

function ProfileModal() {
  const { close } = useModal();
  const { user, clearNotification, clearPasswordResetApproved } = useAuthStore();
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    close("profile-modal");
  };

  const handlePasswordResetRequest = async () => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset();
      toast.success("Demande envoyée avec succès", {
        description:
          "L'administrateur a été notifié de votre demande de réinitialisation de mot de passe.",
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Erreur lors de l'envoi de la demande.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePasswordAfterApproval = async () => {
    if (!oldPassword) {
      toast.error("Veuillez saisir votre ancien mot de passe.");
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
      await authService.changePasswordAfterReset(oldPassword, newPassword);
      toast.success("Mot de passe modifié avec succès !");
      clearPasswordResetApproved();
      setShowChangeForm(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Erreur lors du changement de mot de passe.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissNotification = async () => {
    try {
      await userService.clearNotifications();
      clearNotification();
    } catch (error) {
      console.error("Erreur clearing notifications", error);
      // On le fait quand même côté client pour le confort au cas où
      clearNotification();
    }
  };

  const handleDoctorChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!oldPassword) {
      toast.error("Ancien mot de passe requis.");
      return;
    }
    setIsLoading(true);
    try {
      await userService.changeDoctorPassword({ oldPassword, newPassword });
      toast.success("Mot de passe modifié avec succès !");
      setShowChangeForm(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Erreur lors du changement de mot de passe.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-[400px] rounded-lg overflow-hidden bg-background p-6 shadow-xl border text-center">
        <Text size="lg" className="font-bold text-foreground mb-4">Mise à jour requise</Text>
        <p className="text-sm text-muted-foreground mb-6">
          La synchronisation de session a été mise à jour. Veuillez vous déconnecter puis vous reconnecter pour voir votre profil.
        </p>
        <Button onClick={handleClose} variant="default" className="w-full font-bold">
          Fermer
        </Button>
      </div>
    );
  }

  const initials = (user.email ? user.email.charAt(0) : "U").toUpperCase();

  return (
    <div className="w-[420px] bg-background p-8 shadow-2xl border-white/5 organic-card-reverse">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shadow-sm">
          {initials}
        </div>
        
        <div className="text-center">
          <Text size="xl" className="font-bold text-foreground">
            {user.email || "Email non synchronisé (Reconnexion requise)"}
          </Text>
          <div className="mt-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-6 py-2 organic-pill inline-block border border-primary/10">
            {user.role}
          </div>
        </div>

        <div className="w-full pt-4 space-y-3 border-t mt-4">
          <div className="flex justify-between items-center p-4 bg-secondary/30 organic-pill border border-white/5">
            <span className="text-muted-foreground text-sm font-medium">Statut du compte</span>
            <span className="text-emerald-600 font-bold text-sm flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Actif
            </span>
          </div>

          {user.role === "Dentiste" ? (
            <div className="mt-6 border-t pt-4">
              <Text className="text-sm font-bold text-foreground mb-3">Modifier mon mot de passe</Text>
              {!showChangeForm ? (
                <Button 
                  onClick={() => setShowChangeForm(true)}
                  variant="outline" 
                  className="w-full font-bold"
                >
                  Changer le mot de passe
                </Button>
              ) : (
                <div className="space-y-3 bg-secondary/20 p-3 rounded-lg border">
                  <Input type="password" placeholder="Mot de passe actuel" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                  <Input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <Input type="password" placeholder="Confirmer" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={handleDoctorChangePassword} disabled={isLoading} className="flex-1 font-bold">
                      {isLoading ? "Envoi..." : "Valider"}
                    </Button>
                    <Button onClick={() => setShowChangeForm(false)} variant="outline" className="font-bold">Annuler</Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <Text className="text-sm font-bold text-foreground uppercase tracking-wider">Sécurité & Accès</Text>
              </div>

              {/* Bloc Unifié de Réinitialisation */}
              <div className="bg-secondary/20 rounded-2xl p-5 border border-border/50 space-y-4">
                
                {/* 1. Cas où une demande est déjà approuvée -> Formulaire final */}
                {user.passwordResetApproved ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mb-2">
                       <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                       <Text className="text-[11px] font-bold text-emerald-700 uppercase tracking-tight">Demande approuvée : Définissez votre code</Text>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Ancien mot de passe</label>
                        <Input
                          type="password"
                          placeholder="Saisissez votre ancien code"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="bg-background/50 h-11"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nouveau mot de passe</label>
                        <Input
                          type="password"
                          placeholder="Minimum 8 caractères"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-background/50 h-11"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Confirmer le nouveau code</label>
                        <Input
                          type="password"
                          placeholder="Répétez le nouveau code"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-background/50 h-11"
                        />
                      </div>

                      <Button
                        onClick={() => handleChangePasswordAfterApproval()}
                        disabled={isLoading}
                        className="w-full font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10 mt-2"
                      >
                        {isLoading ? "Application..." : "Mettre à jour mon accès"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 2. Cas de demande en cours ou pas encore faite */
                  <div className="space-y-3">
                    {user.notification ? (
                      <div className="text-center space-y-3 py-2">
                        <Text className="text-xs text-blue-600 font-medium">{user.notification}</Text>
                        <Button 
                          onClick={handleDismissNotification} 
                          variant="ghost" 
                          size="sm" 
                          className="text-[10px] h-7 hover:bg-blue-500/5 text-blue-400"
                        >
                          Ignorer cette notification
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4 py-2">
                        <Text className="text-xs text-muted-foreground leading-relaxed">
                          Pour changer votre mot de passe, vous devez envoyer une demande de réinitialisation au Dentiste.
                        </Text>
                        <Button 
                          onClick={handlePasswordResetRequest} 
                          disabled={isLoading}
                          className="w-full font-bold h-11 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                          {isLoading ? "Envoi de la demande..." : "Demander une réinitialisation"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 px-8 pb-8">
        <Button onClick={handleClose} variant="default" className="w-full organic-button font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl transition-all duration-300">
          Fermer
        </Button>
      </div>
    </div>
  );
}

export default ProfileModal;
