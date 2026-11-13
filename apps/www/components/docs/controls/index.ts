"use client";

import "dialkit/styles.css";

export { ControlColor } from "./color";
export type { ControlColorProps } from "./color";

export { ControlFolder } from "./folder";
export type { ControlFolderProps } from "./folder";

export { ControlSelect } from "./select";
export type { ControlSelectProps } from "./select";

export { ControlSlider } from "./slider";
export type { ControlSliderProps } from "./slider";

export { ControlToggle } from "./toggle";
export type { ControlToggleProps } from "./toggle";

export {
  ButtonGroup as ControlButtonGroup,
  DialPad as ControlDialPad,
  SpringControl as ControlSpring,
  TextControl as ControlText,
} from "dialkit";
