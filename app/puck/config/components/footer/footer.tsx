import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";

interface Link {
  label: string;
  url: string;
}

interface PrimaryLinks extends Omit<Link, "url"> {
  url?: string;
  items: Link[];
}

export interface FooterProps {
  companyName: string;
  tagLine?: string;
  padding?: CompoundContainerProps["padding"];
  address?: string;
  legalLinks: Link[];
  navigation: PrimaryLinks[];
}

export const Footer = (props: FooterProps) => {
  const isEditorMode = useIsEditorMode();

  return (
    <CompoundContainer
      padding={props.padding}
      className="bg-foreground text-background"
    >
      <div className="grid items-start gap-10 @min-[1024px]/section:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight @min-[768px]/section:text-3xl">
              {props.companyName}
            </h2>
            {props.tagLine ? (
              <p className="max-w-lg text-sm leading-relaxed text-background/75 @min-[768px]/section:text-base">
                {props.tagLine}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-12 text-xs leading-relaxed text-background/75 @min-[768px]/section:text-sm">
            {props.address ? (
              <p style={{ whiteSpace: "pre-line" }}>{props.address}</p>
            ) : null}
            <div className="flex flex-col gap-1">
              {props.legalLinks?.map((link, index) => (
                <a
                  key={index}
                  href={link.url || "#"}
                  onClick={isEditorMode ? (e) => e.preventDefault() : undefined}
                  className="hover:text-background hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-8 @min-[640px]/section:grid-cols-2 @min-[1024px]/section:grid-cols-3">
          {props.navigation?.map((item, index) => (
            <div key={index} className="flex flex-col items-start gap-2">
              {item.url ? (
                <a
                  href={item.url}
                  onClick={isEditorMode ? (e) => e.preventDefault() : undefined}
                  className="text-base font-medium hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <p className="text-base font-medium">{item.label}</p>
              )}
              {item.items?.map((subItem, subIndex) => (
                <a
                  key={subIndex}
                  href={subItem.url || "#"}
                  onClick={isEditorMode ? (e) => e.preventDefault() : undefined}
                  className="text-sm text-background/75 hover:text-background hover:underline"
                >
                  {subItem.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </CompoundContainer>
  );
};
