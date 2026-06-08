"use client";

import { useEffect, useState } from "react";

function formatVietnamTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export function FooterClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setTime(formatVietnamTime(new Date()));
    };

    update();
    const interval = window.setInterval(update, 30_000);
    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
      {time ? `${time} ICT` : "— ICT"}
    </span>
  );
}
