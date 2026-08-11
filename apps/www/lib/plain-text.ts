const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const HTML_ENTITY = /&(#x[\da-f]+|#\d+|[a-z]+);/gi;
const MARKDOWN_BOLD = /\*\*(.+?)\*\*/g;
const MARKDOWN_UNDERSCORE_BOLD = /__(.+?)__/g;
const MARKDOWN_CODE = /`(.+?)`/g;
const MARKDOWN_HEADING = /^#+\s*/;

function decodeHtmlEntitiesOnce(value: string) {
  HTML_ENTITY.lastIndex = 0;
  return value.replace(HTML_ENTITY, (entity, body: string) => {
    if (body[0] === "#") {
      const codePoint =
        body[1] === "x" || body[1] === "X"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);

      if (Number.isNaN(codePoint) || codePoint < 0 || codePoint > 0x10_ff_ff) {
        return entity;
      }

      return String.fromCodePoint(codePoint);
    }

    return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
  });
}

function decodeHtmlEntities(value: string) {
  let previous = value;

  for (let i = 0; i < 3; i++) {
    const next = decodeHtmlEntitiesOnce(previous);
    if (next === previous) {
      return next;
    }
    previous = next;
  }

  return previous;
}

/** Decode HTML entities and strip markdown emphasis from crawled titles. */
export function plainSourceTitle(title: string) {
  MARKDOWN_BOLD.lastIndex = 0;
  MARKDOWN_UNDERSCORE_BOLD.lastIndex = 0;
  MARKDOWN_CODE.lastIndex = 0;

  return decodeHtmlEntities(title)
    .replace(MARKDOWN_BOLD, "$1")
    .replace(MARKDOWN_UNDERSCORE_BOLD, "$1")
    .replace(MARKDOWN_CODE, "$1")
    .replace(MARKDOWN_HEADING, "")
    .trim();
}
