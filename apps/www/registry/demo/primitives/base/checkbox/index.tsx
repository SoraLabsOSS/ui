"use client";

import { useState } from "react";
import { Checkbox } from "@/registry/primitives/base/checkbox";

export default function CheckboxDemo() {
  const [agree, setAgree] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 p-4 sm:p-6">
      {/* 1. Form & Field Patterns */}
      <div className="flex flex-col gap-3.5">
        <h4 className="font-semibold text-foreground text-sm tracking-tight">
          Form & Field Patterns
        </h4>
        <div className="flex flex-col gap-4">
          {/* Simple */}
          <div className="flex items-center gap-3">
            <Checkbox id="terms-simple" name="terms-simple" />
            <label
              className="cursor-pointer select-none font-medium text-foreground text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="terms-simple"
            >
              Accept terms and conditions
            </label>
          </div>

          {/* With Description */}
          <div className="flex items-start gap-3">
            <Checkbox
              checked={agree}
              id="terms-desc"
              name="terms-desc"
              onCheckedChange={setAgree}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                className="cursor-pointer select-none font-medium text-foreground text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="terms-desc"
              >
                Accept terms and conditions
              </label>
              <p className="text-muted-foreground text-xs">
                By clicking this checkbox, you agree to our Terms of Service.
              </p>
            </div>
          </div>

          {/* Disabled states */}
          <div className="flex items-center gap-3">
            <Checkbox disabled id="disabled-unchecked" />
            <label
              className="cursor-not-allowed select-none font-medium text-muted-foreground text-sm leading-none opacity-50"
              htmlFor="disabled-unchecked"
            >
              Disabled option (unchecked)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox defaultChecked disabled id="disabled-checked" />
            <label
              className="cursor-not-allowed select-none font-medium text-muted-foreground text-sm leading-none opacity-50"
              htmlFor="disabled-checked"
            >
              Disabled option (checked)
            </label>
          </div>
        </div>
      </div>

      {/* 2. Interactive Card Variant */}
      <div className="flex flex-col gap-3.5">
        <h4 className="font-semibold text-foreground text-sm tracking-tight">
          Interactive Card
        </h4>
        <label
          className="flex cursor-pointer items-start gap-3.5 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/40 has-data-checked:border-primary has-data-checked:bg-primary/5"
          htmlFor="security-alerts"
        >
          <Checkbox
            checked={securityAlerts}
            id="security-alerts"
            name="security-alerts"
            onCheckedChange={setSecurityAlerts}
          />
          <div className="grid gap-1">
            <span className="font-medium text-foreground text-sm leading-none">
              Security alerts & notifications
            </span>
            <span className="text-muted-foreground text-xs leading-normal">
              Receive instant alerts on suspicious login attempts and sensitive
              account actions.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
