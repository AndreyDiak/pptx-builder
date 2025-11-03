import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/base";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  LayoutAction,
  LayoutBody,
  LayoutHeader,
  LayoutMain,
  LayoutTitle,
} from "@/components/ui/layout";
import { CreateProjectDialogForm } from "@/entities/project";
import { ProjectCard } from "@/entities/project/ui/card";
import { useProjects } from "@/shared/hooks/use_projects";
import { useSize } from "@/shared/hooks/use_size";
import { Fragment, useState } from "react";

export const ProjectsPage = () => {
  const { data: projects, pending, error } = useProjects();
  const [open, setOpen] = useState(false);
  const size = useSize();

  if (pending) {
    return (
      <LayoutMain>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка проектов...</p>
        </div>
      </LayoutMain>
    );
  }

  if (error) {
    return (
      <LayoutMain>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Ошибка загрузки
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </LayoutMain>
    );
  }

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-y-auto custom-scrollbar dialog-max-height">
          <CreateProjectDialogForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <LayoutMain>
        <LayoutHeader>
          <LayoutTitle>
            <h2 className="text-2xl font-bold text-gray-800">Проекты</h2>
          </LayoutTitle>
          <LayoutAction>
            <Button size={size} onClick={() => setOpen(true)}>
              + Создать
            </Button>
          </LayoutAction>
        </LayoutHeader>
        <LayoutBody>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="editing">В процессе</TabsTrigger>
              <TabsTrigger value="completed">Готовые</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {projects?.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="editing">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {projects
                  ?.filter((project) => project.status === "editing")
                  .map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="completed">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {projects
                  ?.filter((project) => project.status === "completed")
                  .map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </LayoutBody>
      </LayoutMain>
    </Fragment>
  );
};
