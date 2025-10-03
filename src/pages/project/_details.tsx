import { DateDisplay } from "@/components/ui/date_display";
import { PairList } from "@/components/ui/pair_list";
import { Separator } from "@/components/ui/separator";
import type { Project } from "@/entities/project";
import { useSize } from "@/shared/hooks/use_size";
import { cn } from "@/shared/utils";
import { Fragment, type ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
  project: Project;
}

export const ProjectDetails = ({ project, className, ...rest }: Props) => {
  const slidesCount = project?.track_ids?.length ?? 0;
  const total = project?.size_x * project?.size_y;

  const size = useSize();

  const labelWidth = size === "sm" ? 200 : size === "default" ? 250 : 300;

  return (
    <div className={cn("", className)} {...rest}>
      <h2 className="text-xl font-medium">Детали проекта</h2>
      <div className="mt-6">
        <div className="text-muted-foreground text-sm mb-4">
          {project.description}
        </div>
        <div className="flex flex-col gap-4">
          <PairList
            pairs={[
              [
                "Создан",
                <DateDisplay date={project.created_at} mode="absolute" />,
              ],
              [
                "Обновлен",
                project.updated_at ? (
                  <DateDisplay date={project.updated_at} mode="relative" />
                ) : null,
              ],
              ["Количество треков", project.size_x * project.size_y],
              [
                "Крайний срок",
                project.status === "editing" && project.deadline ? (
                  <DateDisplay date={project.deadline} mode="absolute" />
                ) : null,
              ],
              [
                "Готовность",
                project.status === "editing" ? (
                  <span
                    className={cn(
                      progressToColorMap[
                        Math.round(((slidesCount / total) * 100) / 25) * 25
                      ]
                    )}
                  >
                    {((slidesCount / total) * 100).toFixed(0)}%
                  </span>
                ) : (
                  "Завершен"
                ),
              ],
            ]}
            size={size}
            alignValues="left"
            labelWidth={labelWidth}
            className="max-w-md"
          />
          <Separator />
          <div>
            <h2 className="text-xl font-medium mb-2">Управление</h2>
            <div className="text-muted-foreground text-sm mb-4">
              Назначенные клавиши для управления презентацией
            </div>
            <PairList
              pairs={[
                ["Открыть первую страницу", project.first_page_open_key],
                ["Открыть страницу с треками", project.tracks_page_open_key],
                ["Открыть последнюю страницу", project.last_page_open_key],
              ]}
              labelWidth={labelWidth}
              size={size}
            />
          </div>
          <Separator />
          <div>
            <h2 className="text-xl font-medium mb-2">Расположение элементов</h2>
            <div className="text-muted-foreground text-sm mb-4"></div>
            <PairList
              pairs={[
                [
                  "Номер трека",
                  positionToLabelMap[project.chip_position ?? "top-left"],
                ],
                [
                  "Изображение автора",
                  positionToLabelMap[
                    project.author_image_position ?? "bottom-right"
                  ],
                ],
              ]}
              labelWidth={labelWidth}
              size={size}
            />
          </div>
        </div>

        {project.front_page_background_src && (
          <Fragment>
            <Separator className="my-4" />
            <div>
              <h2 className="text-xl font-medium mb-2">
                Титульное изображение
              </h2>
              <img
                src={project.front_page_background_src}
                alt={project.name}
                className="object-cover w-xl rounded-2xl border border-blue-[var(--border)]"
              />
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

const progressToColorMap: Record<number, string> = {
  0: "text-red-500",
  25: "text-orange-500",
  50: "text-yellow-500",
  75: "bg-blue-500",
  100: "text-green-500",
};

const positionToLabelMap: Record<string, string> = {
  "top-left": "Верхний левый угол",
  "top-right": "Верхний правый угол",
  "bottom-left": "Нижний левый угол",
  "bottom-right": "Нижний правый угол",
};
