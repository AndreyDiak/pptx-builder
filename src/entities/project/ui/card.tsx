import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateDisplay } from "@/components/ui/date_display";
import { PairList } from "@/components/ui/pair_list";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils";
import { Link } from "react-router-dom";
import type { Project } from "../types";

export const ProjectCard = ({ project }: { project: Project }) => {
  const slidesCount = project.track_ids?.length ?? 0;
  const total = project.size_x * project.size_y;
  const progress = (slidesCount / total) * 100;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
        <CardAction>
          <Button variant="default">
            <Link to={`/projects/${project.id}`}>Перейти к проекту</Link>
          </Button>
        </CardAction>
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
          size="md"
        />
      </CardContent>
      <Separator />
      <CardFooter className="flex items-center justify-between">
        <div>
          Осталось {total - slidesCount} треков из {total}
        </div>
        <div className={cn(progressToColorMap[Math.round(progress / 25) * 25])}>
          <span>Выполнено </span>
          <span>{progress}%</span>
        </div>
      </CardFooter>
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
