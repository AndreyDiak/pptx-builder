import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DatePicker,
  Form,
  FormField,
  FormSubmitButton,
  Input,
  Textarea,
} from "@/components/ui/form";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEvent } from "../../../actions/event";
import type { EventInsert } from "../types";

interface Props {
  onSuccess?: () => void;
}

interface FormValues extends Omit<EventInsert, "event_date"> {
  name: string;
  description?: string | null;
  location?: string | null;
  max_teams?: number | null;
  is_active?: boolean | null;
  event_type?: "brain" | "audio" | null;
  event_date: Date;
}

const defaultValues: FormValues = {
  name: "",
  description: "",
  location: "",
  max_teams: null,
  is_active: true,
  event_type: null,
  event_date: new Date(),
};

export const CreateEventDialogForm = ({ onSuccess }: Props) => {
  const manager = useForm<FormValues>({
    defaultValues,
  });

  const handleSubmit = useCallback(
    async ({ data }: { data: FormValues }) => {
      try {
        const eventData: EventInsert = {
          name: data.name,
          description: data.description || null,
          location: data.location || null,
          max_teams: data.max_teams || null,
          is_active: data.is_active,
          event_type: data.event_type || null,
          event_date: data.event_date.toISOString(),
        };

        const result = await createEvent(eventData);

        if (result.data) {
          toast.success("Мероприятие успешно создано");
          manager.reset();
          onSuccess?.();
        } else if (result.error) {
          toast.error(`Ошибка создания мероприятия: ${result.error.message}`);
        }
      } catch (error) {
        console.error("Error creating event:", error);
        toast.error("Не удалось создать мероприятие");
      }
    },
    [manager, onSuccess]
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          Создать мероприятие
        </DialogTitle>
        <DialogDescription className="text-muted-foreground mt-2">
          Заполните информацию о новом мероприятии
        </DialogDescription>
      </DialogHeader>

      <Form manager={manager} onSubmit={handleSubmit} className="space-y-6">
        <FormField
          name="name"
          label="Название мероприятия"
          required
          errorMessage="Название обязательно"
        >
          <Input
            type="text"
            placeholder="Введите название мероприятия"
            className="h-12 text-base"
          />
        </FormField>

        <FormField name="description" label="Описание">
          <Textarea
            placeholder="Опишите мероприятие..."
            className="min-h-[100px] text-base"
          />
        </FormField>

        <FormField name="event_type" label="Тип мероприятия" useController>
          {({ value, onChange }) => (
            <Select value={value || undefined} onValueChange={onChange}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Выберите тип мероприятия" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brain">Мзг.</SelectItem>
                <SelectItem value="audio">КараокеЛото</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField
          name="event_date"
          label="Дата и время мероприятия"
          required
          errorMessage="Дата и время обязательны"
          useController
        >
          <DatePicker showTime />
        </FormField>

        <FormField name="location" label="Локация">
          <Input
            type="text"
            placeholder="Введите место проведения"
            className="h-12 text-base"
          />
        </FormField>

        <FormField name="max_teams" label="Максимальное количество команд">
          <Input
            type="number"
            placeholder="Введите количество команд"
            className="h-12 text-base"
          />
        </FormField>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </DialogClose>
          <FormSubmitButton>Создать мероприятие</FormSubmitButton>
        </DialogFooter>
      </Form>
    </>
  );
};
