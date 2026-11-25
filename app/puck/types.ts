import type { IconName } from "~/puck/components/icon";

export type { IconName };

export type Feature = {
  icon?: IconName;
  name: string;
  description?: string;
};
