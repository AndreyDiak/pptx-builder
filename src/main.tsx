import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { Toaster } from "./components/ui/base/sonner.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <NuqsAdapter>
          <App />
          <Toaster />
        </NuqsAdapter>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
