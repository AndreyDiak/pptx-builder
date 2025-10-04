import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Event } from "@/entities/event/types";
import { EventCard } from "@/entities/event/ui/card";
import { CreateEventDialogForm } from "@/entities/event/ui/create_dialog_form";
import { useEvents } from "@/shared/hooks/use_events";
import { useSize } from "@/shared/hooks/use_size";
import { Fragment, useState } from "react";

export const EventsPage = () => {
  const { data: events, pending, error } = useEvents();
  const size = useSize();
  const [open, setOpen] = useState(false);

  if (pending) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="mx-auto w-6xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка мероприятий...</p>
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
          <CreateEventDialogForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="w-full flex justify-center">
        <div className="mx-auto w-7xl">
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Мероприятия</h2>
              <Button size={size} onClick={() => setOpen(true)}>
                + Создать мероприятие
              </Button>
            </div>

            {events && events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                {events.map((event: Event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Пока нет мероприятий
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Создайте первое мероприятие, чтобы начать планирование
                  </p>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setOpen(true)}
                  >
                    + Создать мероприятие
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};
