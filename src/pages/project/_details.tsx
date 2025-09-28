import { DateDisplay } from "@/components/ui/date_display";
import { PairList } from "@/components/ui/pair_list";
import { Separator } from "@/components/ui/separator";
import type { Project } from "@/entities/project";
import { cn } from "@/shared/utils";
import { Fragment, type ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
  project: Project;
}

export const ProjectDetails = ({ project, className, ...rest }: Props) => {
  const slidesCount = project?.track_ids?.length ?? 0;
  const total = project?.size_x * project?.size_y;

  return (
    <div className={cn("", className)} {...rest}>
      <h2 className="text-lg font-medium">Детали проекта</h2>
      <div className="mt-6">
        <div className="text-muted-foreground text-sm mb-4">
          {project.description}
        </div>
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
          size="lg"
          alignValues="left"
          labelWidth={180}
          className="max-w-md"
        />
        {project.front_page_background_src && (
          <Fragment>
            <Separator className="my-4" />
            <div>
              <h2 className="text-base font-medium mb-2">
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
