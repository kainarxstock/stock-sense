/** Max ~2 short lines each — meaning in action, no theory. */
export const TERM_TIPS: Record<string, string> = {
  trend: "Direction of the market over time. Use it to see who had control lately—not to time the next tick.",
  momentum: "Shows how fast price is moving. Slowing often means the trend is getting tired.",
  structure: "How orderly moves are. Messy structure means stops and surprises show up more often.",
  volatility: "Measures how much price moves. Higher readings mean more gap and whip risk.",
  bias: "A one-line lean from several inputs together. It summarizes the picture—it does not forecast.",
  confidence: "How much the internal signals agree with each other. It is not the odds of being right.",
  risk: "How wild the tape has been lately. High risk means smaller size and wider room for error.",
  marketState: "Plain-language snapshot of trend plus pace. Read it before you read any numbers.",
  rsi: "Tracks whether buying or selling has been persistent. Use it with price action—not alone.",
  compositeLean: "A soft tilt from trend, pace, and averages—not a promise of what happens next.",
};
