import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Track } from "@/entities/slide";
import { TrackCard } from "@/entities/slide/ui/card";
import { CreateTrackDialogForm } from "@/entities/slide/ui/create_dialog_form";
import { useParams } from "react-router-dom";
import { useTracks } from "../../shared/hooks/use_tracks";

export const ProjectsTracks = () => {
  const { id: projectId } = useParams();
  const { data: tracks, pending, error } = useTracks(Number(projectId));

  const projectIdNumber = Number(projectId);

  if (pending) {
    return (
      <div>
        <TracksHeaderLayout projectId={projectIdNumber} />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Загрузка треков...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TracksHeaderLayout projectId={projectIdNumber} />
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Ошибка загрузки
            </h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div>
        <TracksHeaderLayout projectId={projectIdNumber} />
        <div className="text-center py-8">
          <p className="text-gray-500">Треки не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TracksHeaderLayout projectId={projectIdNumber} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track: Track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
};

const TracksHeaderLayout = ({ projectId }: { projectId: number }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium">Треки</h2>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default">+ Добавить трек</Button>
        </DialogTrigger>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <CreateTrackDialogForm projectId={projectId} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
