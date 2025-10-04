import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateDisplay } from "@/components/ui/date_display";
import { PairList } from "@/components/ui/pair_list";
import { Separator } from "@/components/ui/separator";
import { useSize } from "@/shared/hooks/use_size";
import { cn } from "@/shared/utils";
import { Link } from "react-router-dom";
import type { Project } from "../types";

export const ProjectCard = ({ project }: { project: Project }) => {
  const slidesCount = project.track_ids?.length ?? 0;
  const total = project.size_x * project.size_y;
  const progress = Math.round((slidesCount / total) * 100);

  const size = useSize();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <PairList
          pairs={[
            [
              "Создан",
              <DateDisplay date={project.created_at} mode="absolute" />,
            ],
            [
              "Обновлен",
              <DateDisplay date={project.updated_at} mode="relative" />,
            ],
            [
              "Крайний срок",
              project.deadline ? (
                <DateDisplay date={project.deadline} mode="absolute" />
              ) : null,
            ],
            ["Всего треков", total],
          ]}
          size={size}
        />
        <div className="flex justify-between items-center pt-2">
          <div
            className={cn(
              progressToColorMap[Math.round(progress / 25) * 25],
              "text-xs sm:text-sm md:text-base"
            )}
          >
            <span>Выполнено </span>
            <span>{progress}%</span>
          </div>
          <Button variant="outline" size="sm">
            <Link to={`/projects/${project.id}`}>Перейти к проекту</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const progressToColorMap: Record<number, string> = {
  0: "text-red-500",
  25: "text-orange-500",
  50: "text-yellow-500",
  75: "bg-blue-500",
  100: "text-green-500",
};
