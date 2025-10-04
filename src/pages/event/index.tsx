import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { EventDetails } from "./_details.tsx";
import { EventHeader } from "./_header.tsx";
import { EventTeams } from "./_teams.tsx";

export const EventPage = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!id) {
    return (
      <div className="w-full h-full px-4 overflow-y-auto custom-scrollbar">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Мероприятие не найдено
          </h2>
          <p className="text-gray-600">Неверный ID мероприятия</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 overflow-y-auto custom-scrollbar">
      <EventHeader eventId={Number(id)} />

      <div className="flex gap-4">
        {/* Custom Sidebar with Animation */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            sidebarOpen
              ? "w-[320px] md:w-[440px] opacity-100 translate-x-0"
              : "w-0 opacity-0 -translate-x-full"
          }`}
        >
          <EventDetails eventId={Number(id)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
          <EventTeams eventId={Number(id)}>
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
          </EventTeams>
        </div>
      </div>
    </div>
  );
};
