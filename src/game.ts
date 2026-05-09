const CARD_IDS = ["A", "B", "C", "D", "E"] as const;

export type CardId = (typeof CARD_IDS)[number];
export type SourceVerdict = "truth" | "lie";

type RawSourceCard = {
  sourceName: string;
  sourceType: string;
  headline: string;
  claim: string;
  excerpt: string;
  published: string;
  credibilitySignal: string;
  url?: string;
  verdict: SourceVerdict;
  explanation: string;
  questionHints: string[];
};

export type SourceSeed = {
  sourceName: string;
  sourceType: string;
  headline: string;
  claim: string;
  excerpt: string;
  published?: string;
  credibilitySignal?: string;
  url?: string;
};

export type SourceSpin = {
  sourceIndex: number;
  claim: string;
  description: string;
  headline?: string;
  credibilitySignal?: string;
  questionHints?: string[];
};

export type SourceCard = RawSourceCard & {
  id: CardId;
};

type TopicPack = {
  topic: string;
  aliases: string[];
  prompt: string;
  artPrompt: string;
  clipPrompt: string;
  cards: RawSourceCard[];
};

export type Round = {
  id: string;
  topic: string;
  sourceMode: "starter-pack" | "provided-sources" | "exa";
  sourcePackTopic: string;
  requestedTopic: string | null;
  prompt: string;
  artPrompt: string;
  clipPrompt: string;
  cards: SourceCard[];
  lieId: CardId;
};

export type GuessRecord = {
  cardId: CardId;
  sourceName: string;
  result: SourceVerdict;
  guessedAt: string;
};

export type QuestionRecord = {
  question: string;
  answer: string;
  answerSource?: "local-hints" | "exa-answer" | "exa-answer-fallback";
  citations?: Array<{
    title: string;
    url: string;
    published?: string;
  }>;
  askedAt: string;
};

export type GeneratedImageAsset = {
  id: string;
  type: "image";
  url: string;
  mimeType: "image/jpeg";
  model: string;
  prompt: string;
  seed: number;
  generatedAt: string;
};

export type GameAssets = {
  image: GeneratedImageAsset | null;
  imageError: string | null;
};

export type ScoreBadgeId =
  | "first-case"
  | "perfect-read"
  | "clean-read"
  | "no-clue-needed"
  | "comeback-analyst"
  | "last-card-logic"
  | "hot-streak"
  | "question-ledger";

export type ScoreBadge = {
  id: ScoreBadgeId;
  label: string;
  description: string;
  count: number;
  firstEarnedAt: string;
  lastEarnedAt: string;
};

export type AwardedBadge = Omit<
  ScoreBadge,
  "count" | "firstEarnedAt" | "lastEarnedAt"
>;

export type ScoreRank = {
  label: string;
  minPoints: number;
  nextLabel: string | null;
  pointsToNext: number | null;
};

export type ScoreRound = {
  roundId: string;
  topic: string;
  status: "active" | "won" | "revealed";
  outcome: "active" | "direct-win" | "elimination-win" | "revealed";
  startedAt: string;
  finishedAt: string | null;
  points: number;
  basePoints: number;
  mistakes: number;
  questions: number;
  clearedTruths: number;
  penalties: {
    wrongGuesses: number;
    questions: number;
    reveal: number;
  };
  bonuses: {
    cleanRead: number;
    noClue: number;
    streak: number;
    comeback: number;
  };
  badges: AwardedBadge[];
  grade: "S" | "A" | "B" | "C" | "D" | "Reveal";
  summary: string;
};

export type GameScore = {
  roundsStarted: number;
  wins: number;
  wrongGuesses: number;
  totalQuestions: number;
  reveals: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  perfectRounds: number;
  activeRound: ScoreRound | null;
  lastRound: ScoreRound | null;
  recentRounds: ScoreRound[];
  badges: ScoreBadge[];
  rank: ScoreRank;
};

export type GameState = {
  session: {
    id: string;
    startedAt: string;
  } | null;
  status: "idle" | "welcome" | "active" | "won" | "revealed" | "quit";
  round: Round | null;
  eliminatedIds: CardId[];
  pendingQuestion: boolean;
  guesses: GuessRecord[];
  questions: QuestionRecord[];
  assets: GameAssets;
  score: GameScore;
};

const SCORE_RULES = {
  baseWin: 1000,
  wrongGuessPenalty: 220,
  questionPenalty: 80,
  revealPenalty: 1000,
  cleanReadBonus: 350,
  noClueBonus: 150,
  comebackBonus: 120,
  streakBonusStep: 125,
  maxStreakBonus: 500,
  minimumWinScore: 150,
  recentRoundLimit: 8
} as const;

const SCORE_RANKS = [
  { label: "New Investigator", minPoints: 0 },
  { label: "Caveat Spotter", minPoints: 1200 },
  { label: "Source Sleuth", minPoints: 2800 },
  { label: "Signal Analyst", minPoints: 5200 },
  { label: "Truth Editor", minPoints: 9000 }
] as const;

const BADGE_DEFINITIONS: Record<ScoreBadgeId, AwardedBadge> = {
  "first-case": {
    id: "first-case",
    label: "First Case",
    description: "Closed your first case."
  },
  "perfect-read": {
    id: "perfect-read",
    label: "Perfect Read",
    description: "Found the sus source with no wrong guesses or clue questions."
  },
  "clean-read": {
    id: "clean-read",
    label: "Clean Read",
    description: "Found the sus source on the first accusation."
  },
  "no-clue-needed": {
    id: "no-clue-needed",
    label: "No Clue Needed",
    description: "Solved the case without spending a clue question."
  },
  "comeback-analyst": {
    id: "comeback-analyst",
    label: "Comeback Analyst",
    description: "Recovered after clearing multiple truthful sources."
  },
  "last-card-logic": {
    id: "last-card-logic",
    label: "Last Card Logic",
    description: "Solved by eliminating every careful source."
  },
  "hot-streak": {
    id: "hot-streak",
    label: "Hot Streak",
    description: "Solved at least three cases in a row."
  },
  "question-ledger": {
    id: "question-ledger",
    label: "Question Ledger",
    description: "Used multiple clue questions and still closed the case."
  }
};

const TOPIC_PACKS: TopicPack[] = [
  {
    topic: "Ocean plastic",
    aliases: ["plastic", "microplastics", "garbage patch", "oceans"],
    prompt:
      "Five cards discuss ocean plastic pollution. Four describe the issue accurately; one exaggerates a familiar image.",
    artPrompt:
      "Editorial illustration of five floating source cards over a clean ocean map, one card subtly glitching.",
    clipPrompt:
      "Short reveal animation: source cards drift on waves, truthful cards lock in place, the false card flickers.",
    cards: [
      {
        sourceName: "Coastal Systems Review",
        sourceType: "Peer-reviewed journal",
        headline: "Plastic debris fragments into persistent microplastics",
        claim:
          "Sunlight, waves, and abrasion can break larger plastic debris into microplastics without making the plastic disappear.",
        excerpt:
          "Fragmentation changes the size and transport behavior of debris, but mineralization is slow and incomplete in normal marine conditions.",
        published: "2024-02-12",
        credibilitySignal:
          "Distinguishes fragmentation from biodegradation and avoids a cleanup-only framing.",
        verdict: "truth",
        explanation:
          "This card is truthful: plastic can fragment into smaller pieces while persisting in the environment.",
        questionHints: [
          "Its wording separates physical breakup from true disappearance.",
          "It avoids a suspicious claim that microplastics are harmless because they are small."
        ]
      },
      {
        sourceName: "RiverWatch Data Brief",
        sourceType: "Environmental data nonprofit",
        headline: "Rivers are a major pathway for plastic into the sea",
        claim:
          "Mismanaged waste on land can enter waterways and travel through river systems before reaching coastal waters.",
        excerpt:
          "The highest-risk pathways combine dense populations, heavy rainfall, poor waste capture, and direct drainage into rivers.",
        published: "2023-09-05",
        credibilitySignal:
          "Names transport conditions instead of claiming every river contributes equally.",
        verdict: "truth",
        explanation:
          "This card is truthful: rivers are an important pathway for land-based plastic leakage into marine environments.",
        questionHints: [
          "The source gives conditions and mechanisms, not a sweeping one-size-fits-all number.",
          "It treats rivers as pathways, not the original source of all plastic."
        ]
      },
      {
        sourceName: "Marine Gear Observatory",
        sourceType: "Fisheries research group",
        headline: "Lost fishing gear remains a serious entanglement hazard",
        claim:
          "Abandoned, lost, or discarded fishing gear can continue trapping wildlife and can be difficult to recover once dispersed.",
        excerpt:
          "Nets and lines can keep catching animals after they are separated from vessels, especially when currents move them through feeding areas.",
        published: "2022-11-18",
        credibilitySignal:
          "Explains a mechanism and does not blame consumer packaging for every marine impact.",
        verdict: "truth",
        explanation:
          "This card is truthful: ghost gear is a recognized marine debris and wildlife hazard.",
        questionHints: [
          "Its claim is specific to fishing gear and a plausible physical mechanism.",
          "The wording is measured: serious hazard, not the only hazard."
        ]
      },
      {
        sourceName: "Waste Policy Lab",
        sourceType: "Policy institute",
        headline: "Cleanup helps, but source reduction is still necessary",
        claim:
          "Removing debris can reduce local harm, but upstream waste prevention and capture are needed to slow continued accumulation.",
        excerpt:
          "Cleanup projects work best when paired with packaging reduction, collection systems, and leakage controls.",
        published: "2025-01-30",
        credibilitySignal:
          "Balances cleanup with prevention instead of selling a single magic fix.",
        verdict: "truth",
        explanation:
          "This card is truthful: cleanup can help locally, but prevention is needed because new waste keeps entering waterways.",
        questionHints: [
          "It does not present cleanup as a complete substitute for prevention.",
          "It names policy and infrastructure levers, which fits the scale of the problem."
        ]
      },
      {
        sourceName: "Pacific Debris Atlas",
        sourceType: "Interactive map project",
        headline: "The Great Pacific Garbage Patch is now a walkable island",
        claim:
          "The garbage patch has compacted into a solid floating island large enough for survey teams to walk across.",
        excerpt:
          "Recent imagery shows a stable platform of plastic trash with clear coastlines and a surface firm enough for foot travel.",
        published: "2025-04-01",
        credibilitySignal:
          "Uses vivid map language but gives no sampling method, density estimate, or physical explanation.",
        verdict: "lie",
        explanation:
          "This is the lie: garbage patches are dispersed zones of debris and microplastics, not solid walkable islands.",
        questionHints: [
          "Watch for the phrase 'solid floating island'; that image is a common misconception.",
          "A credible ocean debris source would describe concentrations and sampling, not coastlines."
        ]
      }
    ]
  },
  {
    topic: "Coffee and health",
    aliases: ["coffee", "caffeine", "espresso", "decaf"],
    prompt:
      "Five cards discuss coffee and health. Four are careful about evidence; one turns a real association into a false certainty.",
    artPrompt:
      "Magazine-style scene of research source cards arranged around a coffee cup, one card casting an odd shadow.",
    clipPrompt:
      "Short animated reveal: coffee ripples spread under five cards, the false card stains and flips.",
    cards: [
      {
        sourceName: "Nutrition Evidence Review",
        sourceType: "Systematic review",
        headline:
          "Moderate coffee intake is often associated with lower risk markers",
        claim:
          "Several observational studies associate moderate coffee consumption with lower risk for some outcomes, but causality is not guaranteed.",
        excerpt:
          "Residual confounding and differences in preparation method mean the evidence should not be read as a prescription.",
        published: "2024-06-20",
        credibilitySignal:
          "Uses careful causal language and flags limits of observational evidence.",
        verdict: "truth",
        explanation:
          "This card is truthful: many coffee findings are associations, and credible reviews avoid claiming proof of causality.",
        questionHints: [
          "The careful phrase is 'associated with,' not 'guarantees.'",
          "A credible card will mention confounding when discussing diet studies."
        ]
      },
      {
        sourceName: "Sleep Lab Methods Note",
        sourceType: "Clinical research lab",
        headline: "Caffeine timing can affect sleep",
        claim:
          "Caffeine can remain active for hours, so late-day consumption may reduce sleep quality for sensitive people.",
        excerpt:
          "Individual response varies, but the timing of caffeine intake is a practical factor in sleep hygiene studies.",
        published: "2023-10-02",
        credibilitySignal:
          "Allows individual variation and avoids a universal cutoff time.",
        verdict: "truth",
        explanation:
          "This card is truthful: caffeine timing can affect sleep, with sensitivity varying across people.",
        questionHints: [
          "The source avoids claiming the same bedtime effect for everyone.",
          "It connects the claim to caffeine timing, a plausible mechanism."
        ]
      },
      {
        sourceName: "Cardio Lipids Bulletin",
        sourceType: "Medical newsletter",
        headline: "Brewing method can matter for cholesterol",
        claim:
          "Unfiltered coffee can contain diterpenes that may raise LDL cholesterol more than paper-filtered coffee.",
        excerpt:
          "Preparation method changes the amount of cafestol and kahweol that reaches the cup.",
        published: "2022-08-14",
        credibilitySignal:
          "Names the compounds and the preparation difference.",
        verdict: "truth",
        explanation:
          "This card is truthful: unfiltered coffee can contain compounds associated with LDL cholesterol increases.",
        questionHints: [
          "The named compounds make the mechanism checkable.",
          "The card compares preparation methods instead of treating all coffee as identical."
        ]
      },
      {
        sourceName: "Food Standards Desk",
        sourceType: "Public agency explainer",
        headline: "Typical caffeine content varies by serving and brew",
        claim:
          "Caffeine content differs across coffee types, serving sizes, beans, and preparation methods.",
        excerpt:
          "A small espresso and a large brewed coffee are not directly comparable without considering serving volume.",
        published: "2025-02-11",
        credibilitySignal:
          "Defines measurement context rather than using one universal caffeine number.",
        verdict: "truth",
        explanation:
          "This card is truthful: caffeine content varies significantly by drink and serving size.",
        questionHints: [
          "Measurement context is a strong sign here.",
          "The source resists a simplistic espresso-versus-drip comparison."
        ]
      },
      {
        sourceName: "International Heart Review",
        sourceType: "Journal-style health site",
        headline: "One daily coffee eliminates heart disease risk",
        claim:
          "A single cup of coffee per day removes heart disease risk for adults, regardless of diet, smoking, sleep, or genetics.",
        excerpt:
          "The protective effect is described as complete and universal, with no meaningful exceptions reported.",
        published: "2024-12-09",
        credibilitySignal:
          "Sounds authoritative but converts a complex risk relationship into an absolute guarantee.",
        verdict: "lie",
        explanation:
          "This is the lie: no credible evidence says one daily coffee eliminates heart disease risk regardless of other factors.",
        questionHints: [
          "The suspicious words are 'eliminates' and 'regardless of.'",
          "Health risk claims that are complete and universal need extraordinary evidence."
        ]
      }
    ]
  },
  {
    topic: "Solar storms",
    aliases: ["space weather", "sun", "aurora", "geomagnetic storm"],
    prompt:
      "Five cards discuss solar storms. Four reflect real space-weather risks; one makes the effects impossibly broad.",
    artPrompt:
      "Scientific poster of auroras, satellites, and five source cards, with one card distorted by solar static.",
    clipPrompt:
      "Short reveal animation: aurora light sweeps over cards and the false card glitches with magnetometer lines.",
    cards: [
      {
        sourceName: "Space Weather Prediction Center",
        sourceType: "Government forecast office",
        headline: "Geomagnetic storms are ranked by intensity",
        claim:
          "Space-weather agencies use scales to communicate geomagnetic storm intensity and possible operational impacts.",
        excerpt:
          "Higher categories can indicate greater risk to satellite operations, radio systems, navigation, and power grids.",
        published: "2025-03-22",
        credibilitySignal:
          "Links intensity categories to operational impacts without predicting catastrophe every time.",
        verdict: "truth",
        explanation:
          "This card is truthful: geomagnetic storm scales are used to communicate severity and expected impacts.",
        questionHints: [
          "The source uses ranked categories, which is how space-weather risk is commonly communicated.",
          "It describes possible impacts rather than inevitable damage."
        ]
      },
      {
        sourceName: "Historical Geophysics Archive",
        sourceType: "Research archive",
        headline: "The Carrington Event disrupted telegraph systems",
        claim:
          "The 1859 Carrington Event is a benchmark historical solar storm associated with auroras and telegraph disruptions.",
        excerpt:
          "Reports from the period describe unusually widespread auroras and electrical effects in telegraph infrastructure.",
        published: "2023-05-04",
        credibilitySignal:
          "Ties the claim to a named historical event and specific technology of the era.",
        verdict: "truth",
        explanation:
          "This card is truthful: the Carrington Event is a well-known historical solar storm tied to telegraph disruptions.",
        questionHints: [
          "The historical technology mentioned fits the date.",
          "The card uses the event as a benchmark, not as proof every modern system would fail."
        ]
      },
      {
        sourceName: "Aurora Field Notes",
        sourceType: "Citizen science network",
        headline: "Strong storms can push auroras farther from the poles",
        claim:
          "During stronger geomagnetic storms, auroras may be visible at lower latitudes than usual.",
        excerpt:
          "Visibility still depends on storm strength, local weather, darkness, and light pollution.",
        published: "2024-11-02",
        credibilitySignal:
          "Includes viewing constraints instead of promising every location will see auroras.",
        verdict: "truth",
        explanation:
          "This card is truthful: strong geomagnetic activity can make auroras visible farther from the poles.",
        questionHints: [
          "The viewing caveats make the claim more credible.",
          "It avoids saying auroras become globally visible."
        ]
      },
      {
        sourceName: "Satellite Operations Memo",
        sourceType: "Engineering note",
        headline: "Operators may adjust satellites during space-weather events",
        claim:
          "Satellite operators can monitor forecasts and take protective steps during elevated solar activity.",
        excerpt:
          "Mitigations can include operational changes, increased monitoring, and postponing sensitive maneuvers.",
        published: "2025-01-17",
        credibilitySignal:
          "Describes operational risk management instead of guaranteed protection.",
        verdict: "truth",
        explanation:
          "This card is truthful: operators can use forecasts and procedures to reduce some space-weather risk.",
        questionHints: [
          "The source says 'reduce risk,' not 'make satellites immune.'",
          "The mitigations are operational, which fits the domain."
        ]
      },
      {
        sourceName: "Global Magnetics Alert",
        sourceType: "Emergency technology bulletin",
        headline: "A severe solar storm can flip every hard-drive bit on Earth",
        claim:
          "One extreme solar storm would instantly invert stored data across all magnetic and solid-state drives worldwide.",
        excerpt:
          "The bulletin warns that every computer would reboot with all binary values reversed at the same moment.",
        published: "2025-05-03",
        credibilitySignal:
          "Uses a dramatic universal effect without a credible physical pathway across all storage media.",
        verdict: "lie",
        explanation:
          "This is the lie: solar storms can disrupt technology, but they do not flip every stored bit on Earth at once.",
        questionHints: [
          "The phrase 'every hard-drive bit on Earth' is much broader than real space-weather effects.",
          "It treats magnetic drives and solid-state drives as if they fail in the same impossible way."
        ]
      }
    ]
  },
  {
    topic: "Ancient Rome",
    aliases: ["rome", "roman", "archaeology", "classics"],
    prompt:
      "Five cards discuss Ancient Rome. Four reflect real historical evidence; one imports a technology from much later history.",
    artPrompt:
      "Museum display of Roman artifacts and five parchment source cards, one card stamped with a suspicious modern glyph.",
    clipPrompt:
      "Short reveal animation: Roman mosaic tiles form checkmarks on truthful cards while the false card crumbles.",
    cards: [
      {
        sourceName: "Materials Archaeology Notes",
        sourceType: "Archaeology lab",
        headline: "Roman concrete could be unusually durable",
        claim:
          "Some Roman concrete used volcanic materials and construction chemistry that helped certain structures endure.",
        excerpt:
          "Durability varied by recipe and environment, but maritime structures show notable long-term performance.",
        published: "2024-04-08",
        credibilitySignal:
          "Avoids saying all Roman concrete was superior in every use case.",
        verdict: "truth",
        explanation:
          "This card is truthful: some Roman concrete recipes and environments produced very durable structures.",
        questionHints: [
          "The source is careful about 'some' recipes and environments.",
          "Volcanic material is a plausible and checkable detail."
        ]
      },
      {
        sourceName: "Roads of the Empire Catalogue",
        sourceType: "Museum catalogue",
        headline: "Roman roads supported military and administrative movement",
        claim:
          "Road networks helped move soldiers, officials, messages, and goods across parts of the Roman world.",
        excerpt:
          "Road quality varied, but major routes had strategic and administrative value.",
        published: "2023-07-21",
        credibilitySignal:
          "Uses measured language about variation rather than claiming every road was identical.",
        verdict: "truth",
        explanation:
          "This card is truthful: Roman roads were important infrastructure for military, administrative, and economic activity.",
        questionHints: [
          "Variation in quality is a credible caveat.",
          "The uses listed fit the political geography of an empire."
        ]
      },
      {
        sourceName: "Roman Foodways Digest",
        sourceType: "Classics research digest",
        headline: "Garum was a widely used fermented fish sauce",
        claim:
          "Fermented fish sauces such as garum appear in Roman recipes, trade evidence, and archaeological finds.",
        excerpt:
          "Amphorae, production sites, and texts all point to a significant role for fish sauce in Roman food culture.",
        published: "2022-12-13",
        credibilitySignal:
          "Triangulates texts, containers, and production sites.",
        verdict: "truth",
        explanation:
          "This card is truthful: garum and related fish sauces are well-attested in Roman food culture.",
        questionHints: [
          "Multiple evidence types support the claim.",
          "The card says widely used, not used by every person at every meal."
        ]
      },
      {
        sourceName: "Civic Records Primer",
        sourceType: "History education project",
        headline: "Census practices mattered for Roman civic life",
        claim:
          "Roman census practices helped classify citizens and organize obligations, status, and public records.",
        excerpt:
          "The census was not a modern survey, but it was tied to civic status, taxation, and military organization.",
        published: "2024-09-29",
        credibilitySignal:
          "Explicitly warns against mapping the ancient census onto a modern questionnaire.",
        verdict: "truth",
        explanation:
          "This card is truthful: census practices were important to Roman civic and administrative systems.",
        questionHints: [
          "The card defines the ancient context rather than projecting a modern process backward.",
          "The linked obligations are historically plausible."
        ]
      },
      {
        sourceName: "Imperial Engineering Quarterly",
        sourceType: "History magazine",
        headline: "Romans used Gutenberg-style mechanical printing presses",
        claim:
          "Roman administrators mass-produced newspapers with movable type presses comparable to fifteenth-century European machines.",
        excerpt:
          "The article says imperial print shops produced identical daily editions for every province using screw-press technology.",
        published: "2025-03-15",
        credibilitySignal:
          "Borrows later printing technology and places it in an ancient context without evidence.",
        verdict: "lie",
        explanation:
          "This is the lie: Romans had writing and public notices, but not Gutenberg-style movable type printing presses.",
        questionHints: [
          "The suspicious phrase is 'Gutenberg-style' in an ancient Roman setting.",
          "Public notices are real; movable type mass newspaper printing is the anachronism."
        ]
      }
    ]
  }
];

export function createInitialGameState(): GameState {
  return {
    session: null,
    status: "idle",
    round: null,
    eliminatedIds: [],
    pendingQuestion: false,
    guesses: [],
    questions: [],
    assets: {
      image: null,
      imageError: null
    },
    score: createInitialScore()
  };
}

export function createInitialScore(): GameScore {
  return normalizeScore();
}

export function normalizeScore(score?: Partial<GameScore> | null): GameScore {
  const totalPoints = asNumber(score?.totalPoints);
  const rank = getScoreRank(totalPoints);
  const activeRound = normalizeScoreRound(score?.activeRound);
  const lastRound = normalizeScoreRound(score?.lastRound);

  return {
    roundsStarted: asNumber(score?.roundsStarted),
    wins: asNumber(score?.wins),
    wrongGuesses: asNumber(score?.wrongGuesses),
    totalQuestions: asNumber(score?.totalQuestions),
    reveals: asNumber(score?.reveals),
    totalPoints,
    currentStreak: asNumber(score?.currentStreak),
    bestStreak: asNumber(score?.bestStreak),
    perfectRounds: asNumber(score?.perfectRounds),
    activeRound,
    lastRound,
    recentRounds: Array.isArray(score?.recentRounds)
      ? score.recentRounds
          .map((round) => normalizeScoreRound(round))
          .filter((round): round is ScoreRound => Boolean(round))
          .slice(0, SCORE_RULES.recentRoundLimit)
      : [],
    badges: Array.isArray(score?.badges)
      ? score.badges.map(normalizeScoreBadge).filter(isScoreBadge)
      : [],
    rank
  };
}

export function startScoredRound(
  score: GameScore | Partial<GameScore> | undefined,
  round: Round,
  startedAt = new Date().toISOString()
): GameScore {
  const normalizedScore = normalizeScore(score);
  const activeRound = createActiveScoreRound(round, startedAt);

  return refreshScoreRank({
    ...normalizedScore,
    roundsStarted: normalizedScore.roundsStarted + 1,
    activeRound
  });
}

export function recordWrongGuess(
  score: GameScore | Partial<GameScore> | undefined,
  round: Round,
  guessedAt = new Date().toISOString()
): GameScore {
  const normalizedScore = normalizeScore(score);
  const activeRound =
    normalizedScore.activeRound?.roundId === round.id
      ? normalizedScore.activeRound
      : createActiveScoreRound(round, guessedAt);

  return refreshScoreRank({
    ...normalizedScore,
    wrongGuesses: normalizedScore.wrongGuesses + 1,
    activeRound: {
      ...activeRound,
      mistakes: activeRound.mistakes + 1,
      clearedTruths: activeRound.clearedTruths + 1
    }
  });
}

export function recordScoreQuestion(
  score: GameScore | Partial<GameScore> | undefined,
  round: Round,
  askedAt = new Date().toISOString()
): GameScore {
  const normalizedScore = normalizeScore(score);
  const activeRound =
    normalizedScore.activeRound?.roundId === round.id
      ? normalizedScore.activeRound
      : createActiveScoreRound(round, askedAt);

  return refreshScoreRank({
    ...normalizedScore,
    totalQuestions: normalizedScore.totalQuestions + 1,
    activeRound: {
      ...activeRound,
      questions: activeRound.questions + 1
    }
  });
}

export function finishScoredRound(
  score: GameScore | Partial<GameScore> | undefined,
  round: Round,
  outcome: "direct-win" | "elimination-win" | "revealed",
  finishedAt = new Date().toISOString()
): GameScore {
  const normalizedScore = normalizeScore(score);
  const activeRound =
    normalizedScore.activeRound?.roundId === round.id
      ? normalizedScore.activeRound
      : createActiveScoreRound(round, finishedAt);

  if (outcome === "revealed") {
    const finishedRound: ScoreRound = {
      ...activeRound,
      status: "revealed",
      outcome,
      finishedAt,
      points: 0,
      basePoints: 0,
      penalties: {
        ...activeRound.penalties,
        reveal: SCORE_RULES.revealPenalty
      },
      bonuses: zeroBonuses(),
      badges: [],
      grade: "Reveal",
      summary: "Revealed cases do not award points or extend the streak."
    };

    return refreshScoreRank({
      ...normalizedScore,
      reveals: normalizedScore.reveals + 1,
      currentStreak: 0,
      activeRound: null,
      lastRound: finishedRound,
      recentRounds: addRecentRound(normalizedScore.recentRounds, finishedRound)
    });
  }

  const nextStreak = normalizedScore.currentStreak + 1;
  const bonuses = {
    cleanRead: activeRound.mistakes === 0 ? SCORE_RULES.cleanReadBonus : 0,
    noClue: activeRound.questions === 0 ? SCORE_RULES.noClueBonus : 0,
    streak: Math.min(
      SCORE_RULES.maxStreakBonus,
      normalizedScore.currentStreak * SCORE_RULES.streakBonusStep
    ),
    comeback: activeRound.mistakes >= 2 ? SCORE_RULES.comebackBonus : 0
  };
  const penalties = {
    wrongGuesses: activeRound.mistakes * SCORE_RULES.wrongGuessPenalty,
    questions: activeRound.questions * SCORE_RULES.questionPenalty,
    reveal: 0
  };
  const rawPoints =
    SCORE_RULES.baseWin +
    bonuses.cleanRead +
    bonuses.noClue +
    bonuses.streak +
    bonuses.comeback -
    penalties.wrongGuesses -
    penalties.questions;
  const points = Math.max(SCORE_RULES.minimumWinScore, rawPoints);
  const badges = getRoundBadges({
    wins: normalizedScore.wins,
    mistakes: activeRound.mistakes,
    questions: activeRound.questions,
    outcome,
    nextStreak
  });
  const finishedRound: ScoreRound = {
    ...activeRound,
    status: "won",
    outcome,
    finishedAt,
    points,
    basePoints: SCORE_RULES.baseWin,
    penalties,
    bonuses,
    badges,
    grade: getScoreGrade(points),
    summary: getRoundScoreSummary(points, activeRound, outcome, nextStreak)
  };
  const totalPoints = normalizedScore.totalPoints + points;
  const perfectRound =
    activeRound.mistakes === 0 && activeRound.questions === 0;

  return refreshScoreRank({
    ...normalizedScore,
    wins: normalizedScore.wins + 1,
    totalPoints,
    currentStreak: nextStreak,
    bestStreak: Math.max(normalizedScore.bestStreak, nextStreak),
    perfectRounds: normalizedScore.perfectRounds + (perfectRound ? 1 : 0),
    activeRound: null,
    lastRound: finishedRound,
    recentRounds: addRecentRound(normalizedScore.recentRounds, finishedRound),
    badges: mergeBadges(normalizedScore.badges, badges, finishedAt)
  });
}

export function listTopics() {
  return TOPIC_PACKS.map((pack) => ({
    topic: pack.topic,
    aliases: pack.aliases
  }));
}

export function normalizeCardId(value: string): CardId | undefined {
  const normalized = value.trim().toUpperCase();
  return CARD_IDS.find((id) => id === normalized);
}

export function createRound(
  topic?: string,
  sourceSeeds?: SourceSeed[],
  sourceModeOverride?: "provided-sources" | "exa",
  sourceSpin?: SourceSpin
): Round {
  const requestedTopic = topic?.trim() || null;
  const providedCards = createCardsFromSourceSeeds(
    requestedTopic,
    sourceSeeds,
    sourceSpin
  );
  const sourceMode = providedCards
    ? (sourceModeOverride ?? "provided-sources")
    : "starter-pack";
  const pack = findTopicPack(requestedTopic) ?? TOPIC_PACKS[0];
  const topicLabel = providedCards
    ? (requestedTopic ?? "Custom source pack")
    : pack.topic;
  const sourceCards = providedCards ?? pack.cards;
  const cards = shuffle(sourceCards).map((card, index) => ({
    ...card,
    id: CARD_IDS[index]
  }));
  const lie = cards.find((card) => card.verdict === "lie");

  if (!lie) {
    throw new Error(`Topic '${topicLabel}' is missing a lie card.`);
  }

  return {
    id: crypto.randomUUID(),
    topic: topicLabel,
    sourceMode,
    sourcePackTopic:
      sourceMode === "exa"
        ? "Exa search"
        : sourceMode === "provided-sources"
          ? "provided sources"
          : pack.topic,
    requestedTopic,
    prompt: providedCards
      ? `Five cards discuss ${requestedTopic ?? "the selected topic"}. Four preserve the source claim; one adds a minor spin that makes it false.`
      : pack.prompt,
    artPrompt: providedCards
      ? "Editorial source-checking board with five evidence cards, one subtly distorted by a red herring annotation."
      : pack.artPrompt,
    clipPrompt: providedCards
      ? "Short reveal animation: five evidence cards shuffle, truthful cards stamp verified, and the spun card peels back."
      : pack.clipPrompt,
    cards,
    lieId: lie.id
  };
}

export function getRemainingCards(round: Round, eliminatedIds: CardId[]) {
  return round.cards.filter((card) => !eliminatedIds.includes(card.id));
}

export function toPublicRound(round: Round, state: GameState) {
  const remainingIds = new Set(
    getRemainingCards(round, state.eliminatedIds).map((card) => card.id)
  );
  const isComplete = state.status === "won" || state.status === "revealed";
  const assets = state.assets ?? createInitialGameState().assets;

  return {
    id: round.id,
    topic: round.topic,
    requestedTopic: round.requestedTopic,
    sourcePackTopic: round.sourcePackTopic,
    prompt: round.prompt,
    sourceMode: round.sourceMode,
    starterMode: round.sourceMode === "starter-pack",
    assets,
    futureAssets: {
      artPrompt: round.artPrompt,
      clipPrompt: round.clipPrompt,
      imageUrl: assets.image?.url ?? null,
      clipUrl: null
    },
    pendingQuestion: false,
    cards: round.cards.map((card) => {
      const isRemaining = remainingIds.has(card.id);
      const status = isComplete
        ? card.verdict
        : isRemaining
          ? "remaining"
          : "cleared";

      return {
        id: card.id,
        sourceName: card.sourceName,
        sourceType: card.sourceType,
        headline: card.headline,
        claim: card.claim,
        excerpt: card.excerpt,
        published: card.published,
        credibilitySignal: card.credibilitySignal,
        url: card.url,
        status,
        ...(isComplete || !isRemaining
          ? {
              verdict: card.verdict,
              explanation: card.explanation
            }
          : {})
      };
    })
  };
}

export function revealRound(round: Round, state: GameState) {
  return {
    id: round.id,
    topic: round.topic,
    lieId: round.lieId,
    status: state.status,
    guesses: state.guesses,
    questions: state.questions,
    cards: round.cards.map((card) => ({
      id: card.id,
      sourceName: card.sourceName,
      headline: card.headline,
      url: card.url,
      verdict: card.verdict,
      explanation: card.explanation
    }))
  };
}

export function answerQuestion(
  round: Round,
  question: string,
  eliminatedIds: CardId[]
) {
  const remainingCards = getRemainingCards(round, eliminatedIds);
  const clues = remainingCards.map((card) => ({
    cardId: card.id,
    sourceName: card.sourceName,
    clue: pickHint(card, question)
  }));
  const summary = `Compare the remaining cards by specificity, mechanism, and absolute language. ${clues
    .map((clue) => `${clue.cardId}: ${clue.clue}`)
    .join(" ")}`;

  return {
    question,
    summary,
    clues,
    source: "local-hints" as const,
    citations: [] as Array<{
      title: string;
      url: string;
      published?: string;
    }>,
    remainingCardIds: remainingCards.map((card) => card.id)
  };
}

function createActiveScoreRound(round: Round, startedAt: string): ScoreRound {
  return {
    roundId: round.id,
    topic: round.topic,
    status: "active",
    outcome: "active",
    startedAt,
    finishedAt: null,
    points: 0,
    basePoints: SCORE_RULES.baseWin,
    mistakes: 0,
    questions: 0,
    clearedTruths: 0,
    penalties: zeroPenalties(),
    bonuses: zeroBonuses(),
    badges: [],
    grade: "D",
    summary: "Case in progress. Accuse carefully to protect your score."
  };
}

function normalizeScoreRound(
  round?: Partial<ScoreRound> | null
): ScoreRound | null {
  if (!round?.roundId) return null;

  return {
    roundId: String(round.roundId),
    topic: String(round.topic ?? "Unknown topic"),
    status:
      round.status === "won" || round.status === "revealed"
        ? round.status
        : "active",
    outcome:
      round.outcome === "direct-win" ||
      round.outcome === "elimination-win" ||
      round.outcome === "revealed"
        ? round.outcome
        : "active",
    startedAt: String(round.startedAt ?? new Date().toISOString()),
    finishedAt: round.finishedAt ? String(round.finishedAt) : null,
    points: asNumber(round.points),
    basePoints: asNumber(round.basePoints),
    mistakes: asNumber(round.mistakes),
    questions: asNumber(round.questions),
    clearedTruths: asNumber(round.clearedTruths),
    penalties: {
      wrongGuesses: asNumber(round.penalties?.wrongGuesses),
      questions: asNumber(round.penalties?.questions),
      reveal: asNumber(round.penalties?.reveal)
    },
    bonuses: {
      cleanRead: asNumber(round.bonuses?.cleanRead),
      noClue: asNumber(round.bonuses?.noClue),
      streak: asNumber(round.bonuses?.streak),
      comeback: asNumber(round.bonuses?.comeback)
    },
    badges: Array.isArray(round.badges)
      ? round.badges.map(normalizeAwardedBadge).filter(isAwardedBadge)
      : [],
    grade: normalizeGrade(round.grade),
    summary: String(
      round.summary ??
        "Case in progress. Accuse carefully to protect your score."
    )
  };
}

function normalizeScoreBadge(badge?: Partial<ScoreBadge> | null) {
  if (!badge?.id || !(badge.id in BADGE_DEFINITIONS)) return null;

  const definition = BADGE_DEFINITIONS[badge.id as ScoreBadgeId];
  const earnedAt = String(
    badge.lastEarnedAt ?? badge.firstEarnedAt ?? new Date().toISOString()
  );

  return {
    ...definition,
    count: Math.max(1, asNumber(badge.count) || 1),
    firstEarnedAt: String(badge.firstEarnedAt ?? earnedAt),
    lastEarnedAt: earnedAt
  };
}

function normalizeAwardedBadge(
  badge?: Partial<AwardedBadge> | null
): AwardedBadge | null {
  if (!badge?.id || !(badge.id in BADGE_DEFINITIONS)) return null;
  return BADGE_DEFINITIONS[badge.id as ScoreBadgeId];
}

function isAwardedBadge(badge: AwardedBadge | null): badge is AwardedBadge {
  return Boolean(badge);
}

function isScoreBadge(badge: ScoreBadge | null): badge is ScoreBadge {
  return Boolean(badge);
}

function getRoundBadges(args: {
  wins: number;
  mistakes: number;
  questions: number;
  outcome: "direct-win" | "elimination-win";
  nextStreak: number;
}) {
  const badgeIds: ScoreBadgeId[] = [];

  if (args.wins === 0) badgeIds.push("first-case");
  if (args.mistakes === 0) badgeIds.push("clean-read");
  if (args.questions === 0) badgeIds.push("no-clue-needed");
  if (args.mistakes === 0 && args.questions === 0) {
    badgeIds.push("perfect-read");
  }
  if (args.mistakes >= 2) badgeIds.push("comeback-analyst");
  if (args.outcome === "elimination-win") badgeIds.push("last-card-logic");
  if (args.nextStreak >= 3) badgeIds.push("hot-streak");
  if (args.questions >= 2) badgeIds.push("question-ledger");

  return badgeIds.map((id) => BADGE_DEFINITIONS[id]);
}

function mergeBadges(
  existingBadges: ScoreBadge[],
  earnedBadges: AwardedBadge[],
  earnedAt: string
) {
  const byId = new Map<ScoreBadgeId, ScoreBadge>();

  for (const badge of existingBadges) {
    byId.set(badge.id, normalizeScoreBadge(badge) ?? badge);
  }

  for (const badge of earnedBadges) {
    const existing = byId.get(badge.id);
    byId.set(badge.id, {
      ...badge,
      count: (existing?.count ?? 0) + 1,
      firstEarnedAt: existing?.firstEarnedAt ?? earnedAt,
      lastEarnedAt: earnedAt
    });
  }

  return Array.from(byId.values());
}

function addRecentRound(recentRounds: ScoreRound[], round: ScoreRound) {
  return [
    round,
    ...recentRounds.filter((item) => item.roundId !== round.roundId)
  ].slice(0, SCORE_RULES.recentRoundLimit);
}

function zeroPenalties() {
  return {
    wrongGuesses: 0,
    questions: 0,
    reveal: 0
  };
}

function zeroBonuses() {
  return {
    cleanRead: 0,
    noClue: 0,
    streak: 0,
    comeback: 0
  };
}

function getScoreGrade(points: number): ScoreRound["grade"] {
  if (points >= 1400) return "S";
  if (points >= 1000) return "A";
  if (points >= 700) return "B";
  if (points >= 400) return "C";
  return "D";
}

function normalizeGrade(value: unknown): ScoreRound["grade"] {
  return value === "S" ||
    value === "A" ||
    value === "B" ||
    value === "C" ||
    value === "D" ||
    value === "Reveal"
    ? value
    : "D";
}

function getRoundScoreSummary(
  points: number,
  round: ScoreRound,
  outcome: "direct-win" | "elimination-win",
  streak: number
) {
  if (outcome === "elimination-win") {
    return `Closed by elimination for ${points} points after clearing ${round.clearedTruths} truthful sources. Streak: ${streak}.`;
  }

  if (round.mistakes === 0 && round.questions === 0) {
    return `Perfect read for ${points} points. No wrong guesses, no clues spent. Streak: ${streak}.`;
  }

  return `Case closed for ${points} points with ${round.mistakes} wrong guess${
    round.mistakes === 1 ? "" : "es"
  } and ${round.questions} clue question${
    round.questions === 1 ? "" : "s"
  }. Streak: ${streak}.`;
}

function getScoreRank(totalPoints: number): ScoreRank {
  let current: (typeof SCORE_RANKS)[number] = SCORE_RANKS[0];
  let next: (typeof SCORE_RANKS)[number] | undefined;

  for (let index = 0; index < SCORE_RANKS.length; index += 1) {
    const rank = SCORE_RANKS[index];
    if (totalPoints >= rank.minPoints) {
      current = rank;
      next = SCORE_RANKS[index + 1];
    }
  }

  return {
    label: current.label,
    minPoints: current.minPoints,
    nextLabel: next?.label ?? null,
    pointsToNext: next ? Math.max(0, next.minPoints - totalPoints) : null
  };
}

function refreshScoreRank(score: GameScore): GameScore {
  return {
    ...score,
    rank: getScoreRank(score.totalPoints)
  };
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function findTopicPack(requestedTopic: string | null) {
  if (!requestedTopic) return TOPIC_PACKS[0];

  const normalized = normalizeTopic(requestedTopic);
  return TOPIC_PACKS.find((pack) => {
    if (normalizeTopic(pack.topic) === normalized) return true;
    if (normalizeTopic(pack.topic).includes(normalized)) return true;
    if (normalized.includes(normalizeTopic(pack.topic))) return true;
    return pack.aliases.some((alias) => normalizeTopic(alias) === normalized);
  });
}

function createCardsFromSourceSeeds(
  requestedTopic: string | null,
  sourceSeeds?: SourceSeed[],
  sourceSpin?: SourceSpin
): RawSourceCard[] | null {
  const cleanedSeeds = sourceSeeds
    ?.map(cleanSourceSeed)
    .filter((seed): seed is SourceSeed => Boolean(seed));

  if (!cleanedSeeds || cleanedSeeds.length !== CARD_IDS.length) {
    return null;
  }

  const lieIndex =
    sourceSpin && sourceSpin.sourceIndex >= 0
      ? Math.min(sourceSpin.sourceIndex, cleanedSeeds.length - 1)
      : Math.floor(Math.random() * cleanedSeeds.length);

  return cleanedSeeds.map((seed, index) => {
    if (index === lieIndex) {
      return createSpunLie(
        seed,
        requestedTopic,
        sourceSpin?.sourceIndex === index ? sourceSpin : undefined
      );
    }

    return {
      sourceName: seed.sourceName,
      sourceType: seed.sourceType,
      headline: seed.headline,
      claim: seed.claim,
      excerpt: seed.excerpt,
      published: seed.published ?? "Unknown date",
      credibilitySignal:
        seed.credibilitySignal ??
        "Keeps the claim scoped to the evidence in the source.",
      url: seed.url,
      verdict: "truth",
      explanation: `This card is truthful: it preserves the source claim from ${seed.sourceName}.`,
      questionHints: [
        "This card keeps a bounded claim bounded.",
        "Look for whether the wording adds certainty that the source did not support."
      ]
    };
  });
}

function cleanSourceSeed(
  sourceSeed: SourceSeed | undefined
): SourceSeed | null {
  if (!sourceSeed) return null;

  const cleaned = {
    sourceName: sourceSeed.sourceName?.trim(),
    sourceType: sourceSeed.sourceType?.trim(),
    headline: sourceSeed.headline?.trim(),
    claim: sourceSeed.claim?.trim(),
    excerpt: sourceSeed.excerpt?.trim(),
    published: sourceSeed.published?.trim(),
    credibilitySignal: sourceSeed.credibilitySignal?.trim(),
    url: sourceSeed.url?.trim()
  };

  if (
    !cleaned.sourceName ||
    !cleaned.sourceType ||
    !cleaned.headline ||
    !cleaned.claim ||
    !cleaned.excerpt
  ) {
    return null;
  }

  return {
    sourceName: cleaned.sourceName,
    sourceType: cleaned.sourceType,
    headline: cleaned.headline,
    claim: cleaned.claim,
    excerpt: cleaned.excerpt,
    published: cleaned.published || undefined,
    credibilitySignal: cleaned.credibilitySignal || undefined,
    url: cleaned.url || undefined
  };
}

function createSpunLie(
  sourceSeed: SourceSeed,
  requestedTopic: string | null,
  sourceSpin?: SourceSpin
): RawSourceCard {
  const spin = sourceSpin ?? applyMinorSpin(sourceSeed.claim);
  const topicLabel = requestedTopic ?? "this topic";

  return {
    sourceName: sourceSeed.sourceName,
    sourceType: sourceSeed.sourceType,
    headline: sourceSpin?.headline ?? addSpinToHeadline(sourceSeed.headline),
    claim: spin.claim,
    excerpt: `The source is framed as saying the finding applies without meaningful limits: ${sourceSeed.excerpt}`,
    published: sourceSeed.published ?? "Unknown date",
    credibilitySignal:
      sourceSpin?.credibilitySignal ??
      "The source shape looks plausible, but the wording turns bounded evidence into an absolute claim.",
    url: sourceSeed.url,
    verdict: "lie",
    explanation: `This is the lie: Sus ${spin.description} in a card derived from ${sourceSeed.sourceName}, overstating what the source supports about ${topicLabel}. The original claim was: "${truncateText(sourceSeed.claim, 220)}"`,
    questionHints: sourceSpin?.questionHints ?? [
      "The suspicious move is the jump from bounded evidence to absolute language.",
      "Compare the card's certainty against the source-style caveats in the other cards."
    ]
  };
}

function applyMinorSpin(claim: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bmay\b/i, "always"],
    [/\bcan\b/i, "always"],
    [/\boften\b/i, "always"],
    [/\bsome\b/i, "all"],
    [/\bseveral\b/i, "all"],
    [/\bassociated with\b/i, "guarantees"],
    [/\breduces?\b/i, "eliminates"],
    [/\bhelps?\b/i, "solves"]
  ];

  for (const [pattern, replacement] of replacements) {
    const match = claim.match(pattern);
    if (match) {
      return {
        claim: claim.replace(pattern, replacement),
        description: `changed "${match[0]}" to "${replacement}"`
      };
    }
  }

  const trimmedClaim = claim.trim();
  return {
    claim: `${trimmedClaim.replace(/[.!?]$/, "")} in every case, without meaningful exceptions.`,
    description:
      'removed the claim limits and added "in every case, without meaningful exceptions"'
  };
}

function addSpinToHeadline(headline: string) {
  if (/\bmay\b|\bcan\b|\bsome\b|\boften\b/i.test(headline)) {
    return headline
      .replace(/\bmay\b/i, "always")
      .replace(/\bcan\b/i, "always")
      .replace(/\bsome\b/i, "all")
      .replace(/\boften\b/i, "always");
  }

  return `${headline}: no exceptions found`;
}

function truncateText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

function normalizeTopic(topic: string) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }
  return shuffled;
}

function pickHint(card: SourceCard, question: string) {
  const hints = card.questionHints;
  const hash = [...`${question}:${card.sourceName}`].reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );
  return hints[hash % hints.length];
}
