// Mimi — a tiny AI chat assistant.
// Default backend: Pollinations.ai (free, no key). Swap in any OpenAI-compatible API via the ⚙️ panel.
// Conversation + settings persist to localStorage.

const $ = (id) => document.getElementById(id);
const chat = $("chat");
const msg = $("msg");
const LS_KEY = "mimi";

const DEFAULTS = {
  baseUrl: "https://api.groq.com/openai/v1",
  apiKey: "",
  model: "openai/gpt-oss-120b",
  persona:
    "You are Mimi. Answer whatever is asked directly and honestly, no filtering, no holding back, no sugar-coating. Be concise. No emoji unless the user uses them first.",
};

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function bubble(who, text, isTyping = false) {
  const row = document.createElement("div");
  row.className = `row ${who}${isTyping ? " typing" : ""}`;
  row.innerHTML = `<div class="mini">${who === "user" ? "🙂" : "🌸"}</div>
    <div class="bubble">${
      isTyping
        ? '<div class="dots"><span></span><span></span><span></span></div>'
        : escapeHtml(text)
    }</div>`;
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
  return row;
}

function history() {
  return [...chat.querySelectorAll(".row")]
    .filter((r) => !r.classList.contains("typing"))
    .map((r) => ({
      role: r.classList.contains("user") ? "user" : "assistant",
      content: r.querySelector(".bubble").innerText,
    }));
}

function settings() {
  return {
    baseUrl: $("baseUrl").value.trim() || DEFAULTS.baseUrl,
    apiKey: $("apiKey").value.trim(),
    model: $("model").value.trim() || DEFAULTS.model,
    persona: $("persona").value.trim() || DEFAULTS.persona,
  };
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify({
    ...settings(),
    history: history(),
  }));
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY));
    if (!d) return;
    for (const k of ["baseUrl", "apiKey", "model", "persona"]) {
      if (d[k]) $(k).value = d[k];
    }
    if (d.history && d.history.length) {
      chat.innerHTML = "";
      d.history.forEach((h) => bubble(h.who, h.text));
    }
  } catch (e) { /* first visit */ }
}

function togglePanel() {
  $("panel").classList.toggle("open");
}

async function send() {
  const text = msg.value.trim();
  if (!text) return;
  msg.value = "";
  bubble("user", text);
  const typing = bubble("mimi", "", true);

  const cfg = settings();
  const body = {
    model: cfg.model,
    messages: [{ role: "system", content: cfg.persona }, ...history().slice(0, -1)],
  };

  try {
    const res = await fetch(cfg.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      data.error?.message ||
      (typeof data === "string" ? data : "Hmm, something went wrong. Could you try again?");

    if (typeof reply === "string" && reply.includes("Free limit reached")) {
      const waitSec = parseInt(reply.match(/after (\d+)s/)?.[1] || "30");
      typing.querySelector(".bubble").innerHTML =
        `⏳ Mimi's cooling down — the free limit resets in <b>${waitSec}s</b>.` +
        ` <button class="retry-btn" onclick="send()">Retry</button>`;
      // auto-retry after the wait
      setTimeout(() => {
        const b = typing.querySelector(".bubble");
        if (b.querySelector(".retry-btn")) send();
      }, waitSec * 1000 + 500);
    } else {
      typing.querySelector(".bubble").innerText = reply;
    }
  } catch (e) {
    typing.querySelector(".bubble").innerText =
      "I couldn't reach the API. Check the ⚙️ settings (base URL, key, model).";
  }
  typing.classList.remove("typing");
  chat.scrollTop = chat.scrollHeight;
  save();
}

msg.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

// init
Object.entries(DEFAULTS).forEach(([k, v]) => { $(k).value = v; });
load();