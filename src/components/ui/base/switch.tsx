import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/shared/utils";

interface SwitchProps {
  className?: string;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

function Switch({
  className,
  value,
  onChange,
  checked,
  onCheckedChange,
  disabled,
  name,
  id,
  ref,
  ...props
}: SwitchProps) {
  // Поддержка как react-hook-form (value/onChange), так и Radix (checked/onCheckedChange)
  const isChecked = checked !== undefined ? checked : value;

  const handleChange =
    onCheckedChange ||
    ((checked: boolean) => {
      if (onChange) {
        // Проверяем, ожидает ли onChange событие (register) или значение (Controller)
        if (onChange.length === 1) {
          // Controller - передаем значение напрямую
          onChange(checked);
        } else {
          // register - создаем синтетическое событие
          const syntheticEvent = {
            target: { value: checked, name: name || "" },
            currentTarget: { value: checked, name: name || "" },
          } as any;
          onChange(syntheticEvent);
        }
      }
    });

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      checked={isChecked}
      onCheckedChange={handleChange}
      disabled={disabled}
      name={name}
      id={id}
      ref={ref}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
