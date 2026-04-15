// import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { REFRESH_TOKEN, TOKEN } from "@configs/vars";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
=======
import useAuthStore from "@stores/auth-store";
>>>>>>> origin/main

/**
 * useAuthOperations hook that provides authentication & authorization methods
 */
const useAuthOperations = () => {
  const navigate = useNavigate();
<<<<<<< HEAD

  function login(value: Record<string, string>) {
    Cookie.set(TOKEN, value.token);
    Cookie.set(REFRESH_TOKEN, value.refreshToken);
    navigate("/");
  }

  function logout() {
    Cookie.remove(TOKEN);
    Cookie.remove(REFRESH_TOKEN);
=======
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  function login(value: any) {
    // Save token with security flags
    Cookie.set(TOKEN, value.token, { 
      sameSite: 'strict', 
      secure: window.location.protocol === 'https:' 
    });
    
    // Save user info to Zustand store
    storeLogin({
      nom: value.nom,
      prenom: value.prenom,
      role: value.role,
      email: value.email,
      notification: value.notification,
      passwordResetApproved: value.passwordResetApproved || false,
    });

    // Redirection intelligente selon le rôle
    if (value.role === "Secretaire") {
      navigate("/secretaire");
    } else if (value.role === "Assistant" || value.role === "Assistante") {
      navigate("/assistant");
    } else {
      navigate("/doctor");
    }
  }


  function logout() {
    Cookie.remove(TOKEN);
    Cookie.remove(REFRESH_TOKEN);
    storeLogout();
>>>>>>> origin/main
    navigate("/auth/login");
  }

  return { login, logout };
};

export default useAuthOperations;
