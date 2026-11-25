import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import {
  CompoundContent,
  type CompoundContentProps,
} from "~/puck/components/content";
import {
  CompoundForm,
  type CompoundFormProps,
} from "~/puck/components/form";

export interface FormBlockProps extends CompoundContentProps {
  layout: "card" | "split";
  padding?: CompoundContainerProps["padding"];
  form: CompoundFormProps;
}

export const FormBlock = ({
  layout = "split",
  padding,
  className,
  badge,
  heading,
  description,
  features,
  buttons,
  form,
}: FormBlockProps) => {
  return (
    <CompoundContainer padding={padding} className={className}>
      {layout === "card" ? (
        <div className="flex justify-center">
          <CompoundForm
            title={form.title}
            description={form.description}
            fields={form.fields}
            action={form.action}
            method={form.method}
            button={form.button}
          />
        </div>
      ) : (
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <CompoundContent
            badge={badge}
            heading={heading}
            description={description}
            features={features}
            buttons={buttons}
            alignContent="start"
            spacing="normal"
          />
          <div className="flex items-center justify-center lg:justify-end">
            <CompoundForm
              title={form.title}
              description={form.description}
              fields={form.fields}
              action={form.action}
              method={form.method}
              button={form.button}
            />
          </div>
        </div>
      )}
    </CompoundContainer>
  );
};
