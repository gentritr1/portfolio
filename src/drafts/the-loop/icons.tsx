import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  PauseIcon,
  PlayIcon,
  SealCheckIcon,
} from "@phosphor-icons/react";

const base = { "aria-hidden": true, className: "lp-icon" } as const;

export const Checked = () => <CheckIcon {...base} weight="bold" />;
export const Approved = () => <SealCheckIcon {...base} weight="fill" />;
export const Replay = () => <ArrowCounterClockwiseIcon {...base} weight="bold" />;
export const Out = () => <ArrowUpRightIcon {...base} weight="bold" />;
export const Next = () => <ArrowRightIcon {...base} weight="bold" />;
export const Back = () => <ArrowLeftIcon {...base} weight="bold" />;
export const Prev = () => <CaretLeftIcon {...base} weight="bold" />;
export const Forward = () => <CaretRightIcon {...base} weight="bold" />;
export const Pause = () => <PauseIcon {...base} weight="fill" />;
export const Play = () => <PlayIcon {...base} weight="fill" />;
