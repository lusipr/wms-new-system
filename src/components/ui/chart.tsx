"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

/* =======================
 * Theme config
 * ======================= */

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

/* =======================
 * Context
 * ======================= */

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

/* =======================
 * Chart Container
 * ======================= */

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

ChartContainer.displayName = "ChartContainer";

/* =======================
 * Chart Style (CSS vars)
 * ======================= */

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, v]) => v.color || v.theme
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    const color =
      item.theme?.[theme as keyof typeof item.theme] || item.color;
    return color ? `  --color-${key}: ${color};` : "";
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

/* =======================
 * Tooltip (v3 SAFE)
 * ======================= */

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
  payload?: Record<string, any>;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    ChartTooltipContentProps & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
      formatter?: (
        value: any,
        name: any,
        item: any,
        index: number,
        payload: any
      ) => React.ReactNode;
    }
>(
  (
    {
      active,
      payload,
      className,
      hideLabel,
      hideIndicator,
      indicator = "dot",
      nameKey,
      labelKey,
      formatter,
      label,
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-32 gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel && label && (
          <div className="font-medium">{label}</div>
        )}

        {payload.map((item, index) => {
          const key = `${nameKey || item.dataKey || item.name || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const color = item.color || item.payload?.fill;

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                {!hideIndicator && (
                  <div
                    className={cn(
                      "rounded-sm",
                      indicator === "dot" && "h-2.5 w-2.5",
                      indicator === "line" && "h-2.5 w-1",
                      indicator === "dashed" &&
                        "h-0 w-3 border-t border-dashed"
                    )}
                    style={{ backgroundColor: color, borderColor: color }}
                  />
                )}
                <span className="text-muted-foreground">
                  {itemConfig?.label || item.name}
                </span>
              </div>

              {formatter
                ? formatter(
                    item.value,
                    item.name,
                    item,
                    index,
                    item.payload
                  )
                : item.value && (
                    <span className="font-mono tabular-nums">
                      {Number(item.value).toLocaleString()}
                    </span>
                  )}
            </div>
          );
        })}
      </div>
    );
  }
);

ChartTooltipContent.displayName = "ChartTooltipContent";

/* =======================
 * Legend (v3 SAFE)
 * ======================= */

type LegendPayloadItem = {
  value?: string;
  color?: string;
  dataKey?: string;
};

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: LegendPayloadItem[];
    verticalAlign?: "top" | "bottom";
    hideIcon?: boolean;
    nameKey?: string;
  }
>(
  (
    { payload, verticalAlign = "bottom", hideIcon, className, nameKey },
    ref
  ) => {
    const { config } = useChart();

    if (!payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item, index) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = config[key];

          return (
            <div key={index} className="flex items-center gap-1.5">
              {!hideIcon && (
                <div
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {itemConfig?.label || item.value}
            </div>
          );
        })}
      </div>
    );
  }
);

ChartLegendContent.displayName = "ChartLegendContent";

/* =======================
 * Helper
 * ======================= */

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  if (!payload || typeof payload !== "object") return undefined;

  const payloadData =
    payload.payload && typeof payload.payload === "object"
      ? payload.payload
      : undefined;

  let resolvedKey = key;

  if (payload[key]) resolvedKey = payload[key];
  else if (payloadData?.[key]) resolvedKey = payloadData[key];

  return config[resolvedKey] || config[key];
}

/* =======================
 * Exports
 * ======================= */

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
