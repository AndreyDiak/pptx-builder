import { cn } from "@/shared/utils";
import type { ReactElement } from "react";
import { cloneElement, isValidElement } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "./label";

interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  children: ReactElement;
  errorMessage?: string;
  useController?: boolean; // Новый пропс для указания использования Controller
}

export const FormField = ({
  name,
  label,
  required = false,
  className,
  children,
  errorMessage,
  useController = false,
}: FormFieldProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const hasError = !!error;

  // Если useController = true, используем Controller
  if (useController) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label htmlFor={name} className="text-base font-semibold">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Controller
          name={name}
          control={control}
          rules={{
            required: required
              ? errorMessage || `${label || name} обязательно`
              : false,
          }}
          render={({ field }) => {
            const enhancedChildren = isValidElement(children)
              ? cloneElement(children, {
                  ...field,
                  id: name,
                  "aria-invalid": hasError,
                  "aria-describedby": hasError ? `${name}-error` : undefined,
                  className: cn(
                    (children.props as any)?.className,
                    hasError && "border-destructive focus:ring-destructive"
                  ),
                } as any)
              : children;

            return enhancedChildren;
          }}
        />
        {hasError && (
          <p
            id={`${name}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {error?.message as string}
          </p>
        )}
      </div>
    );
  }

  // Обычный режим с register
  const registration = register(name, {
    required: required ? errorMessage || `${label || name} обязательно` : false,
  });

  if (!registration) {
    console.error(`Failed to register field: ${name}`);
    return null;
  }

  // Извлекаем только DOM-совместимые пропсы из регистрации
  const { ref, onChange, onBlur, name: fieldName } = registration;

  const enhancedChildren = isValidElement(children)
    ? cloneElement(children, {
        id: name,
        ref,
        onChange,
        onBlur,
        name: fieldName,
        "aria-invalid": hasError,
        "aria-describedby": hasError ? `${name}-error` : undefined,
        className: cn(
          (children.props as any)?.className,
          hasError && "border-destructive focus:ring-destructive"
        ),
      } as any)
    : children;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-base font-semibold">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {enhancedChildren}
      {hasError && (
        <p
          id={`${name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error?.message as string}
        </p>
      )}
    </div>
  );
};
