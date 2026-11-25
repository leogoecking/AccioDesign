import type { ComponentType } from "react";

// The presentation components only pass className to slots.
export type VisualSlot = ComponentType<{ className?: string }>;
