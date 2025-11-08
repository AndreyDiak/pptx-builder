import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import type { Event } from "@/entities/event/types";
import { EventCard } from "@/entities/event/ui/card";
import { CreateEventDialogForm } from "@/entities/event/ui/create_dialog_form";
import { useCities } from "@/shared/hooks/use_cities";
import { useEvents } from "@/shared/hooks/use_events";
import { useLocations } from "@/shared/hooks/use_locations";
import { useSize } from "@/shared/hooks/use_size";
import { Filter, Inbox, X } from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type EventTypeFilter = "all" | "brain" | "audio";
type RelevanceFilter = "all" | "upcoming" | "past";

export const EventsPage = () => {
  const { data: events, pending, error, refresh } = useEvents();
  const { data: cities } = useCities();
  const { data: locations } = useLocations();
  const size = useSize();
  const [open, setOpen] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useQueryState(
    "type",
    parseAsStringEnum<EventTypeFilter>(["all", "brain", "audio"]).withDefault(
      "all"
    )
  );
  const [cityFilter, setCityFilter] = useQueryState(
    "city",
    parseAsInteger
  );
  const [relevanceFilter, setRelevanceFilter] = useQueryState(
    "relevance",
    parseAsStringEnum<RelevanceFilter>(["all", "upcoming", "past"]).withDefault(
      "upcoming"
    )
  );
  const location = useLocation();
  const navigate = useNavigate();

  const filteredEvents = useMemo(() => {
    if (!events) {
      return [];
    }
    const typeFilter = eventTypeFilter || "all";
    let filtered = events;

    // Фильтр по типу мероприятия
    if (typeFilter !== "all") {
      filtered = filtered.filter((event) => event.event_type === typeFilter);
    }

    // Фильтр по городу
    if (cityFilter && locations) {
      filtered = filtered.filter((event) => {
        if (!event.location_id) return false;
        const location = locations.find((loc) => loc.id === event.location_id);
        return location?.cities?.id === cityFilter;
      });
    }

    const now = new Date();
    const upcoming = filtered.filter(
      (event) => new Date(event.event_date) > now
    );
    const past = filtered.filter((event) => new Date(event.event_date) <= now);

    // Фильтр по релевантности
    let relevanceFiltered: Event[] = [];
    if (relevanceFilter === "upcoming") {
      relevanceFiltered = upcoming;
    } else if (relevanceFilter === "past") {
      relevanceFiltered = past;
    } else {
      relevanceFiltered = [...upcoming, ...past];
    }

    upcoming.sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );

    past.sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );

    return relevanceFiltered;
  }, [events, eventTypeFilter, cityFilter, relevanceFilter]);

  useEffect(() => {
    if (location.state?.refresh) {
      refresh();
      // Очищаем state, чтобы не обновлять при каждом рендере
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, refresh, navigate, location.pathname]);

  const handleSuccess = () => {
    refresh();
    setOpen(false);
  };

  if (pending) {
    return (
      <LayoutMain>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка мероприятий...</p>
        </div>
      </LayoutMain>
    );
  }

  if (error) {
    return (
      <LayoutMain>
        <div className="text-center py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Ошибка загрузки
            </h2>
            <p className="text-destructive/80">{error}</p>
          </div>
        </div>
      </LayoutMain>
    );
  }

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-y-auto custom-scrollbar dialog-max-height">
          <CreateEventDialogForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
      <LayoutMain>
        <LayoutHeader>
          <LayoutTitle>
            <h2 className="text-2xl font-bold text-foreground">Мероприятия</h2>
          </LayoutTitle>
          <LayoutAction>
            <Button size={size} onClick={() => setOpen(true)}>
              + Создать
            </Button>
          </LayoutAction>
        </LayoutHeader>
        <LayoutBody>
          <Tabs
            value={eventTypeFilter || "all"}
            onValueChange={(value) =>
              setEventTypeFilter(value as EventTypeFilter)
            }
            className="w-full"
          >
            <div className="space-y-4 mb-4 md:mb-6">
              <div className="flex items-center justify-between gap-4">
                <TabsList className="w-auto">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  {/* Все ({eventCounts.all}) */}
                  <TabsTrigger value="brain">
                    Мозгомания
                    {/* Мзг. ({eventCounts.brain}) */}
                  </TabsTrigger>
                  <TabsTrigger value="audio">
                    Лото
                    {/* Лото ({eventCounts.audio}) */}
                  </TabsTrigger>
                </TabsList>
                
                {/* Иконка фильтров */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      type="button"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden md:inline">Фильтры</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Фильтры</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Город
                        </label>
                        <Select
                          value={cityFilter ? String(cityFilter) : undefined}
                          onValueChange={(value) =>
                            setCityFilter(value && value !== "all" ? Number(value) : null)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Все города" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все города</SelectItem>
                            {cities?.map((city) => (
                              <SelectItem key={city.id} value={String(city.id)}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Релевантность
                        </label>
                        <Select
                          value={relevanceFilter}
                          onValueChange={(value) =>
                            setRelevanceFilter(value as RelevanceFilter)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            <SelectItem value="upcoming">Предстоящие</SelectItem>
                            <SelectItem value="past">Завершенные</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Чипы с выбранными фильтрами для десктопа */}
              {(cityFilter || relevanceFilter !== "all") && (
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  {cityFilter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {cities?.find((c) => c.id === cityFilter)?.name || `Город #${cityFilter}`}
                      <button
                        onClick={() => setCityFilter(null)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {relevanceFilter !== "all" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {relevanceFilter === "upcoming" ? "Предстоящие" : "Завершенные"}
                      <button
                        onClick={() => setRelevanceFilter("all")}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}


              {/* Чипы для мобильной версии (под табами) */}
              {(cityFilter || relevanceFilter !== "all") && (
                <div className="md:hidden flex items-center gap-2 flex-wrap">
                  {cityFilter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {cities?.find((c) => c.id === cityFilter)?.name || `Город #${cityFilter}`}
                      <button
                        onClick={() => setCityFilter(null)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {relevanceFilter !== "all" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {relevanceFilter === "upcoming" ? "Предстоящие" : "Завершенные"}
                      <button
                        onClick={() => setRelevanceFilter("all")}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

            </div>
            <TabsContent value={eventTypeFilter || "all"}>
              {filteredEvents && filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 items-stretch">
                  {filteredEvents.map((event: Event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <>
                  {/* Простое пустое состояние при фильтрации */}
                  {(cityFilter || relevanceFilter !== "all") ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Нет мероприятий, соответствующих выбранным фильтрам
                      </p>
                    </div>
                  ) : (
                    /* Полноценная карточка когда нет фильтров */
                    <div className="text-center py-12">
                      <div className="bg-card/80 backdrop-blur-sm rounded-lg p-8 shadow-lg border">
                        <h3 className="text-xl font-semibold text-foreground mb-4">
                          {(eventTypeFilter || "all") === "all"
                            ? "Пока нет мероприятий"
                            : `Нет мероприятий типа "${eventTypeFilter}"`}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {(eventTypeFilter || "all") === "all"
                            ? "Создайте первое мероприятие, чтобы начать планирование"
                            : `Создайте мероприятие типа "${eventTypeFilter}", чтобы начать планирование`}
                        </p>
                        <Button onClick={() => setOpen(true)}>
                          + Создать мероприятие
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </LayoutBody>
      </LayoutMain>
    </Fragment>
  );
};
