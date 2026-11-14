"use client";

import "dialkit/styles.css";
import { Button } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { SlidersHorizontal, Undo2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Fragment, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  ControlColor,
  ControlFolder,
  ControlSelect,
  ControlSlider,
  ControlText,
  ControlToggle,
} from "./controls";

interface BaseBindNumber {
  value: number;
}
type BindNumberSlider = BaseBindNumber & {
  max: number;
  min: number;
  step: number;
};
type BindNumberOptions = BaseBindNumber & {
  options: Record<string, number | TweakpanePrimitive>;
};
type BindNumber = BindNumberSlider | BindNumberOptions | BaseBindNumber;
interface BindString {
  options?: Record<string, string | TweakpanePrimitive>;
  value: string;
}
type TweakpanePrimitive = string | number | boolean;
interface BindOptions {
  options: Record<string, TweakpanePrimitive>;
  value: TweakpanePrimitive;
}
interface BindBoolean {
  value: boolean;
}
type Bind = BindNumber | BindString | BindBoolean | BindOptions;

type FlatBinds = Record<string, Bind>;
type NestedBinds = Record<string, FlatBinds>;
type Binds = FlatBinds | NestedBinds;

interface ControlledTweakpaneProps {
  binds: Binds;
  columns?: 1 | 2;
  compact?: boolean;
  initialBinds?: Binds;
  onBindsChange?: (binds: Binds) => void;
  onReset?: () => void;
  stacked?: boolean;
  title?: string;
}

interface UncontrolledTweakpaneProps {
  columns?: 1 | 2;
  compact?: boolean;
  initialBinds: Binds;
  onBindsChange?: (binds: Binds) => void;
  onReset?: () => void;
  stacked?: boolean;
  title?: string;
}

type TweakpaneProps = ControlledTweakpaneProps | UncontrolledTweakpaneProps;

const isNestedBinds = (binds: Binds): binds is NestedBinds =>
  Object.values(binds).every(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      !("value" in v) &&
      Object.values(v).every(
        (inner) =>
          typeof inner === "object" && inner !== null && "value" in inner
      )
  );

const renderNumber = (
  key: string,
  bind: BindNumber,
  onChange: (value: number) => void
) => {
  if ("min" in bind && "max" in bind) {
    return (
      <ControlSlider
        key={key}
        label={key}
        max={bind.max}
        min={bind.min}
        onChange={onChange}
        step={bind.step}
        value={bind.value}
      />
    );
  }

  if ("options" in bind) {
    const optionEntries = Object.entries(bind.options);
    return (
      <ControlSelect
        key={key}
        label={key}
        onChange={(v) => onChange(Number(v))}
        options={optionEntries.map(([optLabel, optValue]) => ({
          label: optLabel,
          value: optValue.toString(),
        }))}
        value={bind.value.toString()}
      />
    );
  }

  return (
    <ControlText
      key={key}
      label={key}
      onChange={(v) => {
        const n = Number(v);
        if (!Number.isNaN(n)) {
          onChange(n);
        }
      }}
      value={bind.value.toString()}
    />
  );
};

const HEX_COLOR_REGEX = /^#(?:[\da-fA-F]{3,4}|[\da-fA-F]{6}|[\da-fA-F]{8})$/;
const FUNCTIONAL_COLOR_REGEX =
  /^(?:oklch|rgb|rgba|hsl|hsla|color|lab|lch|oklab|hwb)\(/i;

const isColorValue = (value: string): boolean => {
  const trimmed = value.trim();
  return HEX_COLOR_REGEX.test(trimmed) || FUNCTIONAL_COLOR_REGEX.test(trimmed);
};

const renderString = (
  key: string,
  bind: BindString,
  onChange: (value: string | number | boolean) => void
) => {
  if (bind?.options) {
    const optionEntries = Object.entries(bind.options);
    return (
      <ControlSelect
        key={key}
        label={key}
        onChange={(v) => {
          const realValue = Object.values(bind.options ?? {}).find(
            (opt) => String(opt) === v
          );
          onChange(realValue ?? v);
        }}
        options={optionEntries.map(([optLabel, optValue]) => ({
          label: optLabel,
          value: String(optValue),
        }))}
        value={String(bind.value)}
      />
    );
  }

  if (typeof bind.value === "string" && isColorValue(bind.value)) {
    return (
      <ControlColor
        key={key}
        label={key}
        onChange={(v) => onChange(v)}
        value={bind.value}
      />
    );
  }

  return (
    <ControlText
      key={key}
      label={key}
      onChange={(v) => onChange(v)}
      value={bind.value}
    />
  );
};

const renderBoolean = (
  key: string,
  bind: BindBoolean,
  onChange: (value: boolean) => void
) => (
  <ControlToggle key={key} label={key} onChange={onChange} value={bind.value} />
);

const renderBind = (
  key: string,
  bind: Bind,
  onChange: (value: TweakpanePrimitive) => void
) => {
  if ("value" in bind) {
    if ("options" in bind) {
      if (typeof bind.value === "number") {
        return renderNumber(key, bind as BindNumber, onChange);
      }
      return renderString(key, bind as BindString, (v) => onChange(v));
    }
    if (typeof bind.value === "number") {
      return renderNumber(key, bind as BindNumber, onChange);
    }
    if (typeof bind.value === "string") {
      return renderString(key, bind as BindString, onChange);
    }
    if (typeof bind.value === "boolean") {
      return renderBoolean(key, bind as BindBoolean, onChange);
    }
  }
  return null;
};

const renderFlatBinds = (
  binds: FlatBinds,
  onBindsChange: (binds: FlatBinds) => void,
  columns: 1 | 2
): ReactNode => (
  <div
    className={cn(
      "grid grid-cols-1 gap-2.5 sm:gap-3",
      columns === 2 && "sm:grid-cols-2"
    )}
  >
    {Object.entries(binds).map(([key, bind]) => (
      <Fragment key={key}>
        {renderBind(key, bind, (value) =>
          onBindsChange({ ...binds, [key]: { ...bind, value } } as FlatBinds)
        )}
      </Fragment>
    ))}
  </div>
);

const renderNestedBinds = (
  binds: NestedBinds,
  onBindsChange: (binds: NestedBinds) => void,
  columns: 1 | 2
): ReactNode => {
  const groups = Object.entries(binds);

  if (groups.length === 1) {
    const [groupKey, groupBind] = groups[0];
    return renderFlatBinds(
      groupBind,
      (updatedGroupBind) =>
        onBindsChange({ ...binds, [groupKey]: updatedGroupBind }),
      columns
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(([groupKey, groupBind]) => (
        <ControlFolder defaultOpen={true} key={groupKey} title={groupKey}>
          {renderFlatBinds(
            groupBind,
            (updatedGroupBind) =>
              onBindsChange({ ...binds, [groupKey]: updatedGroupBind }),
            columns
          )}
        </ControlFolder>
      ))}
    </div>
  );
};

const renderBinds = (
  binds: Binds,
  onBindsChange: (binds: Binds) => void,
  columns: 1 | 2
) =>
  isNestedBinds(binds)
    ? renderNestedBinds(
        binds,
        onBindsChange as (b: NestedBinds) => void,
        columns
      )
    : renderFlatBinds(binds, onBindsChange as (b: FlatBinds) => void, columns);

const Tweakpane = (props: TweakpaneProps) => {
  const { onBindsChange, onReset } = props;
  const initialBinds = "initialBinds" in props ? props.initialBinds : undefined;
  const binds = "binds" in props ? props.binds : undefined;
  const columns = props.columns ?? 2;
  const title = props.title ?? "Tweak Props";
  const { resolvedTheme } = useTheme();

  const [localBinds, setLocalBinds] = useState<Binds>(
    binds ?? initialBinds ?? ({} as Binds)
  );

  const handleBindsChange = useCallback(
    (binds: Binds) => {
      setLocalBinds(binds);
      onBindsChange?.(binds);
    },
    [onBindsChange]
  );

  useEffect(() => {
    if ("binds" in props) {
      setLocalBinds(props.binds);
    }
  }, [props]);

  const canReset = Boolean(onReset || initialBinds);

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
      return;
    }
    if (initialBinds) {
      setLocalBinds(initialBinds);
      onBindsChange?.(initialBinds);
    }
  }, [onReset, initialBinds, onBindsChange]);

  return (
    <div
      className="dialkit-container w-full space-y-3 px-1 sm:px-3"
      data-theme={resolvedTheme === "light" ? "light" : "dark"}
    >
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-black/60 dark:text-white/60">
          <SlidersHorizontal className="size-3.5" />
          <span className="font-medium tracking-tight text-black/85 dark:text-white/90">
            {title}
          </span>
        </div>

        {canReset ? (
          <Button
            className="h-6 gap-1 px-2 font-mono text-[11px] text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
            onClick={handleReset}
            size="xs"
            title="Reset props to default"
            variant="ghost"
          >
            <Undo2 className="size-3" />
            <span>Reset</span>
          </Button>
        ) : null}
      </div>

      <div className="w-full">
        {renderBinds(localBinds, handleBindsChange, columns)}
      </div>
    </div>
  );
};

export { type Binds, Tweakpane, type TweakpaneProps };
