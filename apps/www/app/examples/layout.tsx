import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: "noindex,nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      {children}
    </>
  );
}
