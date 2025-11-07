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
	Form,
	FormField,
	FormSubmitButton,
	Input,
} from "@/components/ui/form";
import { useCities } from "@/shared/hooks/use_cities";
import { MapPin } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Location, LocationInsert } from "../../../actions/location";
import { createLocation, updateLocation } from "../../../actions/location";

interface Props {
  defaultValues?: Partial<Location>;
  onSuccess?: () => void;
}

interface FormValues {
  name: string;
  city_id: number | null;
  map_link?: string | null;
}

const defaultFormValues: FormValues = {
  name: "",
  city_id: null,
  map_link: "",
};

export const CreateLocationDialogForm = ({ defaultValues, onSuccess }: Props) => {
  const edit = !!defaultValues?.id;
  const manager = useForm<FormValues>({
    defaultValues: defaultFormValues,
  });
  const { data: cities, pending: citiesPending } = useCities();

  useEffect(() => {
    if (defaultValues) {
      manager.reset({
        name: defaultValues.name || "",
        city_id: defaultValues.city_id || null,
        map_link: defaultValues.map_link || "",
      });
    }
  }, [defaultValues, manager]);

  const handleSubmit = useCallback(
    async ({ data }: { data: FormValues }) => {
      try {
        if (!data.city_id) {
          toast.error("Необходимо выбрать город");
          return;
        }

        const locationData: LocationInsert = {
          name: data.name,
          city_id: data.city_id,
          map_link: data.map_link || null,
        };

        if (edit && defaultValues?.id) {
          const result = await updateLocation(defaultValues.id, locationData);
          if (result.data) {
            toast.success("Локация успешно обновлена");
            manager.reset();
            onSuccess?.();
          } else if (result.error) {
            toast.error(`Ошибка обновления локации: ${result.error.message}`);
          }
        } else {
          const result = await createLocation(locationData);
          if (result.data) {
            toast.success("Локация успешно создана");
            manager.reset();
            onSuccess?.();
          } else if (result.error) {
            toast.error(`Ошибка создания локации: ${result.error.message}`);
          }
        }
      } catch (error) {
        console.error("Error saving location:", error);
        toast.error(edit ? "Не удалось обновить локацию" : "Не удалось создать локацию");
      }
    },
    [manager, onSuccess, edit, defaultValues]
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          {edit ? "Редактировать локацию" : "Создать локацию"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground mt-2">
          {edit
            ? "Измените информацию о локации"
            : "Заполните информацию о новой локации"}
        </DialogDescription>
      </DialogHeader>

      <Form manager={manager} onSubmit={handleSubmit} className="space-y-6">
        <FormField
          name="name"
          label={
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Название локации
            </span>
          }
          required
          errorMessage="Название обязательно"
        >
          <Input
            type="text"
            placeholder="Введите название локации"
            className="h-12 text-base"
          />
        </FormField>

        <FormField
          name="city_id"
          label={
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Город
            </span>
          }
          required
          errorMessage="Город обязателен"
          useController
        >
          {({ value, onChange }) => (
            <Select
              value={value ? String(value) : undefined}
              onValueChange={(val) => onChange(val ? Number(val) : null)}
              disabled={citiesPending}
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent>
                {cities?.map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField
          name="map_link"
          label={
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Ссылка на карту
            </span>
          }
        >
          <Input
            type="text"
            placeholder="Введите ссылку на карту (необязательно)"
            className="h-12 text-base"
          />
        </FormField>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </DialogClose>
          <FormSubmitButton>
            {edit ? "Сохранить изменения" : "Создать локацию"}
          </FormSubmitButton>
        </DialogFooter>
      </Form>
    </>
  );
};

