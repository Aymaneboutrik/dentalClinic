import React from "react";
import logoLoginSrc from "../../assets/images/logo_64x64.svg";
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#081028]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-[500px] px-6 animate-fade-in-up">
        <div className="glass organic-card p-10 sm:p-14 shadow-2xl border border-white/10 relative overflow-hidden group">
          
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Header/Branding */}
          <div className="flex flex-col items-center text-center space-y-5 mb-10 relative z-10">
            <div className="flex items-center justify-center drop-shadow-[0_0_25px_rgba(34,211,238,0.3)] w-[200px] sm:w-[250px] h-auto">
              <img
                src={logoLoginSrc}
                alt="Dental Clinic Large Logo"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {!showForgotPassword ? (
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-6 relative z-10"
                autoComplete="off"
              >
                {/* "Anti-Autofill" Ultimate Hack: Decoy inputs with absolute positioning to fool the browser */}
                <div style={{ position: 'absolute', top: '-1000px', left: '-1000px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                  <input type="text" name="decoy_user" tabIndex={-1} autoComplete="off" />
                  <input type="password" name="decoy_pass" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="space-y-5">
                  <div className="organic-pill bg-white/5 border border-white/10 p-2 focus-within:border-cyan-400/50 focus-within:bg-white/10 transition-all duration-300">
                    <TextInput
                      label={<span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-4">Email</span>}
                      placeholder="votre@email.com"
                      name="u_key_auth"
                      withAsterisk
                      form={form}
                      autoComplete="off"
                      disableAutofill
                      className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 px-4 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="organic-pill bg-white/5 border border-white/10 p-2 focus-within:border-cyan-400/50 focus-within:bg-white/10 transition-all duration-300">
                    <PasswordInput
                      label={<span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-4">Mot de passe</span>}
                      placeholder="••••••••"
                      name="p_key_auth"
                      withAsterisk
                      form={form}
                      autoComplete="new-password"
                      className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 px-4 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-2 mt-2">
                  <label className="flex items-center space-x-2 text-slate-400 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" className="rounded-sm border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-[#081028]" />
                    <span className="font-medium">Se souvenir de moi</span>
                  </label>
                  <button type="button" onClick={() => setShowForgotPassword(true)} className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold transition-colors">
                    Mot de passe oublié ?
                  </button>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  disabled={isLoading}
                  className="organic-button w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 mt-8"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authentification...</span>
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
            <form onSubmit={handleForgotPassword} className="space-y-6 relative z-10 animate-fade-in-up">
              <div className="space-y-5">
                <div className="organic-pill bg-white/5 border border-white/10 p-2 focus-within:border-cyan-400/50 focus-within:bg-white/10 transition-all duration-300">
                  <label className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-4 block mb-1">Email de récupération</label>
                  <Input
                    placeholder="dentiste@clinic.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    type="email"
                    autoComplete="off"
                    className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 px-4 placeholder:text-slate-600 w-full h-10"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="organic-button w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300">
                {isLoading ? "Envoi en cours..." : (
                  <span className="flex items-center justify-center w-full"><Mail className="w-5 h-5 mr-2" /> Recevoir le lien</span>
                )}
              </Button>
              <div className="text-center mt-6">
                <button type="button" onClick={() => setShowForgotPassword(false)} className="text-xs font-bold text-slate-400 hover:text-cyan-400 flex justify-center w-full items-center transition-colors uppercase tracking-wider">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la connexion
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Helper info */}
        <p className="text-center mt-8 text-[9px] text-white/30 font-black uppercase tracking-[0.4em] drop-shadow-md">
          Powered by Dental Clinic Secure Engine
        </p>
      </div>
    </div>
  );
}

