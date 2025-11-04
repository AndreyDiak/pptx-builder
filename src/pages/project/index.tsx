import { Button } from "@/components/ui/base";
import {
  ProjectNoDataDisplay,
  ProjectPendingDisplay,
} from "@/entities/project";
import { AudioProvider } from "@/shared/contexts/audio_context";
import { useProject } from "@/shared/hooks/use_project";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectDetails } from "./_details";
import { ProjectHeader } from "./_header";
import { ProjectsTracks } from "./_tracks";

export const ProjectPage = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <AudioProvider>
      <div className="w-full h-full px-2 md:px-4 overflow-y-auto custom-scrollbar">
        <ProjectHeader project={project} onDelete={onDelete} />
        <div className="flex gap-2 md:gap-4">
          {/* Custom Sidebar with Animation */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              sidebarOpen
                ? "w-[320px] md:w-[440px] opacity-100 translate-x-0"
                : "w-0 opacity-0 -translate-x-full"
            }`}
          >
            <ProjectDetails project={project} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
            <ProjectsTracks>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <div className="transition-transform duration-200">
                  {sidebarOpen ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeftOpen className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </ProjectsTracks>
          </div>
        </div>
      </div>
    </AudioProvider>
  );
};
