import { requiredString } from "@helpers/form-schemas-validators";
import { z } from "zod";

export const loginSchema = z.object({
  u_key_auth: requiredString("Email is required!")
    .email("Invalid email format!"),
  p_key_auth: requiredString("Password is required!"),
});