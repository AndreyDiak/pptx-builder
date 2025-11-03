import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import * as React from "react";

import {
  Button, Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/base";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "./input";
import { Label } from "./label";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  showTime?: boolean;
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
  showTime = false,
  ref,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [hours, setHours] = React.useState<string>("00");
  const [minutes, setMinutes] = React.useState<string>("00");

  // Преобразуем значение в Date, если оно пришло как строка
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    return undefined;
  }, [value]);

  // Инициализируем время из значения
  React.useEffect(() => {
    if (dateValue) {
      setSelectedDate(dateValue);
      setHours(dateValue.getHours().toString().padStart(2, "0"));
      setMinutes(dateValue.getMinutes().toString().padStart(2, "0"));
    } else {
      setSelectedDate(undefined);
      setHours("00");
      setMinutes("00");
    }
  }, [dateValue]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      // Устанавливаем время из состояния (часы и минуты)
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      if (!showTime) {
        // Если не показываем время, закрываем попап и сразу отправляем значение
        if (onChange) {
          onChange(date);
        }
        setOpen(false);
      } else {
        // Если показываем время, обновляем значение с выбранной датой и временем
        if (onChange) {
          onChange(date);
        }
      }
    } else {
      if (onChange) {
        onChange(undefined);
      }
      setOpen(false);
    }
  };

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    // Валидация часов (0-23)
    let validHours = newHours;
    if (newHours !== "") {
      const hoursNum = parseInt(newHours, 10);
      if (hoursNum < 0) validHours = "00";
      else if (hoursNum > 23) validHours = "23";
      else validHours = hoursNum.toString().padStart(2, "0");
    }

    // Валидация минут (0-59)
    let validMinutes = newMinutes;
    if (newMinutes !== "") {
      const minutesNum = parseInt(newMinutes, 10);
      if (minutesNum < 0) validMinutes = "00";
      else if (minutesNum > 59) validMinutes = "59";
      else validMinutes = minutesNum.toString().padStart(2, "0");
    }

    setHours(validHours);
    setMinutes(validMinutes);

    // Обновляем дату с новым временем
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(
        validHours === "" ? 0 : parseInt(validHours, 10),
        validMinutes === "" ? 0 : parseInt(validMinutes, 10),
        newDate.getSeconds(),
        newDate.getMilliseconds()
      );
      
      if (onChange) {
        onChange(newDate);
      }
    }
  };

  const handleApply = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(
        parseInt(hours, 10),
        parseInt(minutes, 10),
        0,
        0
      );
      
      if (onChange) {
        onChange(finalDate);
      }
      setOpen(false);
    }
  };

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return null;
    
    if (showTime) {
      return `${format(date, "PPP")} ${format(date, "HH:mm")}`;
    }
    return format(date, "PPP");
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
          {dateValue ? (
            <span>{formatDisplayDate(dateValue)}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
          />
          {showTime && (
            <div className="border-t p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Время</Label>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor="time-hours" className="text-xs text-muted-foreground mb-1 block">
                    Часы
                  </Label>
                  <Input
                    id="time-hours"
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => handleTimeChange(e.target.value, minutes)}
                    className="h-9 text-center"
                    placeholder="00"
                  />
                </div>
                <span className="text-xl font-medium pt-6">:</span>
                <div className="flex-1">
                  <Label htmlFor="time-minutes" className="text-xs text-muted-foreground mb-1 block">
                    Минуты
                  </Label>
                  <Input
                    id="time-minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => handleTimeChange(hours, e.target.value)}
                    className="h-9 text-center"
                    placeholder="00"
                  />
                </div>
              </div>
              {selectedDate && (
                <Button
                  onClick={handleApply}
                  className="w-full mt-2"
                  size="sm"
                >
                  Применить
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
