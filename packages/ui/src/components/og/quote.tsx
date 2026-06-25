import { OG_PALETTE } from "./palette";

export interface QuoteProps {
  author: string;
  avatar?: string;
  handle: string;
  quote: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const Quote = ({ quote, author, handle, avatar }: QuoteProps) => (
  <div
    style={{
      backgroundColor: OG_PALETTE.background,
      color: OG_PALETTE.foreground,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      justifyContent: "center",
      padding: "96px",
      width: "100%",
    }}
  >
    <div
      style={{
        color: OG_PALETTE.accent,
        display: "flex",
        fontSize: "140px",
        fontWeight: 800,
        lineHeight: 0.8,
      }}
    >
      &ldquo;
    </div>

    <div
      style={{
        display: "flex",
        fontSize: quote.length > 90 ? 52 : 64,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        marginTop: "8px",
        maxWidth: "1000px",
      }}
    >
      {quote}
    </div>

    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: "20px",
        marginTop: "56px",
      }}
    >
      {avatar ? (
        // biome-ignore lint/performance/noImgElement: Satori OG images require a plain img with an absolute URL.
        <img
          alt={author}
          height={76}
          src={avatar}
          style={{ borderRadius: "999px", objectFit: "cover" }}
          width={76}
        />
      ) : (
        <div
          style={{
            alignItems: "center",
            backgroundColor: OG_PALETTE.accent,
            borderRadius: "999px",
            color: OG_PALETTE.foreground,
            display: "flex",
            fontSize: "32px",
            fontWeight: 700,
            height: "76px",
            justifyContent: "center",
            width: "76px",
          }}
        >
          {initials(author)}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: "32px", fontWeight: 600 }}>
          {author}
        </div>
        <div
          style={{
            color: OG_PALETTE.foregroundMuted,
            display: "flex",
            fontSize: "26px",
          }}
        >
          {handle}
        </div>
      </div>
    </div>
  </div>
);
