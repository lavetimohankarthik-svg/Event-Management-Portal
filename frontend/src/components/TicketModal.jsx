import { Dialog } from "radix-ui";
import { X, Ticket } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Section 9.5: Tickets & QR — shown when a participant clicks a
// ticket ID from their Participation History.
const TicketModal = ({ open, onOpenChange, registration }) => {
  if (!registration) return null;

  const event = registration.event || {};

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="flex items-center gap-2 text-base font-semibold text-[var(--color-primary-dark)]">
              <Ticket className="h-4 w-4" /> Your Ticket
            </Dialog.Title>
            <Dialog.Close className="text-[var(--color-muted)]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] p-4">
            {registration.qrCode && (
              <img
                src={registration.qrCode}
                alt="Ticket QR Code"
                className="h-40 w-40"
              />
            )}
            <p className="break-all text-center text-xs font-mono text-[var(--color-muted)]">
              {registration.ticketId}
            </p>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">Event</dt>
              <dd className="font-medium">{event.eventName || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">Status</dt>
              <dd className="font-medium capitalize">
                {registration.registrationStatus}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">Checked In</dt>
              <dd className="font-medium">
                {registration.checkedIn ? "Yes" : "Not yet"}
              </dd>
            </div>
            {event.startDate && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Starts</dt>
                <dd className="font-medium">{formatDate(event.startDate)}</dd>
              </div>
            )}
          </dl>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TicketModal;
