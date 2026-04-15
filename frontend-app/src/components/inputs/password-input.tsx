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
import { useState, ReactNode, useMemo } from "react";
import { PasswordStrengthMeter } from "@components/commons/PasswordStrengthMeter";

interface Props {
  label?: ReactNode;
  placeholder?: string;
  description?: string;
  withAsterisk?: boolean;
  name: string;
  form?: any;
  className?: string;
  autoComplete?: string;
  showStrength?: boolean;
}

function PasswordInput({
  label,
  placeholder,
  description,
  withAsterisk = false,
  name,
  form,
  className,
  autoComplete,
  showStrength = false,
}: Props) {
  const [visiblePassword, setVisiblePassword] = useState(false);

  const stableId = useMemo(() => {
    const suffix = Math.random().toString(36).slice(2, 7);
    return form?.id ? `${form.id}_${name}_${suffix}` : `pwd_${name}_${suffix}`;
  }, [form?.id, name]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {(label || withAsterisk) && (
            <FormLabel className="flex items-center gap-1" htmlFor={stableId}>
              {label}
              {withAsterisk && (
                <span className="mt-1 text-destructive">*</span>
              )}
            </FormLabel>
          )}

          <FormControl>
            <div className="relative">
              <Input
                {...field}
                id={stableId}
                type={visiblePassword ? "text" : "password"}
                placeholder={placeholder}
                className={className}
                autoComplete={autoComplete}   // ✅ FIX ICI
              />

              <div
                onClick={() => setVisiblePassword((v) => !v)}
                className="absolute right-0 top-0 h-full px-4 flex items-center cursor-pointer"
              >
                {visiblePassword ? (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </FormControl>

          {showStrength && (
            <PasswordStrengthMeter password={field.value ?? ""} />
          )}

          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default PasswordInput;