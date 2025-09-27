import { useParams } from "react-router-dom";
// import type { Project } from "../../types/project";
import { Separator } from "@/components/ui/separator";
import {
  ProjectNoDataDisplay,
  ProjectPendingDisplay,
} from "@/entities/project";
import { useProject } from "@/shared/hooks/use_project";
import { ProjectDetails } from "./_details";
import { ProjectHeader } from "./_header";

export const ProjectPage = () => {
  const { id } = useParams();
  const {
    data: project,
    pending,
    onDelete,
  } = useProject(Number(id), !id || id === "new");

  if (pending) {
    return <ProjectPendingDisplay />;
  }

  if (!project) {
    return <ProjectNoDataDisplay />;
  }

  return (
    <div className="w-full h-full p-4">
      {/* Header */}
      <ProjectHeader project={project} onDelete={onDelete} />
      <Separator />
      <div className="grid grid-cols-[1fr_3fr] gap-4 py-4">
        {/* Project Details */}
        <ProjectDetails project={project} />
        <div>Песни...</div>
      </div>
    </div>
  );
};
