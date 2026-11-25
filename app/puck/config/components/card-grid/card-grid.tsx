import { cn } from "cn";
import {
  CompoundCard,
  type CompoundCardProps,
} from "~/puck/components/card";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import {
  CompoundContent,
  type CompoundContentProps,
} from "~/puck/components/content";

export interface CardGridProps extends CompoundContentProps {
  padding?: CompoundContainerProps["padding"];
  columns?: "2" | "3" | "4";
  cards: CompoundCardProps[];
}

export const CardGrid = ({
  padding,
  className,
  badge,
  heading,
  description,
  features,
  buttons,
  columns = "3",
  cards = [],
}: CardGridProps) => {
  const gridColsClass = {
    "2": "sm:grid-cols-2",
    "3": "sm:grid-cols-2 lg:grid-cols-3",
    "4": "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <CompoundContainer padding={padding} className={className}>
      <div className="flex flex-col gap-8">
        <CompoundContent
          badge={badge}
          heading={heading}
          description={description}
          features={features}
          buttons={buttons}
          alignContent="start"
          spacing="tight"
        />
        <div className={cn("grid grid-cols-1 gap-6", gridColsClass)}>
          {cards.map((card, index) => (
            <CompoundCard
              key={index}
              icon={card.icon}
              heading={card.heading}
              description={card.description}
              button={card.button}
              className="h-full"
            />
          ))}
        </div>
      </div>
    </CompoundContainer>
  );
};
