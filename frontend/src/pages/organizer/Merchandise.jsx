import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, ShoppingBag } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/Card";
import Input, { Label, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { currency, formatDate } from "@/lib/utils";

const emptyItem = {
  name: "",
  description: "",
  price: "",
  stock: "",
  purchaseLimitPerParticipant: 5,
  purchaseDeadline: "",
  image: "",
};

const OrganizerMerchandise = () => {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyItem);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const [{ data: itemsRes }, { data: ordersRes }] = await Promise.all([
        api.get("/merchandise"),
        api.get("/merchandise/orders"),
      ]);
      setItems(itemsRes.merchandise || []);
      setOrders(ordersRes.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createItem = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Name, price, and stock are required.");
      return;
    }
    setCreating(true);
    try {
      await api.post("/merchandise", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        purchaseLimitPerParticipant: Number(form.purchaseLimitPerParticipant),
        purchaseDeadline: form.purchaseDeadline || null,
      });
      toast.success("Merchandise item added.");
      setForm(emptyItem);
      load();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const approve = async (orderId) => {
    setBusyId(orderId);
    try {
      await api.put(`/merchandise/approve/${orderId}`);
      toast.success("Order approved — stock updated, ticket generated.");
      load();
    } catch (error) {
      toast.error(apiMessage(error));
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
          List merchandise for sale and review incoming orders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Add New Item</h2>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label required>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label required>Price (₹)</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <Label>Purchase Deadline</Label>
            <Input
              type="datetime-local"
              value={form.purchaseDeadline}
              onChange={(e) => setForm({ ...form, purchaseDeadline: e.target.value })}
            />
          </div>
          <div>
            <Label required>Stock</Label>
            <Input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div>
            <Label>Purchase Limit / Participant</Label>
            <Input
              type="number"
              value={form.purchaseLimitPerParticipant}
              onChange={(e) =>
                setForm({ ...form, purchaseLimitPerParticipant: e.target.value })
              }
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <Button loading={creating} onClick={createItem}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Your Items</h2>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="rounded-xl border border-[var(--color-border)] p-3">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {currency(item.price)} · {item.stock} in stock
              </p>
              {item.purchaseDeadline && (
                <p className="text-xs text-[var(--color-muted)]">
                  Purchase deadline: {formatDate(item.purchaseDeadline)}
                </p>
              )}
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Orders</h2>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          {orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-muted)]">
              No orders yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-[var(--color-muted)]">
                  <th className="pb-2">Participant</th>
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Ordered</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t border-[var(--color-border)]">
                    <td className="py-2.5">
                      {o.participant?.firstName} {o.participant?.lastName}
                    </td>
                    <td className="py-2.5">{o.merchandise?.name}</td>
                    <td className="py-2.5">{o.quantity}</td>
                    <td className="py-2.5">₹{o.totalPrice}</td>
                    <td className="py-2.5">
                      <Badge
                        className={
                          o.paymentStatus === "Approved"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }
                      >
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5">{formatDate(o.createdAt, "d MMM")}</td>
                    <td className="py-2.5">
                      {o.paymentStatus === "Pending" && (
                        <Button
                          size="sm"
                          loading={busyId === o._id}
                          onClick={() => approve(o._id)}
                        >
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default OrganizerMerchandise;
