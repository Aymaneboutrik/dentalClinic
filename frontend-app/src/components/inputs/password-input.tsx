import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Eye, EyeOff } from "lucide-react";
<<<<<<< HEAD
import { useState } from "react";

interface Props {
  label?: string;
=======
import { useState, useMemo, ReactNode } from "react";
import { PasswordStrengthMeter } from "@components/commons/PasswordStrengthMeter";

interface Props {
  label?: ReactNode;
>>>>>>> origin/main
  placeholder?: string;
  description?: string;
  withAsterisk?: boolean;
  name: string;
  form?: any;
<<<<<<< HEAD
}

=======
  className?: string;
  autoComplete?: string;
  showStrength?: boolean;
}


>>>>>>> origin/main
function PasswordInput({
  label,
  placeholder,
  description,
  withAsterisk = false,
  name,
  form,
<<<<<<< HEAD
}: Props) {
=======
  className,
  autoComplete,
  showStrength = false,
}: Props) {

  const [isReadOnly, setIsReadOnly] = useState(true);
>>>>>>> origin/main
  const [visiblePassword, setVisiblePassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setVisiblePassword((prev) => !prev);
  };

<<<<<<< HEAD
=======
  const stableId = useMemo(() => {
    const randomSuffix = Math.random().toString(36).slice(2, 7);
    return form?.id ? `${form.id}_${name}_${randomSuffix}` : `v_${name}_${randomSuffix}`;
  }, [form?.id, name]);

>>>>>>> origin/main
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {(label || withAsterisk) && (
            <FormLabel
              htmlFor={form.id + name}
              className="flex items-center gap-1"
            >
              {label}
              {withAsterisk && <span className="mt-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative flex items-center justify-between">
              <div
                onClick={togglePasswordVisibility}
<<<<<<< HEAD
                className="cursor-pointer flex items-center justify-center h-full px-4 border-l absolute right-0"
              >
                {!visiblePassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </div>
              <Input
                id={form.id + name}
                type={visiblePassword ? "text" : "password"}
                placeholder={placeholder}
                {...field}
              />
            </div>
          </FormControl>

=======
                className="absolute right-0 z-10 flex items-center justify-center h-full px-4 border-l cursor-pointer"
              >
                {!visiblePassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <Input
                {...field}
                id={stableId}
                type={isReadOnly ? "text" : (visiblePassword ? "text" : "password")}
                placeholder={placeholder}
                  className={className}
                autoComplete={autoComplete}
                readOnly={isReadOnly}
                
                onFocus={() => {
                    setIsReadOnly(false);
                }}
              onBlur={() => {
                setIsReadOnly(true);
                field.onBlur();
              }}
              />

            </div>
          </FormControl>

          {showStrength && (
            <PasswordStrengthMeter password={field.value ?? ""} />
          )}

>>>>>>> origin/main
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default PasswordInput;
