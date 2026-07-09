import React from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

const ImageLightbox = ({ open, onOpenChange, src, alt }) => {
  if (!src) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-transparent p-4">
          <div className="relative">
            <Dialog.Close className="absolute right-0 top-0 text-white">
              <X className="h-6 w-6" />
            </Dialog.Close>
            <img
              src={src}
              alt={alt || "Image"}
              className="max-h-[80vh] w-full object-contain rounded"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ImageLightbox;
