import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export const fieldTypes = [
  "text",
  "email",
  "number",
  "password",
  "date",
  "textarea",
  "file",
] as const;

export type FieldTypes = (typeof fieldTypes)[number];

export interface CompoundFieldProps {
  id?: string;
  name: string;
  label: string;
  type: FieldTypes;
  placeholder?: string;
  required?: boolean;
}

export const CompoundField = (props: CompoundFieldProps) => {
  const fieldId = props.id || props.name;

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor={fieldId}>
        {props.label}
        {props.required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {props.type === "textarea" ? (
        <Textarea
          id={fieldId}
          name={props.name}
          placeholder={props.placeholder}
          required={props.required}
        />
      ) : (
        <Input
          id={fieldId}
          name={props.name}
          type={props.type}
          placeholder={props.placeholder}
          required={props.required}
        />
      )}
    </div>
  );
};
