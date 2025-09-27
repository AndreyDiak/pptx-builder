import type { ReactNode } from "react";
import {
  FormProvider,
  Form as RHFForm,
  type FieldValues,
  type FormSubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

interface FormProps<TFieldValues extends FieldValues> {
  children: ReactNode;
  manager: UseFormReturn<TFieldValues>;
  onSubmit: FormSubmitHandler<TFieldValues>;
  className?: string;
}

export function Form<TFieldValues extends FieldValues>({
  children,
  manager,
  onSubmit,
  className,
}: FormProps<TFieldValues>) {
  return (
    <RHFForm
      control={manager.control}
      onSubmit={onSubmit}
      className={className}
    >
      <FormProvider {...manager}>{children}</FormProvider>
    </RHFForm>
  );
}
