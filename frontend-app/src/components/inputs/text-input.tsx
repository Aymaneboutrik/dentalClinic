<<<<<<< HEAD
=======
import React from "react";
>>>>>>> origin/main
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";

interface Props {
<<<<<<< HEAD
  label?: string;
=======
  label?: React.ReactNode;
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
}


>>>>>>> origin/main
function TextInput({
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
}: Props) {

>>>>>>> origin/main
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {(label || withAsterisk) && (
            <FormLabel className="flex items-center gap-1">
              {label}{" "}
              {withAsterisk && <span className="mt-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
<<<<<<< HEAD
            <Input placeholder={placeholder} {...field} />
          </FormControl>

=======
            <Input 
              placeholder={placeholder} 
              className={className} 
              autoComplete={autoComplete}
              {...field} 
            />
          </FormControl>


>>>>>>> origin/main
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default TextInput;
