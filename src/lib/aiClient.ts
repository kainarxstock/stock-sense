const BLOCK_RE =
  /\b(what\s+should\s+i\s+buy|what\s+to\s+buy|which\s+(coin|stock|token|asset)|best\s+(coin|coins|crypto|stock|stocks|asset|assets|pick|picks)|top\s+(coin|coins|crypto|pick|picks)|trending\s+(coin|coins|crypto|on)|on\s+binance|100x|all[-\s]?in|max\s+leverage|guarantee(d)?\s+(profit|return)|sure\s+win|moon\b|financial\s+advice\s+for\s+me|(buy|sell|long|short)\s+(now|today|this)\b)/i;

export type EducationalChatOptions = {
  beginnerMode: boolean;
  /** Latest app interpretation; when set, the model must use it for app-related questions. */
  interpretationSnapshot?: Record<string, string | number | boolean> | null;
};

export function shouldBlockUserMessage(text: string): boolean {
  return BLOCK_RE.test(text.trim());
}

export async function sendEducationalChat(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[],
  options: EducationalChatOptions,
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userMessage,
      beginnerMode: options.beginnerMode,
      interpretationSnapshot: options.interpretationSnapshot ?? null,
      history: history.slice(-8),
    }),
  });

  if (!res.ok) {
    throw new Error("api_error");
  }

  const json: unknown = await res.json();
  const content = (json as { reply?: string })?.reply;
  if (!content || typeof content !== "string") {
    throw new Error("empty");
  }
  return content.trim();
}
