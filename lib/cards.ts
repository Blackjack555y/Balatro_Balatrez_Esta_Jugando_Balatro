// Utilidades de cartas (52 naipes) + evaluación de manos de póker (5 cartas)
export type Suit = "Clubs" | "Diamonds" | "Hearts" | "Spades";
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // J=11 Q=12 K=13 A=14
export type Card = { rank: Rank; suit: Suit };

export const SUITS: Suit[] = ["Clubs", "Diamonds", "Hearts", "Spades"];
export const RANKS: Rank[] = [2,3,4,5,6,7,8,9,10,11,12,13,14];

function rankLabel(r: Rank) {
  if (r <= 10) return String(r);
  return r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : "A";
}

export function toKey(c: Card) {
  return `${rankLabel(c.rank)}${c.suit}`;
}

export function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const r of RANKS) for (const s of SUITS) deck.push({ rank: r, suit: s });
  return deck;
}

export function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function deal(deck: Card[], n: number) {
  return deck.splice(0, n);
}

export type HandEval = {
  score: number;     // mayor = mejor
  name: string;
  tiebreak: number[]; // desempates por rangos descendentes
};

// Detección de escalera (A puede ser alta o baja: A-2-3-4-5)
function straightHigh(ranksDesc: number[]) {
  const uniq = Array.from(new Set(ranksDesc)).sort((a, b) => b - a);
  if (uniq.length !== 5) return 0;
  // A-baja: 5,4,3,2,A(14)
  const aLow = [5,4,3,2,14];
  if (uniq.every((v, i) => v === aLow[i])) return 5;
  // normal
  const max = uniq[0];
  const seq = [max, max-1, max-2, max-3, max-4];
  if (uniq.every((v, i) => v === seq[i])) return max;
  return 0;
}

// Categorías: 8 Escalera Color, 7 Póker, 6 Full, 5 Color, 4 Escalera, 3 Trío, 2 Doble Par, 1 Par, 0 Carta Alta
export function evaluateHand(cards: Card[]): HandEval {
  const ranksDesc = cards.map(c => c.rank).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const straightTop = straightHigh(ranksDesc);

  const counts = new Map<number, number>();
  for (const r of ranksDesc) counts.set(r, (counts.get(r) ?? 0) + 1);
  const freq = Array.from(counts.values()).sort((a,b)=>a-b).join(",");
  const byCountThenRank = Array.from(counts.entries())
    .sort((a,b)=>(b[1]-a[1]) || (b[0]-a[0]))
    .map(([r])=>r);

  if (straightTop && isFlush) return { score: 8, name: "ESCALERA COLOR", tiebreak: [straightTop] };
  if ([...counts.values()].some(v => v === 4)) return { score: 7, name: "POKER", tiebreak: byCountThenRank };
  if (freq === "2,3") return { score: 6, name: "FULL", tiebreak: byCountThenRank };
  if (isFlush) return { score: 5, name: "COLOR", tiebreak: ranksDesc };
  if (straightTop) return { score: 4, name: "ESCALERA", tiebreak: [straightTop] };
  if ([...counts.values()].some(v => v === 3)) return { score: 3, name: "TRÍO", tiebreak: byCountThenRank };
  if ([...counts.values()].filter(v => v === 2).length === 2) return { score: 2, name: "DOBLE PAR", tiebreak: byCountThenRank };
  if ([...counts.values()].some(v => v === 2)) return { score: 1, name: "PAR", tiebreak: byCountThenRank };
  return { score: 0, name: "CARTA ALTA", tiebreak: ranksDesc };
}

export function compareHands(a: Card[], b: Card[]) {
  const ea = evaluateHand(a);
  const eb = evaluateHand(b);
  if (ea.score !== eb.score) return Math.sign(ea.score - eb.score);
  const len = Math.max(ea.tiebreak.length, eb.tiebreak.length);
  for (let i=0;i<len;i++) {
    const da = ea.tiebreak[i] ?? 0;
    const db = eb.tiebreak[i] ?? 0;
    if (da !== db) return Math.sign(da - db);
  }
  return 0;
}

// Mapeo de imágenes (assets en carpeta /assets). Claves: 2..10, J,Q,K,A + Suit
export const CARD_IMAGES: Record<string, any> = {
  "2Clubs": require("../assets/2Clubs.png"),
  "2Diamonds": require("../assets/2Diamonds.png"),
  "2Hearts": require("../assets/2Hearts.png"),
  "2Spades": require("../assets/2Spades.png"),
  "3Clubs": require("../assets/3Clubs.png"),
  "3Diamonds": require("../assets/3Diamonds.png"),
  "3Hearts": require("../assets/3Hearts.png"),
  "3Spades": require("../assets/3Spades.png"),
  "4Clubs": require("../assets/4Clubs.png"),
  "4Diamonds": require("../assets/4Diamonds.png"),
  "4Hearts": require("../assets/4Hearts.png"),
  "4Spades": require("../assets/4Spades.png"),
  "5Clubs": require("../assets/5Clubs.png"),
  "5Diamonds": require("../assets/5Diamonds.png"),
  "5Hearts": require("../assets/5Hearts.png"),
  "5Spades": require("../assets/5Spades.png"),
  "6Clubs": require("../assets/6Clubs.png"),
  "6Diamonds": require("../assets/6Diamonds.png"),
  "6Hearts": require("../assets/6Hearts.png"),
  "6Spades": require("../assets/6Spades.png"),
  "7Clubs": require("../assets/7Clubs.png"),
  "7Diamonds": require("../assets/7Diamonds.png"),
  "7Hearts": require("../assets/7Hearts.png"),
  "7Spades": require("../assets/7Spades.png"),
  "8Clubs": require("../assets/8Clubs.png"),
  "8Diamonds": require("../assets/8Diamonds.png"),
  "8Hearts": require("../assets/8Hearts.png"),
  "8Spades": require("../assets/8Spades.png"),
  "9Clubs": require("../assets/9Clubs.png"),
  "9Diamonds": require("../assets/9Diamonds.png"),
  "9Hearts": require("../assets/9Hearts.png"),
  "9Spades": require("../assets/9Spades.png"),
  "10Clubs": require("../assets/10Clubs.png"),
  "10Diamonds": require("../assets/10Diamonds.png"),
  "10Hearts": require("../assets/10Hearts.png"),
  "10Spades": require("../assets/10Spades.png"),
  "JClubs": require("../assets/jClubs.png"),
  "JDiamonds": require("../assets/jDiamonds.png"),
  "JHearts": require("../assets/jHearts.png"),
  "JSpades": require("../assets/jSpades.png"),
  "QClubs": require("../assets/qClubs.png"),
  "QDiamonds": require("../assets/qDiamonds.png"),
  "QHearts": require("../assets/qHearts.png"),
  "QSpades": require("../assets/qSpades.png"),
  "KClubs": require("../assets/kClubs.png"),
  "KDiamonds": require("../assets/kDiamonds.png"),
  "KHearts": require("../assets/kHearts.png"),
  "KSpades": require("../assets/kSpades.png"),
  "AClubs": require("../assets/aClubs.png"),
  "ADiamonds": require("../assets/aDiamonds.png"),
  "AHearts": require("../assets/aHearts.png"),
  "ASpades": require("../assets/aSpades.png"),
};