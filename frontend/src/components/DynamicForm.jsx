import { Label, FieldError } from "@/components/ui/Input";
import Input, { Textarea, Select } from "@/components/ui/Input";

// Renders Event.customFields (section 8: dynamic form builder) as an
// actual fillable form, and returns { label, value } pairs matching
// Registration.formResponses.
const DynamicForm = ({ fields = [], values, onChange, errors = {} }) => {
  if (!fields.length) return null;

  const sorted = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0));

  const setValue = (label, value) => onChange({ ...values, [label]: value });

  return (
    <div className="space-y-4">
      {sorted.map((field) => {
        const value = values[field.label] ?? "";

        return (
          <div key={field.label}>
            <Label required={field.required}>{field.label}</Label>

            {field.fieldType === "textarea" && (
              <Textarea
                value={value}
                onChange={(e) => setValue(field.label, e.target.value)}
                rows={3}
              />
            )}

            {field.fieldType === "dropdown" && (
              <Select
                value={value}
                onChange={(e) => setValue(field.label, e.target.value)}
              >
                <option value="">Select an option</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            )}

            {field.fieldType === "radio" && (
              <div className="flex flex-wrap gap-3">
                {field.options?.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <input
                      type="radio"
                      name={field.label}
                      checked={value === opt}
                      onChange={() => setValue(field.label, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {field.fieldType === "checkbox" && (
              <div className="flex flex-wrap gap-3">
                {(field.options?.length ? field.options : ["Yes"]).map(
                  (opt) => {
                    const list = Array.isArray(value) ? value : [];
                    const checked = list.includes(opt);
                    return (
                      <label
                        key={opt}
                        className="flex items-center gap-1.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setValue(
                              field.label,
                              checked
                                ? list.filter((v) => v !== opt)
                                : [...list, opt]
                            )
                          }
                        />
                        {opt}
                      </label>
                    );
                  }
                )}
              </div>
            )}

            {field.fieldType === "file" && (
              <Input
                type="text"
                placeholder="Paste a link to your file (upload elsewhere first)"
                value={value}
                onChange={(e) => setValue(field.label, e.target.value)}
              />
            )}

            {["text", "number", "email"].includes(field.fieldType) && (
              <Input
                type={field.fieldType}
                value={value}
                onChange={(e) => setValue(field.label, e.target.value)}
              />
            )}

            <FieldError message={errors[field.label]} />
          </div>
        );
      })}
    </div>
  );
};

export default DynamicForm;
