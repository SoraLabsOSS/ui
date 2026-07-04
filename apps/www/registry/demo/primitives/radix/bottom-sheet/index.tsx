"use client";

import { useState } from "react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetList,
  BottomSheetPanel,
  BottomSheetRow,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "@/registry/primitives/radix/bottom-sheet";

interface SettingsState {
  preloader: boolean;
  showLabels: boolean;
  sound: boolean;
  systemTheme: boolean;
  theme: "dark" | "light";
}

const initialSettings: SettingsState = {
  preloader: true,
  showLabels: false,
  theme: "dark",
  systemTheme: true,
  sound: false,
};

export default function BottomSheetDemo() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  return (
    <BottomSheet onOpenChange={setOpen} open={open}>
      <BottomSheetTrigger className="rounded-lg border border-border bg-card px-4 py-2 font-medium text-sm">
        Open settings
      </BottomSheetTrigger>
      <BottomSheetContent
        className="max-w-[361px]"
        defaultSnap={0}
        showHandle={false}
        snapPoints={["auto"]}
      >
        <BottomSheetTitle>Settings</BottomSheetTitle>
        <BottomSheetPanel>
          <BottomSheetList>
            <BottomSheetRow
              label="preloader"
              onClick={() =>
                setSettings((s) => ({ ...s, preloader: !s.preloader }))
              }
              value={String(settings.preloader)}
            />
            <BottomSheetRow
              label="show labels"
              onClick={() =>
                setSettings((s) => ({ ...s, showLabels: !s.showLabels }))
              }
              value={String(settings.showLabels)}
            />
            <BottomSheetRow
              label="theme"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  theme: s.theme === "dark" ? "light" : "dark",
                }))
              }
              value={settings.theme}
            />
            <BottomSheetRow
              label="system theme"
              onClick={() =>
                setSettings((s) => ({ ...s, systemTheme: !s.systemTheme }))
              }
              value={settings.systemTheme ? "on" : "off"}
            />
            <BottomSheetRow
              label="sound"
              onClick={() => setSettings((s) => ({ ...s, sound: !s.sound }))}
              value={settings.sound ? "enabled" : "disabled"}
            />
          </BottomSheetList>
        </BottomSheetPanel>
      </BottomSheetContent>
    </BottomSheet>
  );
}
