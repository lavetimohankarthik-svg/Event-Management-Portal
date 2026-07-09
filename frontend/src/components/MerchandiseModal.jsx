import React from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { currency, formatDate } from "@/lib/utils";

const MerchandiseModal = ({ open, onOpenChange, item, onBuy }) => {
  const [qty, setQty] = React.useState(1);

  if (!item) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold">{item.name}</Dialog.Title>
            <Dialog.Close className="text-[var(--color-muted)]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {item.image && (
            <img src={item.image} alt={item.name} className="mb-4 h-52 w-full object-cover rounded-lg" />
          )}

          <p className="text-sm text-[var(--color-muted)]">{item.description}</p>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{currency(item.price)}</p>
              <p className="text-xs text-[var(--color-muted)]">{item.stock} in stock</p>
              {item.purchaseDeadline && (
                <p className="text-xs text-[var(--color-muted)]">
                  Purchase until {formatDate(item.purchaseDeadline)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={item.purchaseLimitPerParticipant}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-24"
              />
              <Button
                onClick={() => onBuy(item, qty)}
                disabled={item.stock === 0 || qty < 1}
              >
                {item.stock === 0 ? "Out of Stock" : "Buy"}
              </Button>
            </div>
          </div>

          <div className="mt-3 text-xs text-[var(--color-muted)]">
            Limit {item.purchaseLimitPerParticipant} per participant
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MerchandiseModal;
