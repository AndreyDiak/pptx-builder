import type { PropsWithChildren } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

interface Props extends PropsWithChildren {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ConfirmDialog = ({
  children,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отменить",
  variant = "default",
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter>
          <DialogClose onClick={onConfirm} asChild>
            <Button variant={variant}>{confirmText}</Button>
          </DialogClose>
          <DialogClose onClick={onCancel} asChild>
            <Button variant="secondary">{cancelText}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
