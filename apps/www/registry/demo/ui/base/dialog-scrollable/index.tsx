"use client";

import { Button } from "@/registry/ui/base/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/ui/base/dialog";

export default function DialogScrollableDemo() {
  return (
    <div className="flex items-center justify-center p-4">
      <Dialog>
        <DialogTrigger
          render={<Button variant="secondary">View Terms</Button>}
        />
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>
              Please review our service agreement and terms of use.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[260px] flex-col gap-3 overflow-y-auto pr-2 text-muted-foreground text-xs leading-relaxed">
            <p>
              Welcome to Sora UI. By accessing or using our websites and
              component registry, you agree to be bound by these Terms of
              Service.
            </p>
            <p>
              1. License: You are granted a personal, non-exclusive license to
              install, copy, and modify components for software applications.
            </p>
            <p>
              2. Restrictions: You may not redistribute the source registry as a
              competing registry service without prior written consent.
            </p>
            <p>
              3. Warranty Disclaimer: The software components are provided
              &quot;as is&quot;, without warranty of any kind, express or
              implied.
            </p>
            <p>
              4. Privacy & Cookies: We respect your privacy and do not collect
              tracking analytics on your consumer apps.
            </p>
          </div>
          <DialogFooter showCloseButton>
            <DialogClose render={<Button>I Understand</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
