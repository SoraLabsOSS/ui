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
import * as React from "react";

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
  onBindsChange?: (binds: Binds) => void;
}

interface UncontrolledTweakpaneProps {
  initialBinds: Binds;
  onBindsChange?: (binds: Binds) => void;
}

type TweakpaneProps = ControlledTweakpaneProps | UncontrolledTweakpaneProps;

interface NumericInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: number;
  min?: number;
  onValueChange: (value: number) => void;
  step?: number;
  value: number;
}

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onValueChange,
  className,
  min,
  max,
  step,
  ...props
}) => {
  const [display, setDisplay] = React.useState<string>(value.toString());

  React.useEffect(() => setDisplay(value.toString()), [value]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
          if (step !== undefined) {
            n = Math.round(n / step) * step;
          }
          onValueChange(n);
        }
      }
    },
    [min, max, step, onValueChange]
  );

  const handleBlur = React.useCallback(
    () => setDisplay(value.toString()),
    [value]
  );

  return (
    <Input
      {...props}
      autoComplete="off"
      className={cn(
        'text-sm [&[type="number"]::-webkit-inner-spin-button]:appearance-none [&[type="number"]::-webkit-outer-spin-button]:appearance-none',
        className
      )}
      inputMode="numeric"
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
) =>
  "min" in bind && "max" in bind ? (
    <div className="flex flex-row items-center gap-2" key={key}>
      <div className="flex w-[72px] min-w-0 shrink-0 items-center">
        <Label
          className="block truncate text-current/80 text-xs leading-none"
          htmlFor={key}
        >
          {key}
        </Label>
      </div>

      <Slider
        max={bind.max}
        min={bind.min}
        onValueChange={(v) => onChange(v[0] ?? 0)}
        step={bind.step}
        value={[bind.value]}
      />

      <NumericInput
        className="h-7 w-[50px] shrink-0 rounded-md px-2"
        id={key}
        max={bind.max}
        min={bind.min}
        onValueChange={onChange}
        step={bind.step}
        value={bind.value}
      />
    </div>
  ) : "options" in bind ? (
    <div className="flex flex-row items-center gap-2" key={key}>
      <div className="flex w-[72px] min-w-0 shrink-0 items-center truncate">
        <Label
          className="block truncate text-current/80 text-xs leading-none"
          htmlFor={key}
        >
          {key}
        </Label>
      </div>

      <Select
        onValueChange={(v) => onChange(Number(v))}
        value={bind.value.toString()}
      >
        <SelectTrigger
          className="!h-7 flex-1 shrink-0 rounded-md px-2"
          id={key}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>

        <SelectContent>
          {Object.entries(bind.options).map(([key, value]) => (
            <SelectItem className="!h-7" key={key} value={value.toString()}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : (
    <div className="flex flex-row items-center gap-2" key={key}>
      <div className="flex w-[72px] min-w-0 shrink-0 items-center truncate">
        <Label
          className="block truncate text-current/80 text-xs leading-none"
          htmlFor={key}
        >
          {key}
        </Label>
      </div>

      <NumericInput
        className="h-7 w-full rounded-md px-2"
        id={key}
        onValueChange={onChange}
        value={bind.value}
      />
    </div>
  );

const renderString = (
  key: string,
  bind: BindString,
  onChange: (value: string | number | boolean) => void
) =>
  bind?.options ? (
    <div className="flex flex-row items-center gap-2" key={key}>
      <div className="flex w-[72px] min-w-0 shrink-0 items-center truncate">
        <Label
          className="block truncate text-current/80 text-xs leading-none"
          htmlFor={key}
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
          className="!h-7 flex-1 shrink-0 rounded-md px-2"
          id={key}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>

        <SelectContent>
          {Object.entries(bind.options).map(([key, value]) => (
            <SelectItem className="!h-7" key={key} value={String(value)}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : (
    <div className="flex flex-row items-center gap-2" key={key}>
      <div className="flex w-[72px] min-w-0 shrink-0 items-center truncate">
        <Label
          className="block truncate text-current/80 text-xs leading-none"
          htmlFor={key}
        >
          {key}
        </Label>
      </div>

      <Input
        className="h-7 w-full rounded-md px-2"
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
  <div className="flex flex-row items-center justify-between gap-2" key={key}>
    <div className="flex w-[72px] min-w-0 shrink-0 items-center">
      <Label
        className="block truncate text-current/80 text-xs leading-none"
        htmlFor={key}
      >
        {key}
      </Label>
    </div>

    <Switch checked={bind.value} id={key} onCheckedChange={onChange} />
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
): React.ReactNode => (
  <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 rounded-md py-1.5 pr-1 pl-1.5 md:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
    {Object.entries(binds).map(([key, bind]) => (
      <React.Fragment key={key}>
        {renderBind(key, bind, (value) =>
          onBindsChange({ ...binds, [key]: { ...bind, value } } as FlatBinds)
        )}
      </React.Fragment>
    ))}
  </div>
);

const renderNestedBinds = (
  binds: NestedBinds,
  onBindsChange: (binds: NestedBinds) => void
): React.ReactNode[] =>
  Object.entries(binds).map(([groupKey, groupBind]) => (
    <React.Fragment key={groupKey}>
      {renderFlatBinds(groupBind, (updatedGroupBind) =>
        onBindsChange({ ...binds, [groupKey]: updatedGroupBind })
      )}
    </React.Fragment>
  ));

const renderBinds = (binds: Binds, onBindsChange: (binds: Binds) => void) =>
  isNestedBinds(binds)
    ? renderNestedBinds(binds, onBindsChange as (b: NestedBinds) => void)
    : renderFlatBinds(binds, onBindsChange as (b: FlatBinds) => void);

const Tweakpane = ({ onBindsChange, ...props }: TweakpaneProps) => {
  const [localBinds, setLocalBinds] = React.useState<Binds>(
    "binds" in props ? props.binds : props.initialBinds
  );

  const handleBindsChange = React.useCallback(
    (binds: Binds) => {
      setLocalBinds(binds);
      onBindsChange?.(binds);
    },
    [onBindsChange]
  );

  React.useEffect(() => {
    if ("binds" in props) {
      setLocalBinds(props.binds);
    }
  }, [props]);

  return (
    <div className="overflow-y-auto rounded-md bg-background px-2 py-2">
      {renderBinds(localBinds, handleBindsChange)}
    </div>
  );
};

export { type Binds, Tweakpane, type TweakpaneProps };
