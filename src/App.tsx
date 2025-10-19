import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/app_layout";
import { CalendarPage } from "./pages/calendar";
import { EventPage } from "./pages/event";
import { EventLayout } from "./pages/event/layout";
import { EventsPage } from "./pages/events";
import { ProjectPage } from "./pages/project";
import { ProjectLayout } from "./pages/project/layout";
import { ProjectsPage } from "./pages/projects";

function App() {
  return (
    <Routes>
      <Route
        index
        element={
          <AppLayout>
            <ProjectsPage />
          </AppLayout>
        }
      />
      <Route
        path="/events"
        element={
          <AppLayout>
            <EventsPage />
          </AppLayout>
        }
      />
      <Route
        path="/events/:id"
        element={
          <EventLayout>
            <EventPage />
          </EventLayout>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProjectLayout>
            <ProjectPage />
          </ProjectLayout>
        }
      />
      <Route
        path="/calendar"
        element={
          <AppLayout>
            <CalendarPage />
          </AppLayout>
        }
      />
    </Routes>
  );
}

export default App;
