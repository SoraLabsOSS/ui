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
      <div className="prose prose-sm flex size-full items-center justify-start text-muted-foreground text-sm">
        <div className="flex items-center">
          <p className="m-0! truncate whitespace-normal text-start">
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
        <p className="flex items-center gap-1 text-nowrap text-muted-foreground text-sm">
          Last updated:{" "}
          <span className="rounded-sm bg-accent px-1.5 py-0.75 font-medium text-[13px] text-foreground">
            {lastUpdate?.toLocaleDateString()}
          </span>
          {isMobile && <Bunny sleeping={isNightTime} />}
        </p>
      )}
    </div>
  );
};
