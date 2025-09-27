import { Route, Routes } from "react-router-dom";
import { ProjectPage } from "./pages/project";
import { ProjectLayout } from "./pages/project/layout";
import { ProjectsPage } from "./pages/projects";

function App() {
  return (
    <div className={`min-h-screen`}>
      <Routes>
        <Route index element={<ProjectsPage />} />
        <Route
          path="/projects/:id"
          element={
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
