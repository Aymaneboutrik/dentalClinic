import Center from "@components/commons/center";
import { Outlet } from "react-router-dom";
import { Header } from "./components";
import useUnauth from "@hooks/use-unauth";

function AuthLayout() {
  useUnauth();

  return (
<<<<<<< HEAD
    <div className="w-full h-[100vh] p-4">
=======
    <div className="relative w-full h-[100vh] p-4">

>>>>>>> origin/main
      <Center>
        <Header />
        <Outlet />
      </Center>
    </div>
  );
}

export default AuthLayout;
