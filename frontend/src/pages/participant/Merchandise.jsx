import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { currency } from "@/lib/utils";
import MerchandiseModal from "@/components/MerchandiseModal";
import ImageLightbox from "@/components/ImageLightbox";

const Merchandise = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/merchandise")
      .then(({ data }) => setItems(data.merchandise || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const buy = async (item) => {
    const quantity = Number(quantities[item._id] || 1);

    setBusyId(item._id);
    try {
      await api.post("/merchandise/order", {
        merchandiseId: item._id,
        quantity,
      });
      toast.success("Order placed! Track it from your Dashboard.");
      // refresh list
      load();
    } catch (error) {
      toast.error(apiMessage(error, "Purchase failed."));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading merchandise..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--color-primary-dark)]">
          <ShoppingBag className="h-6 w-6" /> Merchandise
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Grab official Recstacy merch — t-shirts, hoodies, and kits.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--color-muted)]">
          No merchandise listed yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item._id}>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-40 w-full rounded-t-2xl object-cover cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setLightboxOpen(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSelectedItem(item);
                      setLightboxOpen(true);
                    }
                  }}
                />
              )}
              <CardBody className="space-y-2">
                <p className="font-semibold">{item.name}</p>
                <p className="line-clamp-2 text-xs text-[var(--color-muted)]">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[var(--color-primary-dark)]">
                    {currency(item.price)}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">
                    {item.stock} in stock
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={item.purchaseLimitPerParticipant}
                    className="w-20"
                    value={quantities[item._id] || 1}
                    onChange={(e) =>
                      setQuantities({ ...quantities, [item._id]: e.target.value })
                    }
                  />
                  <Button
                    className="flex-1"
                    disabled={item.stock === 0}
                    loading={busyId === item._id}
                    onClick={() => buy(item)}
                  >
                    {item.stock === 0 ? "Out of Stock" : "Buy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setModalOpen(true);
                    }}
                  >
                    Details
                  </Button>
                </div>
                <p className="text-[10px] text-[var(--color-muted)]">
                  Limit {item.purchaseLimitPerParticipant} per participant
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
      <MerchandiseModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedItem(null);
        }}
        item={selectedItem}
        onBuy={async (item, qty) => {
          await buy(item);
          setModalOpen(false);
        }}
      />
      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={(open) => {
          setLightboxOpen(open);
          if (!open) setSelectedItem(null);
        }}
        src={selectedItem?.image}
        alt={selectedItem?.name}
      />
    </div>
  );
};

export default Merchandise;
