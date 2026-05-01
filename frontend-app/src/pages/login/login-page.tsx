import React from "react";
import { Form } from "@components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./schemas/login-schema";
import TextInput from "@components/inputs/text-input";
import PasswordInput from "@components/inputs/password-input";
import { Button } from "@components/ui/button";
import useAuthOperations from "@hooks/use-auth-operations";
import { authService } from "@apis/services/auth";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Stethoscope, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { Input } from "@components/ui/input";


type FormType = {
  u_key_auth: string;
  p_key_auth: string;
};

export function Login() {
  const { login } = useAuthOperations();
  const { t } = useTranslation();
  const form = useForm<FormType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      u_key_auth: "",
      p_key_auth: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      toast.error("Veuillez entrer votre adresse e-mail");
      return;
    }
    setIsLoading(true);
    try {
      const resp = await authService.forgotPasswordEmail(recoveryEmail);
      const message = resp.message || "Demande traitée avec succès.";
      
      if (message.includes("réservée au Dentiste")) {
        toast.info(message, { duration: 6000 });
      } else {
        toast.success(message);
      }
      setShowForgotPassword(false);
    } catch (error: any) {
      if (error.code === "ECONNABORTED" || !error.response) {
        toast.info("Le traitement prend un peu de temps... Veuillez patienter quelques instants.");
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la demande de réinitialisation.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  async function onSubmit(values: FormType) {
    setIsLoading(true);
    
    // Map back to API format and trim
    const apiValues = {
      email: values.u_key_auth.trim(),
      password: values.p_key_auth
    };

    console.log("Tentative de connexion avec:", JSON.stringify(apiValues));

    try {
      const response = await authService.login(apiValues);
      // Inject the entered email to ensure it's available for the UI
      login({ ...response, email: apiValues.email });
      if (response.notification) {
        toast.info(response.notification);
      }
    } catch (error: any) {
      console.error("Login Error Details:", error.response?.data);
      const backendMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;
      
      let message = backendMessage || "Erreur de connexion";
      
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        if (Array.isArray(firstError)) message = firstError[0];
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">


      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[600px] px-6">
        <div className="glass rounded-[2rem] px-24 py-12 shadow-2xl glow-blue space-y-6">





          {/* Header/Branding */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Stethoscope className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dental Clinic
              </h1>
              <p className="text-muted-foreground mt-2 text-sm font-medium">
                Gestion intelligente & Dossier Patient Digital
              </p>

            </div>
          </div>

          {!showForgotPassword ? (
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-6"
                autoComplete="off"
              >
                {/* "Anti-Autofill" Ultimate Hack: Decoy inputs with absolute positioning to fool the browser */}
                <div style={{ position: 'absolute', top: '-1000px', left: '-1000px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                  <input type="text" name="decoy_user" tabIndex={-1} autoComplete="off" />
                  <input type="password" name="decoy_pass" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="space-y-4">
                  <TextInput
                    label={<span>E&nbsp;m&nbsp;a&nbsp;i&nbsp;l</span>}
                    placeholder=" "
                    name="u_key_auth"
                    withAsterisk
                    form={form}
                    autoComplete="off"
                    className="bg-background/50 border-white/5 h-12 rounded-xl focus:ring-primary"
                  />

                  <PasswordInput
                    label={<span>M&nbsp;o&nbsp;t&nbsp;d&nbsp;e&nbsp;p&nbsp;a&nbsp;s&nbsp;s&nbsp;e</span>}
                    placeholder=" "
                    name="p_key_auth"
                    withAsterisk
                    form={form}
                    autoComplete="new-password"
                    className="bg-background/50 border-white/5 h-12 rounded-xl focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <input type="checkbox" className="rounded border-white/10 bg-white/5" />
                    <span>Se souvenir de moi</span>
                  </label>
                  <button type="button" onClick={() => setShowForgotPassword(true)} className="text-primary hover:underline font-medium">
                    Mot de passe oublié ?
                  </button>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Identification...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span>{t("login.login")}</span>
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">{t("login.email")}</label>
                  <Input
                    placeholder="dentiste@clinic.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    type="email"
                    autoComplete="off"
                    className="bg-background/50 border-white/5 h-12 rounded-xl focus:ring-primary w-full"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">
                {isLoading ? "Envoi..." : (
                  <span className="flex items-center justify-center w-full"><Mail className="w-4 h-4 mr-2" /> Recevoir le lien</span>
                )}
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setShowForgotPassword(false)} className="text-sm text-muted-foreground hover:text-foreground flex justify-center w-full items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la connexion
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Helper info for testing */}

        <p className="text-center mt-8 text-[11px] text-muted-foreground/20 font-bold uppercase tracking-[0.3em]">
          Powered by Dental Clinic Secure Engine
        </p>


      </div>
    </div>
  );
}

