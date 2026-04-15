import { requiredString } from "@helpers/form-schemas-validators";
import { z } from "zod";

export const loginSchema = z.object({
<<<<<<< HEAD
  username: requiredString("Username is required!"),
  password: requiredString("Password is required!"),
=======
  u_key_auth: requiredString("Email is required!").email("Invalid email format!"),
  p_key_auth: requiredString("Password is required!"),
>>>>>>> origin/main
});
