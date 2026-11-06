/**
 * Turns the anonymous learner-story fields the server sends into clean, grammatical pieces for the
 * one-sentence card on the landing page. The fields are free text typed by learners and guardians
 * ("Likes to draw", "football , trekking", "cognitive delay/ learning disability"), so they are
 * normalised here: consistent casing, lists joined properly, third person turned into first person,
 * and anything that is a sentence about the learner rather than an activity is left out.
 */

export interface StoryInput {
    age: number;
    skills: string[];
    disability?: string;
    free_time?: string;
}

export interface StoryParts {
    age: number;
    /** e.g. "autistic spectrum disorder", "ADHD" - after "I have". */
    disability?: string;
    /** e.g. "math, reading and writing". */
    skills: string;
    /** The free-time clause, as a lead-in plus the highlighted part. */
    freeTime?: { lead: string; text: string };
}

/** Words that keep a capital letter (names of languages, brands, programs). */
const PROPER = [
    "English", "Spanish", "French", "German", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi",
    "Bengali", "Gujarati", "Punjabi", "Urdu", "Arabic", "Chinese", "Mandarin", "Japanese", "Korean", "Italian",
    "Portuguese", "Russian", "Microsoft", "PowerPoint", "Excel", "Word", "YouTube", "TikTok", "TikToks", "Lego",
    "Legos", "Google", "Python", "Java", "JavaScript", "Scratch", "Minecraft", "Roblox", "iPad", "iPhone",
    "Down", "Rett", "Tourette", "Angelman", "Williams", "Asperger", "Prader-Willi", "Instagram", "Facebook", "WhatsApp", "Zoom", "Netflix", "Spotify", "Disney", "Pokemon", "Pokémon",
];
const PROPER_BY_LOWER = new Map(PROPER.map((w) => [w.toLowerCase(), w]));

/** Typos that actually turn up in the free-text answers. */
const TYPOS: Record<string, string> = { cookung: "cooking", graphix: "graphic", hobbys: "hobbies" };

/** Pairs that are one activity, so a bare list like "video games movies" is not split inside them. */
const PAIRS = ["video games", "board games", "card games", "social media", "picture books", "table tennis"];
const STOPWORDS = /\b(?:to|with|on|in|of|the|a|an|my|at|for|from|by|being|playing)\b/i;

const THIRD_PERSON = /\b(he|she|we|they|him|them|our|their|his own|her own)\b/i;

function normalizeWord(word: string): string {
    word = TYPOS[word.toLowerCase()] ?? word;
    const proper = PROPER_BY_LOWER.get(word.toLowerCase());
    if (proper) return proper;
    // "Music" / "MUSIC" -> "music"; "ADHD", "ALS", "iPad", "YouTube" (internal capitals) are kept.
    if (/^[A-Z][a-z]+$/.test(word)) return word.toLowerCase();
    return word;
}

function normalizePhrase(text: string): string {
    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(normalizeWord)
        .join(" ");
}

function stripEnd(text: string): string {
    return text.replace(/[\s.!,;:/&-]+$/, "").replace(/^[\s,;:/&-]+/, "");
}

/** "a", "a and b", "a, b and c". */
export function joinList(items: string[]): string {
    if (items.length <= 1) return items[0] ?? "";
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function unique(items: string[]): string[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = item.toLowerCase();
        if (!item || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/** Splits "a / b", "a, b; c", "a & b", "a and b" into separate entries. */
function splitList(text: string): string[] {
    return text
        .split(/\s*(?:[,;/&\n]|\band\b)\s*/i)
        .map(stripEnd)
        .filter(Boolean);
}

/** "intellectual disability" -> "an intellectual disability" (but "autism", "ADHD", "Down syndrome" stay bare). */
function withArticle(item: string): string {
    const last = item.split(" ").pop() ?? "";
    if (!/^(disability|delay|disorder|impairment)$/i.test(last) || /^(a|an|the)\s/i.test(item)) return item;
    return `${/^[aeiou]/i.test(item) ? "an" : "a"} ${item}`;
}

function disabilityText(raw?: string): string | undefined {
    const items = unique(splitList(raw ?? "").map(normalizePhrase)).map(withArticle);
    return items.length ? joinList(items) : undefined;
}

const VERB_LEAD = /^(?:i\s+)?(?:really\s+)?(?:like|likes|love|loves|enjoy|enjoys)\s+(to\s+)?(.+)$/i;
const MAX_ITEMS = 4;
const MAX_WORDS_PER_ITEM = 5;

function freeTimeClause(raw?: string): StoryParts["freeTime"] {
    let text = stripEnd(raw ?? "");
    if (!text) return undefined;
    // "his iPad" / "her toys" -> "my iPad": the card speaks in the first person.
    text = text.replace(/\b(?:his|her)\b/gi, "my");

    const lead = text.match(VERB_LEAD);
    if (lead && lead[1]) {
        // "Likes to draw" -> "I like to draw".
        const rest = normalizePhrase(stripEnd(lead[2]));
        if (!rest || THIRD_PERSON.test(rest) || rest.split(" ").length > 8) return undefined;
        return { lead: "I like to", text: rest };
    }
    if (lead) text = lead[2]; // "likes drawing" -> "drawing"

    let items = unique(splitList(text));
    if (!items.length) return undefined;
    // "music art games" has no commas but is clearly a list: split it, keeping pairs like "video games".
    if (items.length === 1 && !STOPWORDS.test(items[0]) && items[0].split(/\s+/).length >= 3) {
        let packed = items[0];
        PAIRS.forEach((pair, i) => {
            packed = packed.replace(new RegExp(pair, "i"), `PAIR${i}`);
        });
        items = packed.split(/\s+/).map((w) => w.replace(/^PAIR(\d)$/, (_, i) => PAIRS[Number(i)]));
    }
    // A sentence about the learner (not a list of activities) is not something to put in their voice.
    if (items.some((item) => THIRD_PERSON.test(item) || item.split(/\s+/).length > MAX_WORDS_PER_ITEM)) {
        return undefined;
    }
    return { lead: "I enjoy", text: joinList(items.slice(0, MAX_ITEMS).map(normalizePhrase)) };
}

export function buildStoryParts(story: StoryInput): StoryParts {
    const skills = unique(story.skills.map((s) => normalizePhrase(stripEnd(s))));
    return {
        age: story.age,
        disability: disabilityText(story.disability),
        skills: joinList(skills),
        freeTime: freeTimeClause(story.free_time),
    };
}

/** The same sentence as plain text (used for checks and as an accessible label). */
export function storySentence(parts: StoryParts): string {
    const have = parts.disability ? `, I have ${parts.disability}` : "";
    const free = parts.freeTime ? ` In my free time, ${parts.freeTime.lead} ${parts.freeTime.text}.` : "";
    return `I'm ${parts.age} years old${have}, and I want to learn ${parts.skills}.${free}`;
}
