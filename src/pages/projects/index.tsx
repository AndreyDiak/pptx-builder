import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <div className="w-full p-8 flex justify-center">
        <div className="mx-auto w-6xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка проектов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="mx-auto w-6xl">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Ошибка загрузки
              </h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-y-auto custom-scrollbar dialog-max-height">
          <CreateProjectDialogForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="w-full p-8 flex justify-center">
        <div className="mx-auto flex w-7xl relative">
          <Button
            size={size}
            onClick={() => setOpen(true)}
            className="absolute top-0 right-0"
          >
            + Создать проект
          </Button>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="editing">В процессе</TabsTrigger>
              <TabsTrigger value="completed">Готовые</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-2 sm:mt-4 md:mt-6">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {projects?.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="editing" className="mt-2 sm:mt-4 md:mt-6">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {projects
                  ?.filter((project) => project.status === "editing")
                  .map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="completed" className="mt-2 sm:mt-4 md:mt-6">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {projects
                  ?.filter((project) => project.status === "completed")
                  .map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Fragment>
  );
};
