import type { City } from "@/actions/city";
import { deleteCity } from "@/actions/city";
import type { Location } from "@/actions/location";
import { deleteLocation } from "@/actions/location";
import { Button, Card, CardContent, CardHeader, CardTitle, Popover, PopoverContent, PopoverTrigger } from "@/components/ui/base";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog/confirm_dialog";
import {
	LayoutBody,
	LayoutHeader,
	LayoutMain,
	LayoutTitle
} from "@/components/ui/layout";
import { CreateCityDialogForm } from "@/entities/city/ui/create_dialog_form";
import { CreateLocationDialogForm } from "@/entities/location/ui/create_dialog_form";
import { useCities } from "@/shared/hooks/use_cities";
import { useLocations } from "@/shared/hooks/use_locations";
import { useSize } from "@/shared/hooks/use_size";
import { ArrowUpDown, Building2, Edit, MapPin, MoreVertical, Plus, Trash2 } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";

type SortOrder = "asc" | "desc";

export const AdminPage = () => {
  const { data: cities, pending: citiesPending, refresh: refreshCities } = useCities();
  const { data: locations, pending: locationsPending, refresh: refreshLocations } = useLocations();
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [citySortOrder, setCitySortOrder] = useState<SortOrder>("asc");
  const [locationSortOrder, setLocationSortOrder] = useState<SortOrder>("asc");
  const size = useSize();

  const sortedCities = useMemo(() => {
    if (!cities) return [];
    return [...cities].sort((a, b) => {
      return citySortOrder === "asc" ? a.id - b.id : b.id - a.id;
    });
  }, [cities, citySortOrder]);

  const sortedLocations = useMemo(() => {
    if (!locations) return [];
    return [...locations].sort((a, b) => {
      return locationSortOrder === "asc" ? a.id - b.id : b.id - a.id;
    });
  }, [locations, locationSortOrder]);

  const handleCitySuccess = () => {
    refreshCities();
    setCityDialogOpen(false);
    setEditingCity(null);
  };

  const handleLocationSuccess = () => {
    refreshLocations();
    setLocationDialogOpen(false);
    setEditingLocation(null);
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCityDialogOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setLocationDialogOpen(true);
  };

  const handleDeleteCity = async (city: City) => {
    try {
      const result = await deleteCity(city.id);
      if (result.error) {
        toast.error(`Ошибка удаления города: ${result.error.message}`);
      } else {
        toast.success("Город успешно удален");
        refreshCities();
      }
    } catch (error) {
      console.error("Error deleting city:", error);
      toast.error("Не удалось удалить город");
    }
  };

  const handleDeleteLocation = async (location: Location) => {
    try {
      const result = await deleteLocation(location.id);
      if (result.error) {
        toast.error(`Ошибка удаления локации: ${result.error.message}`);
      } else {
        toast.success("Локация успешно удалена");
        refreshLocations();
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Не удалось удалить локацию");
    }
  };

  const toggleCitySort = () => {
    setCitySortOrder(citySortOrder === "asc" ? "desc" : "asc");
  };

  const toggleLocationSort = () => {
    setLocationSortOrder(locationSortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <Fragment>
      <Dialog 
        open={cityDialogOpen} 
        onOpenChange={(open) => {
          setCityDialogOpen(open);
          if (!open) setEditingCity(null);
        }}
      >
        <DialogContent className="overflow-y-auto custom-scrollbar dialog-max-height">
          <CreateCityDialogForm 
            defaultValues={editingCity || undefined}
            onSuccess={handleCitySuccess} 
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={locationDialogOpen} 
        onOpenChange={(open) => {
          setLocationDialogOpen(open);
          if (!open) setEditingLocation(null);
        }}
      >
        <DialogContent className="overflow-y-auto custom-scrollbar dialog-max-height">
          <CreateLocationDialogForm 
            defaultValues={editingLocation || undefined}
            onSuccess={handleLocationSuccess} 
          />
        </DialogContent>
      </Dialog>

      <LayoutMain>
        <LayoutHeader>
          <LayoutTitle>
            <h2 className="text-2xl font-bold text-foreground">Администрирование</h2>
          </LayoutTitle>
        </LayoutHeader>
        <LayoutBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Таблица городов */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Города
                  </CardTitle>
                  <Button
                    size={size}
                    onClick={() => setCityDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {citiesPending ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Загрузка городов...</p>
                  </div>
                ) : sortedCities && sortedCities.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                            <button
                              onClick={toggleCitySort}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              ID
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                            Название
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-foreground w-12">
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCities.map((city) => (
                          <tr
                            key={city.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {city.id}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground font-medium">
                              {city.name || "—"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="end">
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                      onClick={() => {
                                        handleEditCity(city);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                      Редактировать
                                    </Button>
                                    <ConfirmDialog
                                      title="Удалить город?"
                                      description={`Вы уверены, что хотите удалить город "${city.name}"?`}
                                      confirmText="Удалить"
                                      cancelText="Отмена"
                                      variant="destructive"
                                      onConfirm={() => {
                                        handleDeleteCity(city);
                                      }}
                                    >
                                      <button
                                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Удалить
                                      </button>
                                    </ConfirmDialog>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет городов</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Таблица локаций */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Локации
                  </CardTitle>
                  <Button
                    size={size}
                    onClick={() => setLocationDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {locationsPending ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Загрузка локаций...</p>
                  </div>
                ) : sortedLocations && sortedLocations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                            <button
                              onClick={toggleLocationSort}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              ID
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                            Название
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                            Город
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-foreground w-12">
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedLocations.map((location) => (
                          <tr
                            key={location.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {location.id}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground font-medium">
                              {location.name}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {location.cities?.name || "—"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="end">
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                      onClick={() => {
                                        handleEditLocation(location);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                      Редактировать
                                    </Button>
                                    <ConfirmDialog
                                      title="Удалить локацию?"
                                      description={`Вы уверены, что хотите удалить локацию "${location.name}"?`}
                                      confirmText="Удалить"
                                      cancelText="Отмена"
                                      variant="destructive"
                                      onConfirm={() => handleDeleteLocation(location)}
                                    >
                                      <button
                                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Удалить
                                      </button>
                                    </ConfirmDialog>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет локаций</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </LayoutBody>
      </LayoutMain>
    </Fragment>
  );
};

