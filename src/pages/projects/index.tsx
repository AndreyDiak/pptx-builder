import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateProjectDialogForm } from "@/entities/project";
import { ProjectCard } from "@/entities/project/ui/card";
import { useSize } from "@/shared/hooks/use_size";
import { Fragment, useState } from "react";
import { useProjects } from "../../shared/hooks/use_projects";

export const ProjectsPage = () => {
  // const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: projects, pending, error } = useProjects();
  const [open, setOpen] = useState(false);

  const size = useSize();

  if (pending) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка проектов...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Ошибка загрузки
            </h2>
            <p className="text-red-600">{error}</p>
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
      <div className="w-full min-h-screen p-8 flex justify-center gradient-bg-purple">
        <div className="mx-auto w-6xl">
          <header className="flex justify-between items-start sm:items-center mb-8 pb-4 border-b border-white/20">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black drop-shadow-lg">
                МузЛото
              </h1>
              <p className="text-black mt-1 text-sm sm:text-base drop-shadow-md">
                Сделаем этот мир чуточку лучше
              </p>
            </div>
            <Button onClick={() => setOpen(true)} size={size}>
              + Создать новый проект
            </Button>
          </header>

          <div className="mt-8">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="editing">В процессе</TabsTrigger>
                <TabsTrigger value="completed">Готовые</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-2 sm:mt-4 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6">
                  {projects?.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="editing" className="mt-2 sm:mt-4 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6">
                  {projects
                    ?.filter((project) => project.status === "editing")
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="completed" className="mt-2 sm:mt-4 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6">
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
      </div>
    </Fragment>
  );
};
