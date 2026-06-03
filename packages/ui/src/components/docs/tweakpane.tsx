"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/animate-ui/collapsible";
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
import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

type BaseBindNumber = { value: number };
type BindNumberSlider = BaseBindNumber & {
  min: number;
  max: number;
  step: number;
};
type BindNumberOptions = BaseBindNumber & { options: Record<string, number> };
type BindNumber = BindNumberSlider | BindNumberOptions | BaseBindNumber;
type BindString = {
  value: string;
  options?: Record<string, string>;
};
type BindOptions = {
  value: string | number | boolean;
  options: Record<string, string | number | boolean>;
};
type BindBoolean = { value: boolean };
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
        if (!isNaN(n)) {
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
    <div className="flex flex-row gap-2.5" key={key}>
      <div className="flex w-[80px] min-w-0 shrink-0 items-center">
        <Label
          className="block truncate text-current/80 leading-[1.2]"
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
        className="h-8 w-[50px] shrink-0 rounded-md px-2"
        id={key}
        max={bind.max}
        min={bind.min}
        onValueChange={onChange}
        step={bind.step}
        value={bind.value}
      />
    </div>
  ) : "options" in bind ? (
    <div className="flex flex-row gap-2.5" key={key}>
      <div className="flex w-[80px] min-w-0 shrink-0 items-center truncate">
        <Label
          className="block truncate text-current/80 leading-[1.2]"
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
          className="!h-8 flex-1 shrink-0 rounded-md px-2"
          id={key}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>

        <SelectContent>
          {Object.entries(bind.options).map(([key, value]) => (
            <SelectItem className="!h-8" key={key} value={value.toString()}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : (
    <div className="flex flex-row gap-2.5" key={key}>
      <div className="flex w-[80px] min-w-0 shrink-0 items-center truncate">
        <Label
          className="block truncate text-current/80 leading-[1.2]"
          htmlFor={key}
        >
          {key}
        </Label>
      </div>

      <NumericInput
        className="h-8 w-full rounded-md px-2"
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
    <div className="flex flex-row gap-2.5" key={key}>
      <div className="flex w-[80px] min-w-0 shrink-0 items-center truncate">
        <Label
          className="block truncate text-current/80 leading-[1.2]"
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
          className="!h-8 flex-1 shrink-0 rounded-md px-2"
          id={key}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>

        <SelectContent>
          {Object.entries(bind.options).map(([key, value]) => (
            <SelectItem className="!h-8" key={key} value={String(value)}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : (
    <div className="flex flex-row gap-2.5" key={key}>
      <div className="flex w-[80px] min-w-0 shrink-0 items-center truncate">
        <Label
          className="block truncate text-current/80 leading-[1.2]"
          htmlFor={key}
        >
          {key}
        </Label>
      </div>

      <Input
        className="h-8 w-full rounded-md px-2"
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
  <div className="flex flex-row justify-between gap-2.5" key={key}>
    <div className="flex w-[80px] min-w-0 shrink-0 items-center">
      <Label
        className="block truncate text-current/80 leading-[1.2]"
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
  <div className="flex flex-col gap-2 rounded-[7px] bg-background py-[7px] pr-1.5 pl-2">
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
  onBindsChange: (binds: NestedBinds) => void,
  initial: boolean
): React.ReactNode[] =>
  Object.entries(binds).map(([groupKey, groupBind]) => (
    <Collapsible
      className="flex flex-col not-first:pt-1 first:-mt-0.5"
      defaultOpen
      key={groupKey}
    >
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between truncate rounded-md p-1.5">
        <Label className="block truncate text-current/80 leading-[1.2]">
          {groupKey}
        </Label>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </CollapsibleTrigger>

      <CollapsibleContent {...(initial ? {} : { initial: false })}>
        <div className="mt-1">
          {renderFlatBinds(groupBind, (updatedGroupBind) =>
            onBindsChange({ ...binds, [groupKey]: updatedGroupBind })
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  ));

const renderBinds = (
  binds: Binds,
  onBindsChange: (binds: Binds) => void,
  inital: boolean
) =>
  isNestedBinds(binds)
    ? renderNestedBinds(
        binds,
        onBindsChange as (b: NestedBinds) => void,
        inital
      )
    : renderFlatBinds(binds, onBindsChange as (b: FlatBinds) => void);

const Tweakpane = ({ onBindsChange, ...props }: TweakpaneProps) => {
  const [localBinds, setLocalBinds] = React.useState<Binds>(
    "binds" in props ? props.binds : props.initialBinds
  );
  const [initial, setInitial] = React.useState(false);

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
    setTimeout(() => setInitial(true), 500);
  }, [props]);

  return (
    <div className="size-full bg-transparent p-1.5 pl-0">
      <div className="flex size-full flex-col overflow-y-auto rounded-[5px] bg-accent p-1.5">
        {renderBinds(localBinds, handleBindsChange, initial)}
      </div>
    </div>
  );
};

export { type Binds, Tweakpane, type TweakpaneProps };
