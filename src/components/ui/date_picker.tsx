import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Выберите дату",
  className,
  disabled,
  name,
  id,
  ref,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Преобразуем значение в Date, если оно пришло как строка
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    return undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (onChange) {
      onChange(date);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          data-empty={!dateValue}
          className={`data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal ${
            className || ""
          }`}
          disabled={disabled}
          name={name}
          id={id}
          {...props}
        >
          <CalendarIcon />
          {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={dateValue} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
