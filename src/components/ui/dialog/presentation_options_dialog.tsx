import { Button } from "@/components/ui/base";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/base";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Download, FileArchive, FileText, Wifi, WifiOff } from "lucide-react";

interface PresentationOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOption: (option: "zip" | "html") => void;
}

export function PresentationOptionsDialog({
  open,
  onOpenChange,
  onSelectOption,
}: PresentationOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Выберите формат презентации</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* ZIP архив вариант */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectOption("zip")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileArchive className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-lg">ZIP архив</CardTitle>
              </div>
              <CardDescription>Отдельные файлы в архиве</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span>Работает без интернета</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  <span>Меньший размер файла</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span>Нужно распаковать архив</span>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full">Создать ZIP архив</Button>
              </div>
            </CardContent>
          </Card>

          {/* HTML с base64 вариант */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectOption("html")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-green-600" />
                <CardTitle className="text-lg">HTML файл</CardTitle>
              </div>
              <CardDescription>Все ассеты встроены в файл</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-green-600" />
                  <span>Полностью автономный</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span>Просто открыть в браузере</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-orange-600" />
                  <span>Больший размер файла</span>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full">Создать HTML файл</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Что включено в презентацию:
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Интерактивная сетка треков</li>
            <li>• Автоматическое воспроизведение музыки</li>
            <li>• Сохранение прогресса</li>
            <li>• Все изображения и аудио файлы</li>
            <li>• Управление клавишами [S], [M], [Q], [R]</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
