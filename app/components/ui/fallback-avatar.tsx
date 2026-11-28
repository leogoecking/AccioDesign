/**
 * Adapted from Spell UI `fallback-avatar` (https://github.com/xxtomm/spell-ui)
 * Licensed under the MIT License (see app/export/licenses/LICENSE-SPELLUI-MIT.txt).
 *
 * Modifications for AccioDesign:
 * - Replaced hardcoded color palettes and continuous canvas animation with deterministic
 *   gradients derived from semantic theme CSS custom properties (Light/Dark safe).
 * - Added automatic image `onError` fallback, accessible ARIA labeling, and reduced-motion support.
 */
import * as React from "react";
import { cn } from "cn";

const TOKEN_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["--chart-1", "--chart-2"],
  ["--chart-2", "--chart-3"],
  ["--chart-3", "--chart-4"],
  ["--chart-4", "--chart-5"],
  ["--primary", "--accent"],
];

function hashName(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const SIZE_CLASS = {
  sm: "size-7 text-[11px]",
  default: "size-9 text-xs",
  lg: "size-11 text-sm",
} as const;

export interface FallbackAvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "default" | "lg";
  decorative?: boolean;
  className?: string;
}

export function FallbackAvatar({
  name,
  src,
  size = "default",
  decorative = false,
  className,
}: FallbackAvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const normalizedName = name.trim() || "Usuário";
  const pair = TOKEN_PAIRS[hashName(normalizedName) % TOKEN_PAIRS.length];
  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(135deg, color-mix(in oklab, var(${pair[0]}) 24%, var(--muted)), color-mix(in oklab, var(${pair[1]}) 20%, var(--secondary)))`,
  };

  const showImage = Boolean(src && src.trim() && !imageFailed);

  return (
    <span
      data-slot="fallback-avatar"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : normalizedName}
      style={showImage ? undefined : gradientStyle}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 font-medium text-foreground select-none transition-opacity motion-reduce:transition-none",
        SIZE_CLASS[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={decorative ? "" : normalizedName}
          onError={() => setImageFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span>{getInitials(normalizedName)}</span>
      )}
    </span>
  );
}
