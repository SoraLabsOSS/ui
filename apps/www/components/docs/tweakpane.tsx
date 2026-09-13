"use client";

import { Input } from "@workspace/ui/components/ui/input";
import { Label } from "@workspace/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/ui/select";
import { Slider } from "@workspace/ui/components/ui/slider";
import { Switch } from "@workspace/ui/components/ui/switch";
import { cn } from "@workspace/ui/lib/utils";
import { SlidersHorizontal, Undo2 } from "lucide-react";
import {
  type ChangeEvent,
  type FC,
  Fragment,
  type InputHTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Button } from "@/registry/ui/base/button";

interface BaseBindNumber {
  value: number;
}
type BindNumberSlider = BaseBindNumber & {
  min: number;
  max: number;
  step: number;
};
type BindNumberOptions = BaseBindNumber & { options: Record<string, number> };
type BindNumber = BindNumberSlider | BindNumberOptions | BaseBindNumber;
interface BindString {
  options?: Record<string, string>;
  value: string;
}
interface BindOptions {
  options: Record<string, string | number | boolean>;
  value: string | number | boolean;
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
  initialBinds?: Binds;
  onBindsChange?: (binds: Binds) => void;
  onReset?: () => void;
}

interface UncontrolledTweakpaneProps {
  initialBinds: Binds;
  onBindsChange?: (binds: Binds) => void;
  onReset?: () => void;
}

type TweakpaneProps = ControlledTweakpaneProps | UncontrolledTweakpaneProps;

interface NumericInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  max?: number;
  min?: number;
  onValueChange: (value: number) => void;
  step?: number;
  value: number;
}

const NumericInput: FC<NumericInputProps> = ({
  value,
  onValueChange,
  className,
  min,
  max,
  step,
  ...props
}) => {
  const [display, setDisplay] = useState<string>(value.toString());

  useEffect(() => setDisplay(value.toString()), [value]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setDisplay(v);
      if (v !== "") {
        let n = Number(v);
        if (!Number.isNaN(n)) {
          if (min !== undefined && n < min) {
            n = min;
          }
          if (max !== undefined && n > max) {
            n = max;
          }
          if (step !== undefined && step > 0) {
            n = Math.round(n / step) * step;
          }
          onValueChange(n);
        }
      }
    },
    [min, max, step, onValueChange]
  );

  const handleBlur = useCallback(() => {
    setDisplay(value.toString());
  }, [value]);

  return (
    <input
      {...props}
      autoComplete="off"
      className={cn(
        "h-6 w-14 rounded border border-border/60 bg-muted/30 px-1.5 text-right font-mono text-[11px] text-foreground transition-colors",
        "hover:border-border focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring/40",
        "[&[type='number']::-webkit-inner-spin-button]:appearance-none [&[type='number']::-webkit-outer-spin-button]:appearance-none",
        className
      )}
      inputMode="decimal"
      max={max}
      min={min}
      onBlur={handleBlur}
      onChange={handleChange}
      step={step}
      type="number"
      value={display}
    />
  );
};

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
      <div
        className="group/item flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 px-2.5 py-2 transition-colors hover:border-border/80 hover:bg-muted/20"
        key={key}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Label
            className="truncate font-mono text-[12px] text-muted-foreground transition-colors group-hover/item:text-foreground"
            htmlFor={key}
            title={key}
          >
            {key}
          </Label>
        </div>

        <div className="flex items-center gap-2.5 sm:w-56 md:w-64">
          <Slider
            className="flex-1"
            max={bind.max}
            min={bind.min}
            onValueChange={(v) => onChange(v[0] ?? 0)}
            step={bind.step}
            value={[bind.value]}
          />
          <NumericInput
            id={key}
            max={bind.max}
            min={bind.min}
            onValueChange={onChange}
            step={bind.step}
            value={bind.value}
          />
        </div>
      </div>
    );
  }

  if ("options" in bind) {
    return (
      <div
        className="group/item flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 px-2.5 py-2 transition-colors hover:border-border/80 hover:bg-muted/20"
        key={key}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Label
            className="truncate font-mono text-[12px] text-muted-foreground transition-colors group-hover/item:text-foreground"
            htmlFor={key}
            title={key}
          >
            {key}
          </Label>
        </div>

        <Select
          onValueChange={(v) => onChange(Number(v))}
          value={bind.value.toString()}
        >
          <SelectTrigger
            className="h-7 w-36 rounded-md border-border/60 bg-muted/20 px-2 font-mono text-[11px] hover:bg-muted/40 sm:w-44"
            id={key}
            size="sm"
          >
            <SelectValue placeholder="Select" />
          </SelectTrigger>

          <SelectContent align="end">
            {Object.entries(bind.options).map(([optLabel, optValue]) => (
              <SelectItem
                className="font-mono text-xs"
                key={optLabel}
                value={optValue.toString()}
              >
                {optLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div
      className="group/item flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 px-2.5 py-2 transition-colors hover:border-border/80 hover:bg-muted/20"
      key={key}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Label
          className="truncate font-mono text-[12px] text-muted-foreground transition-colors group-hover/item:text-foreground"
          htmlFor={key}
          title={key}
        >
          {key}
        </Label>
      </div>

      <NumericInput
        className="w-24 text-left"
        id={key}
        onValueChange={onChange}
        value={bind.value}
      />
    </div>
  );
};

const renderString = (
  key: string,
  bind: BindString,
  onChange: (value: string | number | boolean) => void
) =>
  bind?.options ? (
    <div
      className="group/item flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 px-2.5 py-2 transition-colors hover:border-border/80 hover:bg-muted/20"
      key={key}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Label
          className="truncate font-mono text-[12px] text-muted-foreground transition-colors group-hover/item:text-foreground"
          htmlFor={key}
          title={key}
        >
          {key}
        </Label>
      </div>

      <Select
        onValueChange={(v) => {
          const realValue = Object.values(bind.options ?? {}).find(
            (opt) => String(opt) === v
          );
          onChange(realValue ?? v);
        }}
        value={String(bind.value)}
      >
        <SelectTrigger
          className="h-7 w-36 rounded-md border-border/60 bg-muted/20 px-2 font-mono text-[11px] hover:bg-muted/40 sm:w-44"
          id={key}
          size="sm"
        >
          <SelectValue placeholder="Select" />
        </SelectTrigger>

        <SelectContent align="end">
          {Object.entries(bind.options).map(([optLabel, optValue]) => (
            <SelectItem
              className="font-mono text-xs"
              key={optLabel}
              value={String(optValue)}
            >
              {optLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : (
    <div
      className="group/item flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 px-2.5 py-2 transition-colors hover:border-border/80 hover:bg-muted/20"
      key={key}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Label
          className="truncate font-mono text-[12px] text-muted-foreground transition-colors group-hover/item:text-foreground"
          htmlFor={key}
          title={key}
        >
          {key}
        </Label>
      </div>

      <Input
        className="h-7 w-36 rounded-md border-border/60 bg-muted/20 px-2 font-mono text-[11px] hover:bg-muted/40 sm:w-44"
        id={key}
        onChange={(e) => onChange(e.target.value)}
        value={bind.value}
      />
    </div>
  );

const renderBoolean = (
  key: string,
  bind: BindBoolean,
  onChange: (value: boolean) => void
) => (
  <div
    className="group/item flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 px-2.5 py-2 transition-colors hover:border-border/80 hover:bg-muted/20"
    key={key}
  >
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Label
        className="truncate font-mono text-[12px] text-muted-foreground transition-colors group-hover/item:text-foreground"
        htmlFor={key}
        title={key}
      >
        {key}
      </Label>
    </div>

    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-muted-foreground">
        {bind.value ? "true" : "false"}
      </span>
      <Switch checked={bind.value} id={key} onCheckedChange={onChange} />
    </div>
  </div>
);

const renderBind = (
  key: string,
  bind: Bind,
  onChange: (value: unknown) => void
) => {
  if ("value" in bind) {
    if ("options" in bind) {
      if (typeof bind.value === "number") {
        return renderNumber(key, bind as unknown as BindNumber, onChange);
      }
      return renderString(key, bind as unknown as BindString, (v) =>
        onChange(v)
      );
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
  onBindsChange: (binds: FlatBinds) => void
): ReactNode => (
  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
  onBindsChange: (binds: NestedBinds) => void
): ReactNode[] =>
  Object.entries(binds).map(([groupKey, groupBind]) => (
    <div className="space-y-2" key={groupKey}>
      <div className="flex items-center gap-2 px-1">
        <span className="font-medium font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          {groupKey}
        </span>
        <svg aria-hidden="true" className="block h-px flex-1">
          <line
            className="text-border/60"
            stroke="currentColor"
            strokeDasharray="8 4"
            strokeWidth="1"
            x1="0"
            x2="100%"
            y1="0"
            y2="0"
          />
        </svg>
      </div>
      {renderFlatBinds(groupBind, (updatedGroupBind) =>
        onBindsChange({ ...binds, [groupKey]: updatedGroupBind })
      )}
    </div>
  ));

const renderBinds = (binds: Binds, onBindsChange: (binds: Binds) => void) =>
  isNestedBinds(binds)
    ? renderNestedBinds(binds, onBindsChange as (b: NestedBinds) => void)
    : renderFlatBinds(binds, onBindsChange as (b: FlatBinds) => void);

const Tweakpane = (props: TweakpaneProps) => {
  const { onBindsChange, onReset } = props;
  const initialBinds = "initialBinds" in props ? props.initialBinds : undefined;
  const binds = "binds" in props ? props.binds : undefined;

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
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs">
          <SlidersHorizontal className="size-3.5 text-foreground/70" />
          <span className="font-medium text-foreground/90 tracking-tight">
            Tweak Props
          </span>
        </div>

        {canReset ? (
          <Button
            className="h-6 gap-1 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground"
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

      <div className="w-full">{renderBinds(localBinds, handleBindsChange)}</div>
    </div>
  );
};

export { type Binds, Tweakpane, type TweakpaneProps };
