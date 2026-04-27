import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";
import { sendEducationalChat, shouldBlockUserMessage, type EducationalChatOptions } from "../lib/aiClient";

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  beginnerMode: boolean;
  interpretationSnapshot?: Record<string, string | number | boolean> | null;
};

export function AiAssistant({ beginnerMode, interpretationSnapshot = null }: Props) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const push = useCallback((m: Msg) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    push({ role: "user", content: text });
    setBusy(true);

    if (shouldBlockUserMessage(text)) {
      push({ role: "assistant", content: t("aiAssistant.blocked") });
      setBusy(false);
      return;
    }

    try {
      const nextHistory = [...messages, { role: "user" as const, content: text }];
      const opts: EducationalChatOptions = { beginnerMode, interpretationSnapshot };
      const reply = await sendEducationalChat(text, nextHistory, opts);
      push({ role: "assistant", content: reply });
    } catch {
      push({ role: "assistant", content: t("aiAssistant.error") });
    } finally {
      setBusy(false);
    }
  }, [busy, beginnerMode, interpretationSnapshot, input, messages, push, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("aiAssistant.title")}</h1>
        <p className="mt-1 text-sm font-medium text-muted-2">{t("aiAssistant.subtitle")}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("aiAssistant.intro")}</p>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">{t("aiAssistant.suggested")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[t("aiAssistant.q1"), t("aiAssistant.q2"), t("aiAssistant.q3")].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setInput(q);
              }}
              className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-left text-xs text-muted transition hover:border-accent/25 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <GlassCard className="mt-8 flex min-h-[320px] flex-col p-5 sm:p-6">
          <div className="min-h-[180px] flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-2">{t("aiAssistant.welcome")}</p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-8 border border-white/[0.08] bg-accent/[0.08] text-foreground"
                      : "mr-4 border border-white/[0.08] bg-surface-0/70 text-muted"
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
            {busy ? (
              <div className="mr-4 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-surface-0/70 px-3 py-2.5 text-sm text-muted">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent/70" />
                {t("aiAssistant.thinking")}
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
          <div className="mt-4 flex gap-2 border-t border-white/[0.06] pt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={t("aiAssistant.placeholder")}
              className="min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-surface-0/80 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-2 focus:border-accent/35 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void send()}
              className="shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/[0.12] disabled:opacity-40"
            >
              {t("aiAssistant.send")}
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-2">{t("aiAssistant.disclaimer")}</p>
        </GlassCard>
      </div>
    </section>
  );
}
