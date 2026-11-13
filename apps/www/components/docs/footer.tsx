"use client";

import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { useEffect, useState } from "react";

import { Bunny } from "./bunny";

export const Footer = ({ lastUpdate }: { lastUpdate?: Date }) => {
  const [isNightTime, setIsNightTime] = useState<boolean>(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const getVietnamHour = () => {
      const vnTimeString = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "numeric",
        hour12: false,
      });
      return Number.parseInt(vnTimeString, 10);
    };

    const vnHour = getVietnamHour();
    const isNight = vnHour >= 18 || vnHour < 6;
    setIsNightTime(isNight);
  }, []);

  return (
    <div className="-mt-2 mb-7 flex w-full flex-col-reverse justify-between lg:flex-row lg:items-center lg:gap-2">
      <div className="prose prose-sm text-muted-foreground flex size-full items-center justify-start text-sm">
        <div className="flex items-center">
          <p className="m-0! truncate text-start whitespace-normal">
            Built by{" "}
            <a
              href="https://github.com/axyl1410/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Axyl
            </a>
            . A motion-first component registry for React.
          </p>

          {!isMobile && <Bunny className="mb-2" sleeping={isNightTime} />}
        </div>
      </div>

      {lastUpdate && (
        <p className="text-muted-foreground flex items-center gap-1 text-sm text-nowrap">
          Last updated:{" "}
          <span
            className="bg-accent text-foreground rounded-sm px-1.5 py-0.75 text-[13px] font-medium"
            suppressHydrationWarning
          >
            {lastUpdate.toLocaleDateString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {isMobile && <Bunny sleeping={isNightTime} />}
        </p>
      )}
      {!lastUpdate && isMobile && <Bunny sleeping={isNightTime} />}
    </div>
  );
};
