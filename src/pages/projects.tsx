import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateProjectDialogForm } from "@/entities/project";
import { ProjectCard } from "@/entities/project/ui/card";
import { Fragment, useState } from "react";
import { useProjects } from "../shared/hooks/use_projects";

export const ProjectsPage = () => {
  // const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: projects, pending, error } = useProjects();
  const [open, setOpen] = useState(false);
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
        <DialogContent>
          <CreateProjectDialogForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <div className="w-full h-screen p-8 flex justify-center gradient-bg-purple">
        <div className="mx-auto w-6xl">
          <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/20">
            <div>
              <h1 className="text-3xl font-bold text-black drop-shadow-lg">
                МузЛото
              </h1>
              <p className="text-black mt-1 drop-shadow-md">
                Сделаем этот мир чуточку лучше
              </p>
            </div>
            <Button onClick={() => setOpen(true)}>
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
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects?.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="editing" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects
                    ?.filter((project) => project.status === "editing")
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="completed" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Форма создания проекта */}
        {/* {showCreateForm && (
        <div className="mb-8">
          <CreateProjectForm 
            onSuccess={handleCreateProject}
            onCancel={handleCancelCreate}
          />
        </div>
      )} */}

        {/* <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button 
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'all' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Все проекты ({projects.length})
        </button>
        <button 
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'in-progress' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('in-progress')}
        >
          В процессе ({inProgressProjects.length})
        </button>
        <button 
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'completed' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Готовые ({completedProjects.length})
        </button>
      </div> */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex-1 mr-4">{project.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                project.status === 'in-progress' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {project.status === 'in-progress' ? 'В процессе' : 'Готов'}
              </span>
            </div>
            {project.description && (
              <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
            )}
            <div className="flex flex-col gap-1 mb-6 text-sm text-gray-500">
              <span>Создан: {new Date(project.created_at).toLocaleDateString()}</span>
              <span>Обновлен: {new Date(project.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-3">
              <Link 
                to={`/project/${project.id}`} 
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Открыть
              </Link>
              {project.status === 'completed' && (
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                  Предпросмотр
                </button>
              )}
            </div>
          </div>
        ))}
      </div> */}

        {/* {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Проекты не найдены</p>
        </div>
      )} */}
      </div>
    </Fragment>
  );
};
