"use client";

import { useDialKit } from "dialkit";
import { useEffect, useMemo, useRef } from "react";
import type { Binds } from "@/components/docs/tweakpane";

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

type DialControlValue =
  | [number, number, number, number?]
  | boolean
  | {
      default: string;
      options: { label: string; value: string }[];
      type: "select";
    }
  | {
      default: string;
      type: "color" | "text";
    };

interface RawBindItem {
  max?: number;
  min?: number;
  options?:
    | Record<string, string | number>
    | { label: string; value: string }[];
  step?: number;
  value?: unknown;
}

function resolveMax(item: RawBindItem, val: number): number {
  if (typeof item.max === "number") {
    return item.max;
  }
  return val > 1 ? val * 2 : 100;
}

function resolveStep(item: RawBindItem, val: number): number {
  if (typeof item.step === "number") {
    return item.step;
  }
  return val <= 1 && val > 0 ? 0.05 : 1;
}

function parseBindItem(item: unknown): DialControlValue | null {
  if (!item || typeof item !== "object" || !("value" in item)) {
    return null;
  }

  const bind = item as RawBindItem;
  const val = bind.value;

  if (bind.options && typeof bind.options === "object") {
    const optionsList = Array.isArray(bind.options)
      ? bind.options
      : Object.entries(bind.options).map(([label, optVal]) => ({
          label,
          value: String(optVal),
        }));

    return {
      default: String(val),
      options: optionsList,
      type: "select",
    };
  }

  if (typeof val === "number") {
    const min = typeof bind.min === "number" ? bind.min : 0;
    const max = resolveMax(bind, val);
    const step = resolveStep(bind, val);
    return [val, min, max, step];
  }

  if (typeof val === "boolean") {
    return val;
  }

  if (typeof val === "string") {
    if (HEX_COLOR_RE.test(val)) {
      return { default: val, type: "color" };
    }
    return { default: val, type: "text" };
  }

  return null;
}

function buildDialConfig(rawBinds: Record<string, unknown>) {
  const config: Record<string, DialControlValue> = {};

  for (const [key, item] of Object.entries(rawBinds)) {
    const parsed = parseBindItem(item);
    if (parsed !== null) {
      config[key] = parsed;
    }
  }

  return config;
}

interface DialKitBridgeProps {
  demoPropsConfig: Binds;
  onPropsChange: (props: Record<string, unknown>) => void;
  slug: string;
}

export function DialKitBridge({
  demoPropsConfig,
  onPropsChange,
  slug,
}: DialKitBridgeProps) {
  const rawBinds = useMemo(() => {
    const firstComp = Object.values(demoPropsConfig)[0];
    return (firstComp ?? {}) as Record<string, unknown>;
  }, [demoPropsConfig]);

  const dialConfig = useMemo(() => buildDialConfig(rawBinds), [rawBinds]);

  const hasConfig = Object.keys(dialConfig).length > 0;

  if (!hasConfig) {
    return null;
  }

  return (
    <DialKitRunner
      config={dialConfig}
      onPropsChange={onPropsChange}
      slug={slug}
    />
  );
}

function formatPanelName(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DialKitRunner({
  config,
  onPropsChange,
  slug,
}: {
  config: Record<string, DialControlValue>;
  onPropsChange: (props: Record<string, unknown>) => void;
  slug: string;
}) {
  const panelName = useMemo(() => formatPanelName(slug), [slug]);

  const values = useDialKit(panelName, config, {
    id: `sora-example-${slug}`,
  });

  const onPropsChangeRef = useRef(onPropsChange);
  onPropsChangeRef.current = onPropsChange;

  useEffect(() => {
    onPropsChangeRef.current(values);
  }, [values]);

  return null;
}
