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
import {
  AlignLeft,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Mic,
  Tag,
  Users,
} from "lucide-react";
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
  host?: string | null;
  max_teams?: number | null;
  price?: number | null;
  is_active?: boolean | null;
  event_type?: "brain" | "audio" | null;
  event_date: Date;
}

const defaultValues: FormValues = {
  name: "",
  description: "",
  location: "",
  host: "",
  max_teams: null,
  price: null,
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
          host: data.host || null,
          max_teams: data.max_teams || null,
          price: data.price || null,
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
          label={
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Название мероприятия
            </span>
          }
          required
          errorMessage="Название обязательно"
        >
          <Input
            type="text"
            placeholder="Введите название мероприятия"
            className="h-12 text-base"
          />
        </FormField>

        <FormField
          name="description"
          label={
            <span className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-blue-600" />
              Описание
            </span>
          }
        >
          <Textarea
            placeholder="Опишите мероприятие..."
            className="min-h-[100px] text-base"
          />
        </FormField>

        <FormField
          name="event_type"
          label={
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              Тип мероприятия
            </span>
          }
          useController
        >
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
          label={
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Дата и время мероприятия
            </span>
          }
          required
          errorMessage="Дата и время обязательны"
          useController
        >
          <DatePicker showTime />
        </FormField>

        <FormField
          name="location"
          label={
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Локация
            </span>
          }
        >
          <Input
            type="text"
            placeholder="Введите место проведения"
            className="h-12 text-base"
          />
        </FormField>

        <FormField
          name="host"
          label={
            <span className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-blue-600" />
              Ведущий
            </span>
          }
        >
          <Input
            type="text"
            placeholder="Введите имя ведущего"
            className="h-12 text-base"
          />
        </FormField>

        <FormField
          name="max_teams"
          label={
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Максимальное количество команд
            </span>
          }
        >
          <Input
            type="number"
            placeholder="Введите количество команд"
            className="h-12 text-base"
          />
        </FormField>

        <FormField
          name="price"
          label={
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Стоимость участия
            </span>
          }
        >
          <Input
            type="number"
            placeholder="Введите стоимость в рублях"
            className="h-12 text-base"
            min="0"
            step="0.01"
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
