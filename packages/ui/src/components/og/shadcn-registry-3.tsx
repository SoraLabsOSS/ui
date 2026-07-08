export interface ShadcnRegistry3Props {
  credit?: string;
  description?: string;
  ghost?: string;
  logo?: string;
  title: string;
}

export const ShadcnRegistry3 = ({
  title,
  credit = "",
  description = "",
  ghost = "",
  logo = "",
}: ShadcnRegistry3Props) => (
  <div
    style={{
      backgroundColor: "#0a0a0a",
      color: "#fafafa",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      padding: "80px",
      position: "relative",
      width: "100%",
    }}
  >
    {/* Ghost Watermark */}
    <div
      style={{
        bottom: "-80px",
        color: "rgba(255,255,255,0.04)",
        display: "flex",
        fontSize: "320px",
        fontWeight: 800,
        justifyContent: "center",
        left: 0,
        letterSpacing: "-0.04em",
        lineHeight: 0.85,
        position: "absolute",
        right: 0,
        userSelect: "none",
        width: "100%",
      }}
    >
      {ghost || title.split(" ")[0]}
    </div>

    {/* Title + Badge */}
    <div
      style={{
        alignItems: "flex-start",
        display: "flex",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: title.length > 60 ? 52 : 64,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          maxWidth: "800px",
          textWrap: "balance",
        }}
      >
        {title}
        {description ? (
          <div
            style={{
              color: "rgba(250,250,250,0.55)",
              fontSize: "28px",
              fontWeight: 400,
              lineHeight: 1.4,
              marginTop: "24px",
              maxWidth: "760px",
              textWrap: "balance",
            }}
          >
            {description}
          </div>
        ) : null}
        {credit ? (
          <div
            style={{
              color: "#52525b",
              fontSize: "24px",
              fontWeight: 400,
              marginTop: description ? "28px" : "24px",
            }}
          >
            {credit}
          </div>
        ) : null}
      </div>

      {/* Badge/Logo */}
      <div
        style={{
          alignItems: "center",
          border: "3px solid rgba(255,255,255,0.2)",
          borderRadius: "999px",
          display: "flex",
          flexShrink: 0,
          height: "160px",
          justifyContent: "center",
          marginLeft: "40px",
          overflow: "hidden",
          width: "160px",
        }}
      >
        {logo ? (
          // biome-ignore lint/performance/noImgElement: Satori OG images require a plain img with an absolute URL.
          <img
            alt={credit || title}
            height={140}
            src={logo}
            style={{ borderRadius: "999px", objectFit: "cover" }}
            width={140}
          />
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg, #60EFFF, #0061FF)",
              borderRadius: "999px",
              height: "140px",
              width: "140px",
            }}
          />
        )}
      </div>
    </div>
  </div>
);
