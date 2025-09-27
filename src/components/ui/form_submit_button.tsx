import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface FormSubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
  onClick?: () => void;
}

export function FormSubmitButton({
  children,
  className,
  size = "lg",
  variant = "default",
  disabled = false,
  onClick,
  ...props
}: FormSubmitButtonProps) {
  const { formState } = useFormContext();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const hasChanges =
      formState.isDirty || Object.keys(formState.dirtyFields).length > 0;
    setIsDirty(hasChanges);
  }, [formState.isDirty, formState.dirtyFields]);

  const isDisabled = disabled || !isDirty || formState.isSubmitting;

  return (
    <Button
      type="submit"
      className={className}
      size={size}
      variant={variant}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
}
