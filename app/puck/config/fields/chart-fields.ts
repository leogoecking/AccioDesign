export const chartColorTokenField = {
  type: "select",
  label: "Cor semântica",
  options: [
    { label: "Série 1 (chart-1)", value: "chart-1" },
    { label: "Série 2 (chart-2)", value: "chart-2" },
    { label: "Série 3 (chart-3)", value: "chart-3" },
    { label: "Série 4 (chart-4)", value: "chart-4" },
    { label: "Série 5 (chart-5)", value: "chart-5" },
    { label: "Primária (primary)", value: "primary" },
    { label: "Secundária (secondary)", value: "secondary" },
    { label: "Destaque (accent)", value: "accent" },
    { label: "Alerta (destructive)", value: "destructive" },
  ],
} as const;

export const chartValueFormatField = {
  type: "select",
  label: "Formato dos valores",
  options: [
    { label: "Número padrão", value: "number" },
    { label: "Moeda (R$)", value: "currency" },
    { label: "Percentual (%)", value: "percent" },
    { label: "Compacto (mil / mi)", value: "compact" },
  ],
} as const;

export const chartHeightField = {
  type: "radio",
  label: "Altura do gráfico",
  options: [
    { label: "Compacta", value: "sm" },
    { label: "Padrão", value: "md" },
    { label: "Ampla", value: "lg" },
  ],
} as const;

export const chartCurveField = {
  type: "radio",
  label: "Traçado da curva",
  options: [
    { label: "Suave", value: "monotone" },
    { label: "Linear", value: "linear" },
    { label: "Degraus", value: "step" },
  ],
} as const;

export const seriesConfigField = (label: string) =>
  ({
    type: "object",
    label,
    objectFields: {
      label: { type: "text", label: "Nome da série" },
      color: chartColorTokenField,
    },
  }) as const;
