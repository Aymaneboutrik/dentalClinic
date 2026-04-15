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
        toast.info("Le traitement prend un peu de temps... Veuillez patienter.");
      } else {
        toast.error(error.response?.data?.message || "Erreur de réinitialisation.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: FormType) {
    setIsLoading(true);

    const apiValues = {
      email: values.u_key_auth,
      password: values.p_key_auth,
    };

    try {
      const response = await authService.login(apiValues);

      login({ ...response, email: apiValues.email });

      if (response.notification) {
        toast.info(response.notification);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Erreur de connexion";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">

      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[600px] px-6">

        <div className="glass rounded-[2rem] px-24 py-12 shadow-2xl space-y-6">

          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-10 h-10 text-primary-foreground" />
            </div>

            <h1 className="text-3xl font-bold">Dental Clinic</h1>

            <p className="text-muted-foreground text-sm">
              Gestion intelligente & Dossier Patient Digital
            </p>
          </div>

          {!showForgotPassword ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="space-y-4">

                  <TextInput
                    label="Email"
                    placeholder=""
                    name="u_key_auth"
                    form={form}
                    withAsterisk
                    autoComplete="off"
                  />

                  <PasswordInput
                    label="Mot de passe"
                    placeholder=""
                    name="p_key_auth"
                    form={form}
                    withAsterisk
                    autoComplete="off"
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-primary"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <Button type="submit" fullWidth disabled={isLoading}>
                  {isLoading ? "Connexion..." : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      {t("login.login")}
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">

              <Input
                type="email"
                placeholder="dentiste@clinic.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />

              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? "Envoi..." : (
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Recevoir le lien
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm flex items-center justify-center w-full text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour
              </button>

            </form>
          )}

        </div>

        <p className="text-center mt-6 text-xs text-muted-foreground">
          Powered by Dental Clinic Secure Engine
        </p>

      </div>
    </div>
  );
}