"use client";

import { useEffect, useState } from "react";

export function FooterCopyright() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span>© {year ?? ""} Sora UI</span>;
}
