import type { ReactNode } from "react";
import "./home.css";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="home-layout flex min-h-full flex-1 flex-col antialiased">
      {children}
    </div>
  );
}
