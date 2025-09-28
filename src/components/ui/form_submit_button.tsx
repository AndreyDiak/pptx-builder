import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

// Простой компонент спиннера
const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

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
      {formState.isSubmitting && <Spinner className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}
