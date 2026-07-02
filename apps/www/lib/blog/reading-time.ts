const WORDS_PER_MINUTE = 200;

const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
const INLINE_CODE_PATTERN = /`[^`]*`/g;
const MDX_IMPORT_EXPORT_PATTERN = /^(import|export)\s.+$/gm;
const JSX_TAG_PATTERN = /<[^>]+>/g;
const MARKDOWN_SYNTAX_PATTERN = /[#*_>[\]()~-]/g;

/** Strip code blocks, JSX/MDX syntax, and markdown punctuation before counting words. */
function stripMarkdownForWordCount(markdown: string): string {
  return markdown
    .replace(CODE_BLOCK_PATTERN, " ")
    .replace(INLINE_CODE_PATTERN, " ")
    .replace(MDX_IMPORT_EXPORT_PATTERN, " ")
    .replace(JSX_TAG_PATTERN, " ")
    .replace(MARKDOWN_SYNTAX_PATTERN, " ");
}

/** Reading time in whole minutes (minimum 1) at {@link WORDS_PER_MINUTE}. */
export function getReadingTimeMinutes(markdown: string): number {
  const text = stripMarkdownForWordCount(markdown);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
