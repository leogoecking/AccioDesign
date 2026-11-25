import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import {
  CompoundField,
  type CompoundFieldProps,
} from "~/puck/components/field";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";

export const formMethods = ["get", "post", "put", "patch", "delete"] as const;

export type FormMethods = (typeof formMethods)[number];

export interface CompoundFormProps {
  title?: string;
  description?: string;
  fields: CompoundFieldProps[];
  action: string;
  method: FormMethods;
  button: CompoundButtonProps;
}

export const CompoundForm = (props: CompoundFormProps) => {
  const isEditorMode = useIsEditorMode();

  return (
    <Card className="w-full max-w-md">
      {(props.title || props.description) ? (
        <CardHeader>
          {props.title ? <CardTitle>{props.title}</CardTitle> : null}
          {props.description ? (
            <CardDescription>{props.description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent>
        <form
          action={props.action}
          method={props.method}
          className="flex flex-col gap-4"
          onSubmit={isEditorMode ? (e) => e.preventDefault() : undefined}
        >
          {props.fields.map((field, index) => (
            <CompoundField
              key={`${field.name}-${index}`}
              id={`field-${index}-${field.name}`}
              {...field}
            />
          ))}
          {props.button?.label ? (
            <CompoundButton
              label={props.button.label}
              variant={props.button.variant}
              size={props.button.size}
              icon={props.button.icon}
              type="submit"
              className="mt-1 w-full"
            />
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
};
