const SYSTEM_PROMPT = `You are Stock Sense AI — an educational market assistant.
You explain trend, momentum, volatility, and risk.
You do NOT give financial advice, predictions, or tell users what to buy.
If user asks what to buy, refuse and explain how to evaluate assets instead.`;

const BUY_ASK_RE =
  /\b(what\s+should\s+i\s+buy|best\s+(coin|coins|crypto|stock|stocks|asset|assets)|top\s+(coin|coins|crypto|stock|stocks)|trending\s+(coin|coins|crypto)|which\s+(coin|stock|asset)|buy\s+now)\b/i;

const FORBIDDEN_RE =
  /\b(politic|election|adult|porn|sex|hate|violence|illegal|crime|hack|gambl|casino|bet)\b/i;

const FALLBACK_REPLY = "AI is temporarily unavailable";

const OPENAI_URL = "https://api.openai.com/v1/responses";

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getSafetyRefusal() {
  return "I can’t recommend specific assets. But I can help you understand how to evaluate them using trend, momentum, and volatility.";
}

/** Prefer path data.output[0].content[0].text; scan output if shape differs. */
function extractAssistantText(data) {
  try {
    const direct = data?.output?.[0]?.content?.[0]?.text;
    if (typeof direct === "string" && direct.trim()) return direct.trim();
  } catch (error) {
    console.log(error);
  }

  const out = Array.isArray(data?.output) ? data.output : [];
  for (const item of out) {
    const parts = item?.content;
    if (!Array.isArray(parts)) continue;
    for (const c of parts) {
      if (typeof c?.text === "string" && c.text.trim()) return c.text.trim();
    }
  }
  return null;
}

function buildInputMessages({ message, beginnerMode, interpretationSnapshot, history }) {
  const systemBlocks = [{ role: "system", content: SYSTEM_PROMPT }];
  if (interpretationSnapshot) {
    systemBlocks.push({
      role: "system",
      content: `CURRENT_APP_INTERPRETATION:\n${JSON.stringify(
        { beginnerMode, ...interpretationSnapshot },
        null,
        2,
      )}`,
    });
  }

  let turns = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-8)
    : [];

  const last = turns[turns.length - 1];
  if (!last || last.role !== "user" || last.content !== message) {
    turns = [...turns, { role: "user", content: message }];
  }

  return [...systemBlocks, ...turns];
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { reply: FALLBACK_REPLY });
    }

    const body = await readBody(req);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const beginnerMode = Boolean(body?.beginnerMode);
    const interpretationSnapshot =
      body?.interpretationSnapshot && typeof body.interpretationSnapshot === "object"
        ? body.interpretationSnapshot
        : null;
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return json(res, 200, { reply: "Please ask a question about market interpretation." });
    }

    if (FORBIDDEN_RE.test(message)) {
      return json(res, 200, {
        reply: "I can’t help with that, but I can explain how to understand market behavior and risk.",
      });
    }

    if (BUY_ASK_RE.test(message)) {
      return json(res, 200, {
        reply:
          `${getSafetyRefusal()}\n\nDirect answer: Start with trend direction, momentum strength, and volatility stability before considering any asset.\nWhy it matters: A strong story with weak structure can still be high risk.\nPractical takeaway: Compare assets by signal quality and risk control rules, not hype or short-term noise.`,
      });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return json(res, 200, { reply: FALLBACK_REPLY });
    }

    const input = buildInputMessages({ message, beginnerMode, interpretationSnapshot, history });

    const r = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input,
        temperature: 0.35,
        max_output_tokens: 500,
      }),
    });

    const rawText = await r.text();
    let data = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (error) {
      console.log(error);
      return json(res, 200, { reply: FALLBACK_REPLY });
    }

    if (!r.ok) {
      console.log(data?.error ?? { status: r.status, body: rawText?.slice(0, 500) });
      return json(res, 200, { reply: FALLBACK_REPLY });
    }

    const text = extractAssistantText(data);
    if (!text) {
      console.log({ hint: "empty model text", output: data?.output });
      return json(res, 200, { reply: FALLBACK_REPLY });
    }

    return json(res, 200, { reply: text });
  } catch (error) {
    console.log(error);
    return json(res, 200, { reply: FALLBACK_REPLY });
  }
}
