import { deleteFileByUrl } from "@/actions/file";
import { AudioPreview } from "@/components/ui/audio_preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm_dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAudioDuration } from "@/shared/hooks/use_audio_duration";
import { useTrack } from "@/shared/hooks/use_track";
import { formatDuration } from "@/shared/utils";
import { Edit3, Trash } from "lucide-react";
import { useState } from "react";
import type { Track } from "../types";
import { CreateTrackDialogForm } from "./create_dialog_form";

export const TrackCard = ({ track }: { track: Track }) => {
  const { duration, loading, error } = useAudioDuration(track.audio_src);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteAudio, setDeleteAudio] = useState(true);
  const [deleteImage, setDeleteImage] = useState(true);

  const { onDelete } = useTrack(track.id, true);

  const handleDelete = async () => {
    // Удаляем файлы (функция сама обрабатывает невалидные URL)
    if (deleteImage && track.image_src) {
      await deleteFileByUrl(track.image_src, "photos");
    }
    if (deleteAudio && track.audio_src) {
      await deleteFileByUrl(track.audio_src, "audios");
    }
    // Удаляем трек из базы данных
    await onDelete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {track.author} - {track.name}
        </CardTitle>
        {track.image_src && (
          <img
            src={track.image_src}
            alt={track.name || "Track cover"}
            className="w-full h-32 object-cover rounded-md mt-2"
          />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Audio Preview */}
        <AudioPreview audioSrc={track.audio_src || ""} showControls={true} />

        {/* Duration Info */}
        {track.audio_src && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {loading && "Загрузка..."}
              {error && "Ошибка загрузки"}
              {duration && !loading && !error && (
                <span>Длительность: {formatDuration(duration)}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Edit Button */}
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <CreateTrackDialogForm
                    projectId={track.project_id}
                    defaultValues={{
                      id: track.id,
                      name: track.name,
                      author: track.author,
                      audio_src: track.audio_src,
                      image_src: track.image_src,
                      index: track.index,
                      project_id: track.project_id,
                    }}
                    onSuccess={() => setIsEditing(false)}
                  />
                </DialogContent>
              </Dialog>
              <ConfirmDialog
                variant="destructive"
                title={`Удалить ${track.author} - ${track.name}`}
                confirmText="Удалить трек"
                onConfirm={handleDelete}
                description={
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Вы уверены, что хотите удалить трек? Это действие не может
                      быть отменено.
                    </div>
                    {/* <FormField */}
                    <Separator />
                    <div className="flex flex-col gap-2">
                      {track.image_src && (
                        <div>
                          <Label className="text-base font-semibold text-black mb-2">
                            Удалить изображение из галереи
                          </Label>
                          <Switch
                            checked={deleteImage}
                            onCheckedChange={setDeleteImage}
                          />
                        </div>
                      )}
                      {track.audio_src && (
                        <div>
                          <Label className="text-base font-semibold text-black mb-2">
                            Удалить аудио файл из хранилища
                          </Label>
                          <Switch
                            checked={deleteAudio}
                            onCheckedChange={setDeleteAudio}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                }
              >
                <Button variant="outline" size="sm">
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </ConfirmDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
