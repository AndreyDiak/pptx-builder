import { Button } from "@/components/ui/base";
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
import { MapPin } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { City, CityInsert } from "../../../actions/city";
import { createCity, updateCity } from "../../../actions/city";

interface Props {
  defaultValues?: Partial<City>;
  onSuccess?: () => void;
}

interface FormValues {
  name: string | null;
}

const defaultFormValues: FormValues = {
  name: "",
};

export const CreateCityDialogForm = ({ defaultValues, onSuccess }: Props) => {
  const edit = !!defaultValues?.id;
  const manager = useForm<FormValues>({
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (defaultValues) {
      manager.reset({
        name: defaultValues.name || "",
      });
    }
  }, [defaultValues, manager]);

  const handleSubmit = useCallback(
    async ({ data }: { data: FormValues }) => {
      try {
        const cityData: CityInsert = {
          name: data.name || null,
        };

        if (edit && defaultValues?.id) {
          const result = await updateCity(defaultValues.id, cityData);
          if (result.data) {
            toast.success("Город успешно обновлен");
            manager.reset();
            onSuccess?.();
          } else if (result.error) {
            toast.error(`Ошибка обновления города: ${result.error.message}`);
          }
        } else {
          const result = await createCity(cityData);
          if (result.data) {
            toast.success("Город успешно создан");
            manager.reset();
            onSuccess?.();
          } else if (result.error) {
            toast.error(`Ошибка создания города: ${result.error.message}`);
          }
        }
      } catch (error) {
        console.error("Error saving city:", error);
        toast.error(edit ? "Не удалось обновить город" : "Не удалось создать город");
      }
    },
    [manager, onSuccess, edit, defaultValues]
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          {edit ? "Редактировать город" : "Создать город"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground mt-2">
          {edit
            ? "Измените информацию о городе"
            : "Заполните информацию о новом городе"}
        </DialogDescription>
      </DialogHeader>

      <Form manager={manager} onSubmit={handleSubmit} className="space-y-6">
        <FormField
          name="name"
          label={
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Название города
            </span>
          }
          required
          errorMessage="Название обязательно"
        >
          <Input
            type="text"
            placeholder="Введите название города"
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
            {edit ? "Сохранить изменения" : "Создать город"}
          </FormSubmitButton>
        </DialogFooter>
      </Form>
    </>
  );
};

