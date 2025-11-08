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
import { useLocations } from "@/shared/hooks/use_locations";
import {
  AlignLeft,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Mic,
  Tag,
  Users,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEvent, updateEvent } from "../../../actions/event";
import type { Event, EventInsert } from "../types";

interface Props {
  defaultValues?: Partial<Event>;
  onSuccess?: () => void;
}

interface FormValues extends Omit<EventInsert, "event_date"> {
  name: string;
  description?: string | null;
  location_id?: number | null;
  host?: string | null;
  max_teams?: number | null;
  max_participants_in_team?: number | null;
  price?: number | null;
  is_active?: boolean | null;
  event_type?: "brain" | "audio" | null;
  event_date: Date;
}

const defaultValues: FormValues = {
  name: "",
  description: "",
  location_id: null,
  host: "",
  max_teams: null,
  max_participants_in_team: null,
  price: null,
  is_active: true,
  event_type: null,
  event_date: new Date(),
};

export const CreateEventDialogForm = ({
  defaultValues: propsDefaultValues,
  onSuccess,
}: Props) => {
  const edit = !!propsDefaultValues?.id;
  
  const manager = useForm<FormValues>({
    defaultValues: {
      ...defaultValues,
      ...propsDefaultValues,
      event_date: propsDefaultValues?.event_date
        ? new Date(propsDefaultValues.event_date)
        : new Date(),
    },
  });
  const { data: locations, pending: locationsPending } = useLocations();

  // Обновляем форму при изменении defaultValues
  useEffect(() => {
    if (propsDefaultValues) {
      manager.reset({
        ...defaultValues,
        ...propsDefaultValues,
        event_date: propsDefaultValues?.event_date
          ? new Date(propsDefaultValues.event_date)
          : new Date(),
      });
    }
  }, [propsDefaultValues, manager]);

  const handleSubmit = useCallback(
    async ({ data }: { data: FormValues }) => {
      try {
        const eventData: EventInsert = {
          name: data.name,
          description: data.description || null,
          location_id: data.location_id ?? null,
          host: data.host ?? null,
          max_teams: data.max_teams ?? null,
          max_participants_in_team: data.max_participants_in_team ?? null,
          price: data.price ?? null,
          is_active: data.is_active,
          event_type: data.event_type ?? null,
          event_date: data.event_date.toISOString(),
        };

        if (edit && propsDefaultValues?.id) {
          const result = await updateEvent(propsDefaultValues.id, eventData);
          if (result.data) {
            toast.success("Мероприятие успешно обновлено");
            onSuccess?.();
          } else if (result.error) {
            toast.error(`Ошибка обновления мероприятия: ${result.error.message}`);
          }
        } else {
          const result = await createEvent(eventData);
          if (result.data) {
            toast.success("Мероприятие успешно создано");
            manager.reset();
            onSuccess?.();
          } else if (result.error) {
            toast.error(`Ошибка создания мероприятия: ${result.error.message}`);
          }
        }
      } catch (error) {
        console.error(`Error ${edit ? "updating" : "creating"} event:`, error);
        toast.error(`Не удалось ${edit ? "обновить" : "создать"} мероприятие`);
      }
    },
    [manager, onSuccess, edit, propsDefaultValues]
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          {edit
            ? `Редактировать - ${propsDefaultValues?.name || "мероприятие"}`
            : "Создать мероприятие"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground mt-2">
          {edit
            ? "Внесите изменения в мероприятие"
            : "Заполните информацию о новом мероприятии"}
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
          required
          errorMessage="Тип мероприятия обязателен"
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
          name="location_id"
          label={
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Локация
            </span>
          }
          required
          errorMessage="Локация обязательна"
          useController
        >
          {({ value, onChange }) => (
            <Select
              value={value ? String(value) : undefined}
              onValueChange={(val) => onChange(val ? Number(val) : null)}
              disabled={locationsPending}
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Выберите локацию" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location) => {
                  const cityName = location.cities?.name || null;
                  return (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.name}
                      {cityName && (
                        <span className="text-gray-500">, {cityName}</span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField
          name="host"
          label={
            <span className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-blue-600" />
              Ведущий
            </span>
          }
          required
          errorMessage="Ведущий обязателен"
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
          required
          errorMessage="Количество команд обязательно"
        >
          <Input
            type="number"
            placeholder="Введите количество команд"
            className="h-12 text-base"
            min="1"
          />
        </FormField>

        <FormField
          name="max_participants_in_team"
          label={
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              Максимальное количество участников в команде
            </span>
          }
        >
          <Input
            type="number"
            placeholder="Введите максимальное количество участников в команде"
            className="h-12 text-base"
            min="1"
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
          required
          errorMessage="Стоимость обязательна"
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
          <FormSubmitButton>
            {edit ? "Сохранить изменения" : "Создать мероприятие"}
          </FormSubmitButton>
        </DialogFooter>
      </Form>
    </>
  );
};
