"use client";

import {
  type AdditionalField as AdditionalFieldConfig,
  resolveInputType,
} from "@better-auth-ui/core";
import { useAuth } from "@better-auth-ui/react";
import { Button } from "@workspace/ui/components/ui/button";
import { Calendar } from "@workspace/ui/components/ui/calendar";
import { Checkbox } from "@workspace/ui/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/ui/field";
import { Input } from "@workspace/ui/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/ui/input-group";
import { Label } from "@workspace/ui/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/ui/select";
import { Slider } from "@workspace/ui/components/ui/slider";
import { toast } from "@workspace/ui/components/ui/sonner";
import { Switch } from "@workspace/ui/components/ui/switch";
import { Textarea } from "@workspace/ui/components/ui/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronDownIcon, Copy } from "lucide-react";
import { useRef, useState } from "react";

export interface AdditionalFieldProps {
  field: AdditionalFieldConfig;
  isPending?: boolean;
  name: string;
}

/** Convert a `defaultValue` into a `Date` for the calendar. */
function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return;
}

/** Format a Date as `HH:mm:ss` for an `<input type="time">`. */
function formatTime(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Icon-only copy button used as an `InputGroupAddon`. `getValue` is invoked
 * lazily on click so the button copies the input's *live* value rather than a
 * stale snapshot — important when paired with editable inputs.
 */
function CopyButton({
  getValue,
  isDisabled,
}: {
  getValue: () => string | undefined;
  isDisabled?: boolean;
}) {
  const { localization } = useAuth();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const value = getValue();
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <InputGroupButton
      aria-label={localization.settings.copyToClipboard}
      disabled={isDisabled}
      onClick={handleCopy}
      title={localization.settings.copyToClipboard}
    >
      {copied ? <Check /> : <Copy />}
    </InputGroupButton>
  );
}

/** Renders a single additional user field via shadcn primitives. */
export function AdditionalField({
  name,
  field,
  isPending,
}: AdditionalFieldProps) {
  const inputType = resolveInputType(field);
  // Used by `inputType: "input"` with `copyable: true` so the copy button
  // reads the input's *live* value rather than a stale `defaultValue`.
  const inputRef = useRef<HTMLInputElement>(null);

  if (field.render) {
    return <>{field.render({ name, field, isPending })}</>;
  }

  if (inputType === "hidden") {
    return (
      <input
        name={name}
        type="hidden"
        value={
          field.defaultValue == null
            ? ""
            : field.defaultValue instanceof Date
              ? field.defaultValue.toISOString()
              : String(field.defaultValue)
        }
      />
    );
  }

  if (inputType === "textarea") {
    return (
      <Field>
        <Label htmlFor={name}>{field.label}</Label>

        <Textarea
          defaultValue={
            field.defaultValue == null ? undefined : String(field.defaultValue)
          }
          disabled={isPending}
          id={name}
          name={name}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          required={field.required}
        />

        <FieldError />
      </Field>
    );
  }

  if (inputType === "number") {
    const maxFractionDigits = field.formatOptions?.maximumFractionDigits;

    return (
      <Field>
        <Label htmlFor={name}>{field.label}</Label>

        <Input
          defaultValue={
            field.defaultValue == null
              ? undefined
              : typeof field.defaultValue === "number"
                ? field.defaultValue
                : String(field.defaultValue)
          }
          disabled={isPending}
          id={name}
          inputMode={maxFractionDigits ? "decimal" : "numeric"}
          max={field.max}
          min={field.min}
          name={name}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          required={field.required}
          step={
            field.step ??
            (maxFractionDigits ? 1 / 10 ** maxFractionDigits : undefined)
          }
          type="number"
        />

        <FieldError />
      </Field>
    );
  }

  if (inputType === "slider") {
    return <SliderField field={field} isPending={isPending} name={name} />;
  }

  if (inputType === "switch") {
    return (
      <Field orientation="horizontal">
        <Switch
          defaultChecked={
            field.defaultValue === true || field.defaultValue === "true"
          }
          disabled={isPending || field.readOnly}
          id={name}
          name={name}
        />

        <FieldContent>
          <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
        </FieldContent>
      </Field>
    );
  }

  if (inputType === "checkbox") {
    return (
      <Field orientation="horizontal">
        <Checkbox
          defaultChecked={
            field.defaultValue === true || field.defaultValue === "true"
          }
          disabled={isPending || field.readOnly}
          id={name}
          name={name}
          required={field.required}
        />

        <FieldContent>
          <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
        </FieldContent>
      </Field>
    );
  }

  if (inputType === "select") {
    return (
      <Field>
        <Label htmlFor={name}>{field.label}</Label>

        <Select
          defaultValue={
            field.defaultValue == null ? undefined : String(field.defaultValue)
          }
          disabled={isPending || field.readOnly}
          name={name}
          required={field.required}
        >
          <SelectTrigger className="w-full" id={name}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>

          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <FieldError />
      </Field>
    );
  }

  if (inputType === "combobox") {
    return (
      <Field>
        <Label htmlFor={name}>{field.label}</Label>

        <Combobox
          defaultValue={
            field.defaultValue == null ? undefined : String(field.defaultValue)
          }
          disabled={isPending || field.readOnly}
          items={field.options ?? []}
          name={name}
          required={field.required}
        >
          <ComboboxInput id={name} placeholder={field.placeholder} />

          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>

            <ComboboxList>
              {(option) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <FieldError />
      </Field>
    );
  }

  if (inputType === "date" || inputType === "datetime") {
    return <DateInput field={field} isPending={isPending} name={name} />;
  }

  // inputType === "input"
  const hasPrefix = field.prefix != null;
  const hasSuffix = field.suffix != null || field.copyable;

  // When `inputType: "input"` is paired with `type: "number"`, restrict the
  // native input to numbers. `formatOptions.maximumFractionDigits` enables
  // fractional input via `step`.
  const isNumeric = field.type === "number";
  const maxFractionDigits = field.formatOptions?.maximumFractionDigits;
  const nativeInputType = isNumeric ? "number" : undefined;
  const nativeInputMode = isNumeric
    ? maxFractionDigits
      ? "decimal"
      : "numeric"
    : undefined;
  const nativeStep = maxFractionDigits
    ? 1 / 10 ** maxFractionDigits
    : undefined;

  if (hasPrefix || hasSuffix) {
    return (
      <Field>
        <Label htmlFor={name}>{field.label}</Label>

        <InputGroup>
          {hasPrefix && (
            <InputGroupAddon align="inline-start">
              {field.prefix}
            </InputGroupAddon>
          )}

          <InputGroupInput
            defaultValue={
              field.defaultValue == null
                ? undefined
                : String(field.defaultValue)
            }
            disabled={isPending}
            id={name}
            inputMode={nativeInputMode}
            name={name}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
            ref={inputRef}
            required={field.required}
            step={nativeStep}
            type={nativeInputType}
          />

          {field.copyable ? (
            <InputGroupAddon align="inline-end">
              <CopyButton
                getValue={() => inputRef.current?.value}
                isDisabled={isPending}
              />
            </InputGroupAddon>
          ) : (
            field.suffix != null && (
              <InputGroupAddon align="inline-end">
                {field.suffix}
              </InputGroupAddon>
            )
          )}
        </InputGroup>

        <FieldError />
      </Field>
    );
  }

  return (
    <Field>
      <Label htmlFor={name}>{field.label}</Label>

      <Input
        defaultValue={
          field.defaultValue == null ? undefined : String(field.defaultValue)
        }
        disabled={isPending}
        id={name}
        inputMode={nativeInputMode}
        name={name}
        placeholder={field.placeholder}
        readOnly={field.readOnly}
        required={field.required}
        step={nativeStep}
        type={nativeInputType}
      />

      <FieldError />
    </Field>
  );
}

/**
 * Slider field. Radix Slider doesn't render the current value, so we render
 * it next to the label and control the state to keep the displayed value in
 * sync. The selected value is submitted via the underlying Radix `name` prop.
 */
function SliderField({ name, field, isPending }: AdditionalFieldProps) {
  const maxFractionDigits = field.formatOptions?.maximumFractionDigits;
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step =
    field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1);
  const initial =
    typeof field.defaultValue === "number"
      ? field.defaultValue
      : field.defaultValue == null
        ? min
        : Number(field.defaultValue);

  const [value, setValue] = useState<number>(initial);

  const formatter = new Intl.NumberFormat(undefined, field.formatOptions);

  return (
    <Field>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={name}>{field.label}</Label>
        <span className="text-muted-foreground text-sm tabular-nums">
          {formatter.format(value)}
        </span>
      </div>

      <Slider
        disabled={isPending || field.readOnly}
        id={name}
        max={max}
        min={min}
        name={name}
        onValueChange={([v]) => setValue(v ?? min)}
        step={step}
        value={[value]}
      />

      <FieldError />
    </Field>
  );
}

/**
 * Date / datetime input. Composes `Popover` + `Calendar` for the date and
 * (optionally) `<input type="time">` for the time. Submits the combined ISO
 * value via a hidden `<input>` so it shows up in `FormData`.
 */
function DateInput({ name, field, isPending }: AdditionalFieldProps) {
  const { localization } = useAuth();
  const inputType = resolveInputType(field);
  const isDateTime = inputType === "datetime";

  const [date, setDate] = useState<Date | undefined>(
    toDate(field.defaultValue)
  );
  const [time, setTime] = useState<string>(
    isDateTime && date ? formatTime(date) : ""
  );
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();

  // Compose the hidden form value: ISO date for "date", ISO datetime for
  // "datetime" (date + time).
  let formValue = "";
  if (date) {
    if (isDateTime && time && time.trim() !== "") {
      const [h = "0", m = "0", s = "0"] = time.split(":");
      const combined = new Date(date);
      combined.setHours(Number(h), Number(m), Number(s), 0);
      formValue = combined.toISOString();
    } else {
      // Anchor to local midnight then serialize as ISO so the downstream
      // `parseAdditionalFieldValue` parses the same calendar day regardless
      // of timezone (a bare "YYYY-MM-DD" would be parsed as UTC midnight).
      // For datetime fields with a blank time, we fall through to this path
      // so an empty time stays blank rather than silently becoming midnight.
      const localMidnight = new Date(date);
      localMidnight.setHours(0, 0, 0, 0);
      formValue = localMidnight.toISOString();
    }
  }

  return (
    <Field data-invalid={!!error}>
      <Label htmlFor={`${name}-date`}>{field.label}</Label>

      <div className="relative flex gap-2">
        {/* Visually-hidden input so required constraint validation fires on submit.
            onInvalid suppresses the native browser balloon and routes the message
            through the styled <FieldError> below — matching the pattern used by
            the Name / Email / Password fields in the sign-up form. */}
        <input
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          name={name}
          onChange={() => {}}
          onInvalid={(e) => {
            e.preventDefault();
            setError((e.target as HTMLInputElement).validationMessage);
          }}
          required={field.required}
          tabIndex={-1}
          type="text"
          value={formValue}
        />
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              aria-invalid={!!error}
              className={cn(
                "flex-1 justify-between font-normal",
                "data-[empty=true]:text-muted-foreground"
              )}
              data-empty={!date}
              disabled={isPending || field.readOnly}
              id={`${name}-date`}
              type="button"
              variant="outline"
            >
              {date ? format(date, "PPP") : <span>{field.placeholder}</span>}

              {isDateTime ? <ChevronDownIcon /> : <CalendarIcon />}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-auto overflow-hidden p-0">
            <Calendar
              captionLayout="dropdown"
              defaultMonth={date}
              mode="single"
              onSelect={(value) => {
                setDate(value);
                if (value) {
                  setError(undefined);
                }
                if (!isDateTime) {
                  setOpen(false);
                }
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>

        {isDateTime && (
          <Field className="w-32">
            <Label className="sr-only" htmlFor={`${name}-time`}>
              {localization.settings.time}
            </Label>

            <Input
              className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              disabled={isPending || field.readOnly}
              id={`${name}-time`}
              onChange={(e) => setTime(e.target.value)}
              step="1"
              type="time"
              value={time}
            />
          </Field>
        )}
      </div>

      <FieldError>{error}</FieldError>
    </Field>
  );
}
