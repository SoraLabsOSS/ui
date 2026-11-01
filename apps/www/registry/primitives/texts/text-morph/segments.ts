import {
  type NumberSegment,
  type Segment,
  type SegmentKind,
  WORD_SPLIT_REGEX,
} from "./defs";

// --- LCS (Longest Common Subsequence) ----------------------------------------

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: LCS dynamic programming algorithm
export function lcsIndices(a: string[], b: string[]): [number[], number[]] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = m - 1; i >= 0; i--) {
    const row = dp[i];
    const nextRow = dp[i + 1];
    if (!(row && nextRow)) {
      continue;
    }
    for (let j = n - 1; j >= 0; j--) {
      row[j] =
        a[i] === b[j]
          ? (nextRow[j + 1] ?? 0) + 1
          : Math.max(nextRow[j] ?? 0, row[j + 1] ?? 0);
    }
  }

  const ai: number[] = [];
  const bi: number[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    const nextRowVal = dp[i + 1]?.[j] ?? 0;
    const nextColVal = dp[i]?.[j + 1] ?? 0;
    if (a[i] === b[j]) {
      ai.push(i);
      bi.push(j);
      i++;
      j++;
    } else if (nextRowVal >= nextColVal) {
      i++;
    } else {
      j++;
    }
  }

  return [ai, bi];
}

// --- Numbers & Formatting ----------------------------------------------------

const MINTED_PREFIX = "\u0000n";
let nextNewId = 0;

function mintId(): string {
  return `${MINTED_PREFIX}${nextNewId++}`;
}

export function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

export function hasDigit(value: string): boolean {
  for (const char of value) {
    if (isDigit(char)) {
      return true;
    }
  }
  return false;
}

const CORE_SEPARATORS = ".,'\u00A0\u202F\u2009\u2007";
const PREFIX_CHARS = "+-\u2212(#";
const SUFFIX_CHARS = "%.,!?:;)\"'\u201D\u2019";
const CURRENCY = /\p{Sc}/u;

function isAffix(char: string, set: string): boolean {
  return set.includes(char) || CURRENCY.test(char);
}

export function numericSkeleton(word: string): string {
  let out = "";
  for (const char of word) {
    if (!(isDigit(char) || CORE_SEPARATORS.includes(char))) {
      out += char;
    }
  }
  return out;
}

export function isNumericWord(word: string): boolean {
  let start = 0;
  let end = word.length;

  while (start < end && isAffix(word[start] ?? "", PREFIX_CHARS)) {
    start++;
  }
  while (end > start && isAffix(word[end - 1] ?? "", SUFFIX_CHARS)) {
    end--;
  }

  if (start >= end) {
    return false;
  }
  if (!(isDigit(word[start] ?? "") && isDigit(word[end - 1] ?? ""))) {
    return false;
  }

  for (let i = start; i < end; i++) {
    const char = word[i] ?? "";
    if (!(isDigit(char) || CORE_SEPARATORS.includes(char))) {
      return false;
    }
  }

  return true;
}

export function classifyKind(char: string): SegmentKind {
  return isDigit(char) ? "digit" : "symbol";
}

const separators = new Map<string, string>();

export function decimalSeparator(locale: Intl.LocalesArgument): string {
  const key = String(locale);
  const cached = separators.get(key);
  if (cached) {
    return cached;
  }

  let separator = ".";
  try {
    separator =
      new Intl.NumberFormat(locale)
        .formatToParts(1.1)
        .find((part) => part.type === "decimal")?.value ?? ".";
  } catch {
    // fallback
  }

  separators.set(key, separator);
  return separator;
}

function isGrouping(char: string, decimalChar: string): boolean {
  return char !== decimalChar && CORE_SEPARATORS.includes(char);
}

function keptIndices(chars: string[], decimalChar: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i] ?? "";
    if (!isGrouping(char, decimalChar)) {
      indices.push(i);
    }
  }
  return indices;
}

function groupingIndices(chars: string[], decimalChar: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i] ?? "";
    if (isGrouping(char, decimalChar)) {
      indices.push(i);
    }
  }
  return indices;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: cursor caret matching
function cursorMatch(
  oldChars: string[],
  newChars: string[],
  cursor: number,
  decimalChar: string
): Map<number, number> {
  const matches = new Map<number, number>();

  const oldKept = keptIndices(oldChars, decimalChar);
  const newKept = keptIndices(newChars, decimalChar);
  const pair = (ni: number, oi: number) => {
    const nIndex = newKept[ni];
    const oIndex = oldKept[oi];
    if (nIndex !== undefined && oIndex !== undefined) {
      matches.set(nIndex, oIndex);
    }
  };

  let keptCursor = 0;
  while (keptCursor < newKept.length && (newKept[keptCursor] ?? 0) < cursor) {
    keptCursor++;
  }

  const lenDiff = newKept.length - oldKept.length;

  if (lenDiff > 0) {
    const editStart = keptCursor - lenDiff;
    for (let i = 0; i < editStart && i < oldKept.length; i++) {
      pair(i, i);
    }
    for (let i = keptCursor; i < newKept.length; i++) {
      const oldIdx = i - lenDiff;
      if (oldIdx >= 0 && oldIdx < oldKept.length) {
        pair(i, oldIdx);
      }
    }
  } else if (lenDiff < 0) {
    for (let i = 0; i < keptCursor && i < newKept.length; i++) {
      pair(i, i);
    }
    for (let i = keptCursor; i < newKept.length; i++) {
      const oldIdx = i - lenDiff;
      if (oldIdx >= 0 && oldIdx < oldKept.length) {
        pair(i, oldIdx);
      }
    }
  } else {
    for (let i = 0; i < newKept.length; i++) {
      const nIdx = newKept[i];
      const oIdx = oldKept[i];
      if (
        nIdx !== undefined &&
        oIdx !== undefined &&
        newChars[nIdx] === oldChars[oIdx]
      ) {
        pair(i, i);
      }
    }
  }

  const oldSeps = groupingIndices(oldChars, decimalChar);
  const newSeps = groupingIndices(newChars, decimalChar);
  for (let k = 1; k <= oldSeps.length && k <= newSeps.length; k++) {
    const oldIdx = oldSeps.at(-k);
    const newIdx = newSeps.at(-k);
    if (
      oldIdx !== undefined &&
      newIdx !== undefined &&
      oldChars[oldIdx] === newChars[newIdx]
    ) {
      matches.set(newIdx, oldIdx);
    }
  }

  return matches;
}

const MAGNITUDE_JUMP = 3;

function digitIndices(chars: string[], from: number, to: number): number[] {
  const indices: number[] = [];
  for (let i = from; i < to; i++) {
    const char = chars[i] ?? "";
    if (isDigit(char)) {
      indices.push(i);
    }
  }
  return indices;
}

function integerDigits(chars: string[], start: number, pivot: number): number {
  let count = 0;
  for (let i = start; i < pivot; i++) {
    const char = chars[i] ?? "";
    if (isDigit(char)) {
      count++;
    }
  }
  return count;
}

function findPivot(
  chars: string[],
  start: number,
  end: number,
  decimalChar: string
): number {
  for (let i = end - 1; i >= start; i--) {
    if (chars[i] === decimalChar) {
      return i;
    }
  }
  return end;
}

function placeMatch(
  oldChars: string[],
  newChars: string[],
  decimalChar: string
): Map<number, number> {
  const matches = new Map<number, number>();

  let start = 0;
  while (
    start < oldChars.length &&
    start < newChars.length &&
    oldChars[start] === newChars[start] &&
    !isDigit(oldChars[start] ?? "")
  ) {
    matches.set(start, start);
    start++;
  }

  let oldEnd = oldChars.length;
  let newEnd = newChars.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    oldChars[oldEnd - 1] === newChars[newEnd - 1] &&
    !isDigit(oldChars[oldEnd - 1] ?? "")
  ) {
    matches.set(newEnd - 1, oldEnd - 1);
    oldEnd--;
    newEnd--;
  }

  const oldPivot = findPivot(oldChars, start, oldEnd, decimalChar);
  const newPivot = findPivot(newChars, start, newEnd, decimalChar);

  const oldDigits = integerDigits(oldChars, start, oldPivot);
  const newDigits = integerDigits(newChars, start, newPivot);

  if (
    oldDigits > 0 &&
    newDigits > 0 &&
    Math.abs(oldDigits - newDigits) >= MAGNITUDE_JUMP
  ) {
    return matches;
  }

  function matchSeparator(oldIndex: number, newIndex: number) {
    const char = oldChars[oldIndex] ?? "";
    if (isDigit(char)) {
      return;
    }
    if (char === newChars[newIndex]) {
      matches.set(newIndex, oldIndex);
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: digit matching with LCS
  function matchDigits(
    oldFrom: number,
    oldTo: number,
    newFrom: number,
    newTo: number,
    towardsPivot: boolean
  ): boolean {
    const oldIndices = digitIndices(oldChars, oldFrom, oldTo);
    const newIndices = digitIndices(newChars, newFrom, newTo);

    if (oldIndices.length === newIndices.length || !towardsPivot) {
      const pairs = Math.min(oldIndices.length, newIndices.length);
      for (let k = 0; k < pairs; k++) {
        const oi = oldIndices[k];
        const ni = newIndices[k];
        if (
          oi !== undefined &&
          ni !== undefined &&
          oldChars[oi] === newChars[ni]
        ) {
          matches.set(ni, oi);
        }
      }
      return false;
    }

    const oldRun = oldIndices.map((i) => oldChars[i] ?? "").reverse();
    const newRun = newIndices.map((i) => newChars[i] ?? "").reverse();
    const [ai, bi] = lcsIndices(oldRun, newRun);

    for (let k = 0; k < ai.length; k++) {
      const aIdx = ai[k];
      const bIdx = bi[k];
      if (aIdx !== undefined && bIdx !== undefined) {
        const oi = oldIndices.at(-1 - aIdx);
        const ni = newIndices.at(-1 - bIdx);
        if (oi !== undefined && ni !== undefined) {
          matches.set(ni, oi);
        }
      }
    }

    return ai.length > 0;
  }

  const reshaped = matchDigits(start, oldPivot, start, newPivot, true);
  if (!reshaped) {
    for (let k = 1; oldPivot - k >= start && newPivot - k >= start; k++) {
      matchSeparator(oldPivot - k, newPivot - k);
    }
  }

  if (oldPivot < oldEnd && newPivot < newEnd) {
    matches.set(newPivot, oldPivot);

    for (let k = 1; oldPivot + k < oldEnd && newPivot + k < newEnd; k++) {
      matchSeparator(oldPivot + k, newPivot + k);
    }
    matchDigits(oldPivot + 1, oldEnd, newPivot + 1, newEnd, false);
  }

  return matches;
}

function simpleSegment(chars: string[]): NumberSegment[] {
  return chars.map((char) => ({
    id: mintId(),
    kind: classifyKind(char),
    string: char === " " ? "\u00A0" : char,
  }));
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: number segmentation logic
export function segmentNumber(
  value: string,
  prevSegments?: NumberSegment[],
  cursorIndex?: number,
  decimalChar = "."
): NumberSegment[] {
  const chars = value.split("");

  if (!prevSegments || prevSegments.length === 0) {
    return simpleSegment(chars);
  }

  const oldChars = prevSegments.map((s) =>
    s.string === "\u00A0" ? " " : s.string
  );

  const matches =
    cursorIndex == null
      ? placeMatch(oldChars, chars, decimalChar)
      : cursorMatch(oldChars, chars, cursorIndex, decimalChar);

  const usedIds = new Set<string>();
  for (const [, oldIdx] of matches) {
    const prevSeg = prevSegments[oldIdx];
    if (prevSeg) {
      usedIds.add(prevSeg.id);
    }
  }

  const result: NumberSegment[] = [];

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i] ?? "";
    const kind = classifyKind(char);
    const displayChar = char === " " ? "\u00A0" : char;

    if (matches.has(i)) {
      const oldIdx = matches.get(i);
      const prevSeg = oldIdx === undefined ? undefined : prevSegments[oldIdx];
      result.push({
        id: prevSeg ? prevSeg.id : mintId(),
        kind,
        string: displayChar,
      });
    } else {
      let id = mintId();
      while (usedIds.has(id)) {
        id = mintId();
      }
      usedIds.add(id);
      result.push({ id, kind, string: displayChar });
    }
  }

  return result;
}

// --- Text Segmentation & Diffing ---------------------------------------------

export function createIdAllocator() {
  const used = new Set<string>();

  return {
    has(id: string) {
      return used.has(id);
    },
    reserve(id: string) {
      used.add(id);
    },
    take(base: string): string {
      if (!used.has(base)) {
        used.add(base);
        return base;
      }
      let i = 1;
      while (used.has(`${base}~${i}`)) {
        i++;
      }
      const id = `${base}~${i}`;
      used.add(id);
      return id;
    },
  };
}

export type IdAllocator = ReturnType<typeof createIdAllocator>;

export function groupIntoWords(segments: Segment[]): {
  segments: Segment[];
  word: string;
}[] {
  const groups: { segments: Segment[]; word: string }[] = [];
  let current: Segment[] = [];

  const flush = () => {
    if (current.length === 0) {
      return;
    }
    groups.push({
      segments: current,
      word: current.map((s) => s.string).join(""),
    });
    current = [];
  };

  for (const seg of segments) {
    if (seg.string === "\u00A0" || seg.string === "\n") {
      flush();
    } else {
      current.push(seg);
    }
  }
  flush();

  return groups;
}

function expandNumbers(segments: Segment[]): Segment[] {
  const out: Segment[] = [];
  let run: Segment[] = [];

  const flush = () => {
    if (run.length === 0) {
      return;
    }
    const word = run.map((s) => s.string).join("");
    if (isNumericWord(word)) {
      out.push(...segmentNumber(word));
    } else {
      out.push(...run);
    }
    run = [];
  };

  for (const seg of segments) {
    if (seg.string === "\u00A0" || seg.string === "\n") {
      flush();
      out.push(seg);
    } else {
      run.push(seg);
    }
  }
  flush();

  return out;
}

function allocSegmentId(
  part: string,
  index: number,
  alloc: IdAllocator
): string {
  return alloc.has(part) ? alloc.take(`${part}-${index}`) : alloc.take(part);
}

function segmentsFromIntl(
  iterator: Intl.SegmentIterator<Intl.SegmentData>,
  offset: number,
  alloc: IdAllocator
): Segment[] {
  const segments: Segment[] = [];

  for (const data of Array.from(iterator)) {
    const index = offset + data.index;
    if (data.segment === " ") {
      segments.push({ id: alloc.take(`space-${index}`), string: "\u00A0" });
    } else {
      segments.push({
        id: allocSegmentId(data.segment, index, alloc),
        string: data.segment,
      });
    }
  }

  return segments;
}

function segmentsFallback(
  value: string,
  byWord: boolean,
  offset: number,
  alloc: IdAllocator
): Segment[] {
  const parts = byWord ? value.split(" ") : value.split("");
  const segments: Segment[] = [];
  let index = offset;

  parts.forEach((part, i) => {
    if (byWord && i > 0) {
      segments.push({ id: alloc.take(`space-${index}`), string: "\u00A0" });
      index += 1;
    }
    segments.push({ id: allocSegmentId(part, index, alloc), string: part });
    index += part.length;
  });

  return segments;
}

function segmentLine(
  line: string,
  locale: Intl.LocalesArgument,
  byWord: boolean,
  offset: number,
  alloc: IdAllocator
): Segment[] {
  if (typeof Intl.Segmenter !== "undefined") {
    const segmenter = new Intl.Segmenter(locale, {
      granularity: byWord ? "word" : "grapheme",
    });
    return segmentsFromIntl(
      segmenter.segment(line)[Symbol.iterator](),
      offset,
      alloc
    );
  }

  return segmentsFallback(line, byWord, offset, alloc);
}

export function segmentText(
  value: string,
  locale: Intl.LocalesArgument,
  numbers = true
): Segment[] {
  const hasNewlines = value.includes("\n");
  const byWord = value.includes(" ") || hasNewlines;
  const alloc = createIdAllocator();

  if (hasNewlines) {
    const lines = value.split("\n");
    const allSegments: Segment[] = [];
    let offset = 0;

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        allSegments.push({
          id: alloc.take(`newline-${offset}`),
          string: "\n",
        });
        offset += 1;
      }
      if (line.length > 0) {
        allSegments.push(...segmentLine(line, locale, true, offset, alloc));
      }
      offset += line.length;
    });

    return numbers ? expandNumbers(allSegments) : allSegments;
  }

  const segments = segmentLine(value, locale, byWord, 0, alloc);
  return numbers ? expandNumbers(segments) : segments;
}

const NUMBER_TOKEN = "\u0000#";

function splitIfWhole(
  oldGroup: { segments: Segment[]; word: string },
  splits: Map<string, Segment[]>
): Segment[] {
  if (oldGroup.segments.length !== 1 || oldGroup.word.length <= 1) {
    return oldGroup.segments;
  }

  const wordSeg = oldGroup.segments[0];
  if (!wordSeg) {
    return oldGroup.segments;
  }

  const charSegs = oldGroup.word.split("").map((char, i) => ({
    id: `${wordSeg.id}:${i}`,
    string: char,
  }));
  splits.set(wordSeg.id, charSegs);

  return charSegs;
}

function asNumberSegments(segments: Segment[]): NumberSegment[] {
  return segments.map((seg) => ({
    ...seg,
    kind: seg.kind ?? classifyKind(seg.string),
  }));
}

type WordPlan =
  | { mode: "fresh" }
  | { mode: "morph"; oi: number }
  | { mode: "number"; oi: number }
  | { mode: "reuse"; oi: number };

function charSimilarity(a: string, b: string): number {
  if (a.length === 0 || b.length === 0) {
    return 0;
  }
  const [matched] = lcsIndices(a.split(""), b.split(""));
  return matched.length / Math.max(a.length, b.length);
}

function gapIndices(count: number, matched: Set<number>): number[] {
  const gaps: number[] = [];
  let anchors = 0;
  for (let i = 0; i < count; i++) {
    gaps.push(anchors);
    if (matched.has(i)) {
      anchors++;
    }
  }
  return gaps;
}

const MIN_SIMILARITY = 0.4;

function pairAffinity(a: string, b: string): number {
  if (
    (hasDigit(a) || hasDigit(b)) &&
    numericSkeleton(a) === numericSkeleton(b)
  ) {
    return 1;
  }
  return charSimilarity(a, b);
}

const MAX_MORPH_PAIRINGS = 2500;
const MAX_LCS_CELLS = 1_000_000;

export interface DiffResult {
  segments: Segment[];
  splits: Map<string, Segment[]>;
}

export interface DiffOptions {
  cursorIndex?: number;
  numbers?: boolean;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: text and number diffing engine
export function diffSegments(
  oldSegments: Segment[],
  newText: string,
  locale: Intl.LocalesArgument,
  options: DiffOptions = {}
): DiffResult {
  const newHasSpaces = newText.includes(" ");
  const newHasNewlines = newText.includes("\n");
  const oldWords = groupIntoWords(oldSegments);

  const numbersOn = options.numbers !== false;
  const isNum = (word: string) => numbersOn && isNumericWord(word);
  const token = (word: string) => (isNum(word) ? NUMBER_TOKEN : word);

  const digitsInvolved =
    numbersOn && (hasDigit(newText) || oldWords.some((g) => hasDigit(g.word)));

  if (
    oldWords.length <= 1 &&
    !newHasSpaces &&
    !newHasNewlines &&
    !digitsInvolved
  ) {
    return {
      segments: segmentText(newText, locale, numbersOn),
      splits: new Map(),
    };
  }

  const newWordStrings: string[] = [];
  const newSeparators: string[][] = [];
  const parts = newText.split(WORD_SPLIT_REGEX);
  let pendingSeps: string[] = [];
  for (const part of parts) {
    if (part === " " || part === "\n") {
      pendingSeps.push(part);
    } else if (part.length > 0) {
      newSeparators.push(pendingSeps);
      newWordStrings.push(part);
      pendingSeps = [];
    }
  }
  const trailingSeparators = pendingSeps;

  const oldWordStrings = oldWords.map((g) => g.word);

  if (oldWordStrings.length * newWordStrings.length > MAX_LCS_CELLS) {
    return {
      segments: segmentText(newText, locale, numbersOn),
      splits: new Map(),
    };
  }

  const [oldLcsIdx, newLcsIdx] = lcsIndices(
    oldWordStrings.map(token),
    newWordStrings.map(token)
  );
  const oldMatchedSet = new Set(oldLcsIdx);
  const newMatchedSet = new Set(newLcsIdx);

  const newToOldWord = new Map<number, number>();
  for (let k = 0; k < newLcsIdx.length; k++) {
    const nIndex = newLcsIdx[k];
    const oIndex = oldLcsIdx[k];
    if (nIndex !== undefined && oIndex !== undefined) {
      newToOldWord.set(nIndex, oIndex);
    }
  }

  let oldUnmatched = oldWordStrings
    .map((_, i) => i)
    .filter((i) => !oldMatchedSet.has(i));
  let newUnmatched = newWordStrings
    .map((_, i) => i)
    .filter((i) => !newMatchedSet.has(i));

  const exactUsed = new Set<number>();
  for (const ni of newUnmatched) {
    for (const oi of oldUnmatched) {
      if (exactUsed.has(oi)) {
        continue;
      }
      const newW = newWordStrings[ni];
      const oldW = oldWordStrings[oi];
      if (newW && oldW && token(newW) === token(oldW)) {
        newToOldWord.set(ni, oi);
        exactUsed.add(oi);
        break;
      }
    }
  }
  if (exactUsed.size > 0) {
    oldUnmatched = oldUnmatched.filter((i) => !exactUsed.has(i));
    newUnmatched = newUnmatched.filter((i) => !newToOldWord.has(i));
  }

  const morphPairs = new Map<number, number>();
  const usedOld = new Set<number>();

  const oldGaps = gapIndices(oldWordStrings.length, oldMatchedSet);
  const newGaps = gapIndices(newWordStrings.length, newMatchedSet);

  if (oldUnmatched.length * newUnmatched.length <= MAX_MORPH_PAIRINGS) {
    for (const ni of newUnmatched) {
      let bestOi = -1;
      let bestSim = MIN_SIMILARITY;

      for (const oi of oldUnmatched) {
        if (usedOld.has(oi)) {
          continue;
        }
        if (oldGaps[oi] !== newGaps[ni]) {
          continue;
        }
        const oldW = oldWordStrings[oi] ?? "";
        const newW = newWordStrings[ni] ?? "";
        const sim = pairAffinity(oldW, newW);
        if (sim > bestSim) {
          bestSim = sim;
          bestOi = oi;
        }
      }

      if (bestOi >= 0) {
        morphPairs.set(ni, bestOi);
        usedOld.add(bestOi);
      }
    }
  }

  const plans: WordPlan[] = newWordStrings.map((newWord, ni): WordPlan => {
    const lcsOi = newToOldWord.get(ni);
    const oi = lcsOi ?? morphPairs.get(ni);
    if (oi === undefined) {
      return { mode: "fresh" };
    }
    if (isNum(newWord)) {
      return { mode: "number", oi };
    }
    return lcsOi === undefined ? { mode: "morph", oi } : { mode: "reuse", oi };
  });

  const cursorIndex =
    plans.filter((plan) => plan.mode === "number").length === 1
      ? options.cursorIndex
      : undefined;
  const decimalChar = decimalSeparator(locale);

  const alloc = createIdAllocator();

  for (const plan of plans) {
    if (plan.mode === "fresh") {
      continue;
    }
    const oldGroup = oldWords[plan.oi];
    if (!oldGroup) {
      continue;
    }

    if (plan.mode !== "reuse" && oldGroup.segments.length === 1) {
      const wordSeg = oldGroup.segments[0];
      if (wordSeg) {
        for (let i = 0; i < oldGroup.word.length; i++) {
          alloc.reserve(`${wordSeg.id}:${i}`);
        }
      }
    } else {
      for (const seg of oldGroup.segments) {
        alloc.reserve(seg.id);
      }
    }
  }

  const segments: Segment[] = [];
  const splits = new Map<string, Segment[]>();
  let charOffset = 0;

  function pushSeparators(seps: string[]) {
    for (const sep of seps) {
      if (sep === "\n") {
        segments.push({
          id: alloc.take(`newline-${charOffset}`),
          string: "\n",
        });
      } else {
        segments.push({
          id: alloc.take(`space-${charOffset}`),
          string: "\u00A0",
        });
      }
      charOffset++;
    }
  }

  for (let ni = 0; ni < newWordStrings.length; ni++) {
    pushSeparators(newSeparators[ni] ?? (ni > 0 ? [" "] : []));

    const plan = plans[ni];
    const newWord = newWordStrings[ni] ?? "";

    if (plan && plan.mode === "reuse") {
      const oldGroup = oldWords[plan.oi];
      if (oldGroup) {
        for (const seg of oldGroup.segments) {
          segments.push(seg);
        }
      }
    } else if (plan && plan.mode === "number") {
      const oldGroup = oldWords[plan.oi];
      if (oldGroup) {
        segments.push(
          ...segmentNumber(
            newWord,
            asNumberSegments(splitIfWhole(oldGroup, splits)),
            cursorIndex === undefined ? undefined : cursorIndex - charOffset,
            decimalChar
          )
        );
      }
    } else if (plan && plan.mode === "morph") {
      const oldGroup = oldWords[plan.oi];
      if (oldGroup) {
        const oldWord = oldGroup.word;
        const oldCharSegs = splitIfWhole(oldGroup, splits);

        const oldChars = oldWord.split("");
        const newChars = newWord.split("");
        const [oldCharLcs, newCharLcs] = lcsIndices(oldChars, newChars);

        const newCharToOldSeg = new Map<number, Segment>();
        for (let k = 0; k < newCharLcs.length; k++) {
          const oIdx = oldCharLcs[k];
          const nIdx = newCharLcs[k];
          if (oIdx !== undefined && nIdx !== undefined) {
            const oldSeg = oldCharSegs[oIdx];
            if (oldSeg) {
              newCharToOldSeg.set(nIdx, oldSeg);
            }
          }
        }

        for (let ci = 0; ci < newChars.length; ci++) {
          const charStr = newChars[ci] ?? "";
          if (newCharToOldSeg.has(ci)) {
            const oldSeg = newCharToOldSeg.get(ci);
            if (oldSeg) {
              segments.push({ id: oldSeg.id, string: charStr });
            }
          } else {
            segments.push({
              id: alloc.take(`${newWord}~${ci}`),
              string: charStr,
            });
          }
        }
      }
    } else if (isNum(newWord)) {
      segments.push(...segmentNumber(newWord));
    } else {
      segments.push({ id: alloc.take(newWord), string: newWord });
    }

    charOffset += newWord.length;
  }

  pushSeparators(trailingSeparators);

  return { segments, splits };
}
