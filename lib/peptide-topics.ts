
/**
 * lib/peptide-topics.ts
 *
 * Single source of truth for every /peptides/[slug]/[topic] page:
 * - which PeptideInfo field it reads from
 * - its default title / description / keyword templates
 * - its on-page heading + intro copy
 *
 * Add a new topic (e.g. "purity-testing") by adding one entry here —
 * no new route files needed, the dynamic [topic] route picks it up
 * automatically via generateStaticParams.
 */

export type PeptideTextField =
  | "mechanismOfAction"
  | "benefits"
  | "dosageGuidance"
  | "sideEffects"
  | "safetyHandling"
  | "reconstitution"
  | "researchHighlights"
  | "comparisons";

export interface PeptideInfoLike {
  slug: string;
  name: string;
  mechanismOfAction?: string | null;
  benefits?: string | null;
  dosageGuidance?: string | null;
  sideEffects?: string | null;
  safetyHandling?: string | null;
  reconstitution?: string | null;
  productSlug?: string | null;
  researchHighlights?: string | null;
  comparisons?: string | null;
  faq?: { question: string; answer: string }[] | null;
  keywords?: string[] | null;
  seoOverrides?: Record<
    string,
    { title?: string; description?: string; keywords?: string[] }
  > | null;
}

export interface TopicConfig {
  field: PeptideTextField | "faq";
  label: string;
  heading: (name: string) => string;
  intro: (name: string) => string;
  titleTemplate: (name: string) => string;
  descriptionFallback: (name: string) => string;
  keywordTemplates: (name: string) => string[];
}

export const PEPTIDE_TOPICS = {
  dosage: {
    field: "dosageGuidance",
    label: "Dosage Guidance",
    heading: (name) => `${name} Dosage Guidance`,
    intro: (name) =>
      `Research-based dosage recommendations for ${name}. Always follow laboratory safety protocols and institutional guidelines.`,
    titleTemplate: (name) =>
      `${name} Dosage: Research Concentrations & Laboratory Guidelines`,
    descriptionFallback: (name) =>
      `Research-based ${name} dosage concentrations and laboratory handling guidelines. Strictly for research use.`,
    keywordTemplates: (name) => [
      `${name} dosage`,
      `${name} research dosage`,
      `${name} laboratory concentration`,
      "peptide dosage research",
      "research peptide guidelines",
    ],
  },
  "mechanism-of-action": {
    field: "mechanismOfAction",
    label: "Mechanism of Action",
    heading: (name) => `${name} Mechanism of Action`,
    intro: (name) =>
      `How ${name} behaves at the molecular and cellular level, based on current research literature.`,
    titleTemplate: (name) => `${name} Mechanism of Action: How It Works`,
    descriptionFallback: (name) =>
      `Explore the research-backed mechanism of action for ${name}, including receptor binding and biological pathways.`,
    keywordTemplates: (name) => [
      `${name} mechanism of action`,
      `${name} MOA`,
      `how does ${name} work`,
      `${name} pathway`,
      "peptide mechanism research",
    ],
  },
  benefits: {
    field: "benefits",
    label: "Research Benefits",
    heading: (name) => `${name} Research Benefits`,
    intro: (name) =>
      `Documented research applications and benefits associated with ${name} in laboratory settings.`,
    titleTemplate: (name) => `${name} Benefits: Research Applications & Findings`,
    descriptionFallback: (name) =>
      `Overview of research-documented benefits and applications of ${name} for laboratory study.`,
    keywordTemplates: (name) => [
      `${name} benefits`,
      `${name} research benefits`,
      `${name} applications`,
      `${name} uses research`,
      "peptide research benefits",
    ],
  },
  "side-effects": {
    field: "sideEffects",
    label: "Side Effects & Considerations",
    heading: (name) => `${name} Side Effects & Research Considerations`,
    intro: (name) =>
      `Documented side effects and safety considerations reported in ${name} research literature.`,
    titleTemplate: (name) => `${name} Side Effects: Research Safety Considerations`,
    descriptionFallback: (name) =>
      `Research-documented side effects and safety considerations for ${name} in laboratory studies.`,
    keywordTemplates: (name) => [
      `${name} side effects`,
      `${name} adverse effects`,
      `${name} safety`,
      `${name} risks research`,
      "peptide side effects research",
    ],
  },
  "safety-handling": {
    field: "safetyHandling",
    label: "Safety & Handling",
    heading: (name) => `${name} Safety & Handling Guidelines`,
    intro: (name) =>
      `Storage, purity, and handling protocols for ${name} in a laboratory research environment.`,
    titleTemplate: (name) => `${name} Storage & Handling: Laboratory Safety Guidelines`,
    descriptionFallback: (name) =>
      `Storage conditions, purity standards, and safe handling protocols for ${name} research use.`,
    keywordTemplates: (name) => [
      `${name} storage`,
      `${name} handling`,
      `${name} purity`,
      `${name} safety guidelines`,
      "peptide storage research",
    ],
  },
  reconstitution: {
    field: "reconstitution",
    label: "Reconstitution Guide",
    heading: (name) => `${name} Reconstitution Guide`,
    intro: (name) =>
      `Step-by-step reconstitution guidance for ${name}, including BAC water ratios and concentration calculations.`,
    titleTemplate: (name) => `${name} Reconstitution: BAC Water Ratios & Calculations`,
    descriptionFallback: (name) =>
      `How to reconstitute ${name} for research use, with concentration and dosing math examples.`,
    keywordTemplates: (name) => [
      `${name} reconstitution`,
      `reconstitute ${name}`,
      `${name} BAC water`,
      `${name} mixing ratio`,
      "peptide reconstitution guide",
    ],
  },
  "research-highlights": {
    field: "researchHighlights",
    label: "Research Highlights",
    heading: (name) => `${name} Research Highlights & Key Studies`,
    intro: (name) => `Summaries of key studies and research findings involving ${name}.`,
    titleTemplate: (name) => `${name} Research: Key Studies & Findings`,
    descriptionFallback: (name) =>
      `Summary of key published research and studies involving ${name}.`,
    keywordTemplates: (name) => [
      `${name} research`,
      `${name} studies`,
      `${name} clinical research`,
      `${name} findings`,
      "peptide research studies",
    ],
  },
  comparisons: {
    field: "comparisons",
    label: "Comparisons",
    heading: (name) => `${name} vs Other Compounds`,
    intro: (name) =>
      `How ${name} compares to related peptides and compounds in research contexts.`,
    titleTemplate: (name) =>
      `${name} Comparison: How It Stacks Up Against Similar Compounds`,
    descriptionFallback: (name) =>
      `Compare ${name} to related research compounds and peptides.`,
    keywordTemplates: (name) => [
      `${name} vs`,
      `${name} comparison`,
      `${name} alternative`,
      `${name} similar compounds`,
      "peptide comparison research",
    ],
  },
  faq: {
    field: "faq",
    label: "Frequently Asked Questions",
    heading: (name) => `${name} Frequently Asked Questions`,
    intro: (name) => `Common research questions about ${name}, answered.`,
    titleTemplate: (name) => `${name} FAQ: Common Research Questions Answered`,
    descriptionFallback: (name) =>
      `Answers to frequently asked research questions about ${name}.`,
    keywordTemplates: (name) => [
      `${name} FAQ`,
      `${name} questions`,
      `${name} research questions`,
      "peptide FAQ",
    ],
  },
} satisfies Record<string, TopicConfig>;

export type TopicKey = keyof typeof PEPTIDE_TOPICS;
export const TOPIC_KEYS = Object.keys(PEPTIDE_TOPICS) as TopicKey[];

// ============================================================
// Text sanitizing + excerpting
// ============================================================

/**
 * Strips leftover AI-drafting placeholder text and normalizes whitespace.
 * This is a SAFETY NET for display/meta output — you should still clean
 * the actual DB rows (see scripts/clean-peptide-descriptions.ts).
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    // kills "(Already provided – use the earlier block or this refined version:)"
    // and any similar bracketed drafting note, regardless of exact wording
    .replace(/\([^)]*already provided[^)]*\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Truncates to maxLength, preferring to break at a sentence boundary,
 * falling back to a word boundary. Used for meta descriptions and
 * parent-page teasers so we never duplicate full topic content.
 */
export function makeExcerpt(
  text: string | null | undefined,
  maxLength = 220
): string {
  const clean = sanitizeText(text);
  if (!clean) return "";
  if (clean.length <= maxLength) return clean;

  const truncated = clean.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf("! "),
    truncated.lastIndexOf("? ")
  );

  if (lastSentenceEnd > maxLength * 0.5) {
    return clean.slice(0, lastSentenceEnd + 1).trim();
  }

  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim() + "…";
}

export function makeMetaDescription(
  text: string | null | undefined,
  fallback: string,
  maxLength = 155
): string {
  const excerpt = makeExcerpt(text, maxLength);
  return excerpt || fallback;
}

/**
 * Resolves the final title/description/keywords for a topic page,
 * respecting seoOverrides if present, else falling back to the
 * template + generated excerpt.
 */
export function resolveTopicSeo(
  peptide: PeptideInfoLike,
  topicKey: TopicKey
) {
  const topic = PEPTIDE_TOPICS[topicKey];
  const override = peptide.seoOverrides?.[topicKey];

  const rawContent =
    topic.field === "faq"
      ? null
      : (peptide[topic.field as PeptideTextField] as string | null | undefined);

  const title = override?.title || topic.titleTemplate(peptide.name);
  const description =
    override?.description ||
    makeMetaDescription(rawContent, topic.descriptionFallback(peptide.name));
  const keywords = [
    ...(override?.keywords || topic.keywordTemplates(peptide.name)),
    ...(peptide.keywords || []),
  ];

  return { title, description, keywords, topic };
}