import { GripVertical, Plus, Trash2 } from "lucide-react";
import Input, { Label, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FIELD_TYPES } from "@/lib/constants";

const emptyField = () => ({
  label: "",
  fieldType: "text",
  options: [],
  required: false,
  order: 0,
});

// Section 10.4: Form Builder — lets organizers define custom
// registration fields for Normal events. Locked once event.formLocked
// is true (first registration received), matching backend rules.
const FormBuilder = ({ fields, onChange, locked }) => {
  const addField = () => {
    onChange([...fields, { ...emptyField(), order: fields.length }]);
  };

  const updateField = (index, patch) => {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeField = (index) => {
    onChange(fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((f, i) => ({ ...f, order: i })));
  };

  return (
    <div className="space-y-3">
      {locked && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          This form is locked because at least one registration has already
          been received. Fields can no longer be changed.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={index}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              disabled={locked}
              onClick={() => move(index, -1)}
              className="text-[var(--color-muted)] disabled:opacity-40"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-[var(--color-muted)]">
              Field {index + 1}
            </span>
            <button
              type="button"
              disabled={locked}
              onClick={() => removeField(index)}
              className="ml-auto text-[var(--color-danger)] disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Field Label</Label>
              <Input
                disabled={locked}
                value={field.label}
                placeholder="e.g. T-Shirt Size"
                onChange={(e) => updateField(index, { label: e.target.value })}
              />
            </div>
            <div>
              <Label>Field Type</Label>
              <Select
                disabled={locked}
                value={field.fieldType}
                onChange={(e) =>
                  updateField(index, { fieldType: e.target.value })
                }
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {["dropdown", "radio", "checkbox"].includes(field.fieldType) && (
            <div className="mt-3">
              <Label>Options (comma separated)</Label>
              <Input
                disabled={locked}
                value={field.options?.join(", ") || ""}
                placeholder="Small, Medium, Large"
                onChange={(e) =>
                  updateField(index, {
                    options: e.target.value
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          )}

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={locked}
              checked={field.required}
              onChange={(e) =>
                updateField(index, { required: e.target.checked })
              }
            />
            Required field
          </label>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addField} disabled={locked}>
        <Plus className="h-4 w-4" /> Add Field
      </Button>
    </div>
  );
};

export default FormBuilder;
