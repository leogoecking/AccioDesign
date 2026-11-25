/**
 * Adapted from Tweakcn (https://github.com/jnsahaj/tweakcn)
 * Original source: utils/shadows.ts
 * Licensed under the Apache License, Version 2.0 (see ./LICENSE-TWEAKCN-APACHE-2.0.txt).
 *
 * Modifications for AccioDesign:
 * - Kept `getShadowMap(styles)` as a pure function without global document mutations.
 * - Added safe numeric parsing fallbacks for shadow dimensions.
 */

import { colorFormatter } from "./color-converter";
import { defaultLightThemeStyles } from "./defaults";
import type { ThemeStyleProps } from "./types";

export const getShadowMap = (
  partialStyles: Partial<ThemeStyleProps>
): Record<string, string> => {
  const styles = {
    ...defaultLightThemeStyles,
    ...partialStyles,
  };

  const shadowColor = styles["shadow-color"] || "oklch(0 0 0)";
  const hsl = colorFormatter(shadowColor, "hsl", "3");
  const offsetX = styles["shadow-offset-x"] || "0px";
  const offsetY = styles["shadow-offset-y"] || "1px";
  const blur = styles["shadow-blur"] || "3px";
  const spread = styles["shadow-spread"] || "0px";
  const parsedOpacity = parseFloat(styles["shadow-opacity"]);
  const opacity = Number.isFinite(parsedOpacity) ? parsedOpacity : 0.1;

  const color = (opacityMultiplier: number) =>
    `hsl(${hsl} / ${Math.min(1, Math.max(0, opacity * opacityMultiplier)).toFixed(2)})`;

  const parsedSpread = parseFloat(spread.replace("px", ""));
  const secondLayerSpread = Number.isFinite(parsedSpread) ? parsedSpread - 1 : -1;

  const secondLayer = (fixedOffsetY: string, fixedBlur: string): string => {
    return `${offsetX} ${fixedOffsetY} ${fixedBlur} ${secondLayerSpread}px ${color(1.0)}`;
  };

  return {
    "shadow-2xs": `${offsetX} ${offsetY} ${blur} ${spread} ${color(0.5)}`,
    "shadow-xs": `${offsetX} ${offsetY} ${blur} ${spread} ${color(0.5)}`,
    "shadow-sm": `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("1px", "2px")}`,
    shadow: `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("1px", "2px")}`,
    "shadow-md": `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("2px", "4px")}`,
    "shadow-lg": `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("4px", "6px")}`,
    "shadow-xl": `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("8px", "10px")}`,
    "shadow-2xl": `${offsetX} ${offsetY} ${blur} ${spread} ${color(2.5)}`,
  };
};
