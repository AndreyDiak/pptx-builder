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
  children: ReactElement | ((props: any) => ReactElement);
  errorMessage?: string;
  useController?: boolean; // Новый пропс для указания использования Controller
  help?: string; // Описание/подсказка для поля
}

export const FormField = ({
  name,
  label,
  required = false,
  className,
  children,
  errorMessage,
  useController = false,
  help,
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
            const fieldProps = {
              ...field,
              id: name,
              "aria-invalid": hasError,
              "aria-describedby": hasError
                ? `${name}-error`
                : help
                ? `${name}-help`
                : undefined,
              className: cn(
                hasError && "border-destructive focus:ring-destructive"
              ),
            };

            if (typeof children === "function") {
              return children(fieldProps);
            }

            const enhancedChildren = isValidElement(children)
              ? cloneElement(children, {
                  ...fieldProps,
                  className: cn(
                    (children.props as any)?.className,
                    fieldProps.className
                  ),
                } as any)
              : children;

            return enhancedChildren;
          }}
        />
        {help && !hasError && (
          <p id={`${name}-help`} className="text-sm text-muted-foreground">
            {help}
          </p>
        )}
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

  const fieldProps = {
    id: name,
    ref,
    onChange,
    onBlur,
    name: fieldName,
    "aria-invalid": hasError,
    "aria-describedby": hasError
      ? `${name}-error`
      : help
      ? `${name}-help`
      : undefined,
    className: cn(hasError && "border-destructive focus:ring-destructive"),
  };

  let enhancedChildren;
  if (typeof children === "function") {
    enhancedChildren = children(fieldProps);
  } else {
    enhancedChildren = isValidElement(children)
      ? cloneElement(children, {
          ...fieldProps,
          className: cn(
            (children.props as any)?.className,
            fieldProps.className
          ),
        } as any)
      : children;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-base font-semibold">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {enhancedChildren}
      {help && !hasError && (
        <p id={`${name}-help`} className="text-sm text-muted-foreground">
          {help}
        </p>
      )}
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
