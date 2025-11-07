import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/base";
import { Info, Users } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { EventDetails } from "./_details.tsx";
import { EventHeader } from "./_header.tsx";
import { EventRegistrations } from "./_registrations.tsx";

export const EventPage = () => {
  const { id } = useParams();
  const [sidebarOpen] = useState(true);

  if (!id) {
    return (
      <div className="w-full h-full px-2 md:px-4 overflow-y-auto custom-scrollbar">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Мероприятие не найдено
          </h2>
          <p className="text-muted-foreground">Неверный ID мероприятия</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <EventHeader eventId={Number(id)} />

      {/* Mobile: Tabs for switching between Details and Registrations */}
      <div className="md:hidden px-2">
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="registrations" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Регистрации
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              <Info className="h-4 w-4 mr-2" />
              Детали
            </TabsTrigger>
          </TabsList>
          <TabsContent value="registrations" className="mt-0">
            <EventRegistrations eventId={Number(id)} />
          </TabsContent>
          <TabsContent value="details" className="mt-0">
            <EventDetails eventId={Number(id)} isMobileTab={true} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Sidebar with Details and Main Content with Registrations */}
      <div className="hidden md:flex gap-2 md:gap-4 px-2 md:px-4">
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
        <EventRegistrations
          eventId={Number(id)}
          className="flex-1 min-w-0 transition-all duration-300 ease-in-out"
        />
      </div>
    </div>
  );
};
