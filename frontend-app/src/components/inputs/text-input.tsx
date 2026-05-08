import React from "react";
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
  label?: React.ReactNode;
  placeholder?: string;
  description?: string;
  withAsterisk?: boolean;
  name: string;
  form?: any;
  className?: string;
  autoComplete?: string;
  disableAutofill?: boolean;
}


function TextInput({
  label,
  placeholder,
  description,
  withAsterisk = false,
  name,
  form,
  className,
  autoComplete,
  disableAutofill = false,
}: Props) {
  const [isReadOnly, setIsReadOnly] = React.useState(disableAutofill);
  
  const stableId = React.useMemo(() => {
    if (!disableAutofill) return undefined;
    const randomSuffix = Math.random().toString(36).slice(2, 7);
    return form?.id ? `${form.id}_${name}_${randomSuffix}` : `v_${name}_${randomSuffix}`;
  }, [form?.id, name, disableAutofill]);

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
            <Input 
              placeholder={placeholder} 
              className={className} 
              autoComplete={autoComplete}
              {...field}
              id={stableId || field.name}
              readOnly={isReadOnly}
              onFocus={(e) => {
                if (disableAutofill) setIsReadOnly(false);
              }}
              onBlur={(e) => {
                if (disableAutofill) setIsReadOnly(true);
                field.onBlur();
              }}
            />
          </FormControl>


          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default TextInput;
