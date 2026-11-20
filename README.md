# Mimi 🌸

A tiny, polished AI chat assistant that runs entirely in your browser. No build step, no dependencies — just open `index.html`.

## Quick start

```bash
# any static server works, e.g.:
npx serve .
# or simply double-click index.html
```

Then just chat — Mimi works out of the box via **Pollinations.ai** (free, no API key needed).

## Using your own API

Click the ⚙️ and set any OpenAI-compatible endpoint:

| Provider   | Base URL                        | Key          | Model           |
|------------|---------------------------------|--------------|-----------------|
| Pollinations (default) | `https://text.pollinations.ai/openai` | — | `openai-fast`   |
| OpenAI     | `https://api.openai.com/v1`     | `sk-...`     | `gpt-4o-mini`   |
| Groq       | `https://api.groq.com/openai/v1`| your key     | `llama-3.1-8b-instant` |
| OpenRouter | `https://openrouter.ai/api/v1`  | your key     | any             |
| Ollama     | `http://localhost:11434/v1`     | —            | `llama3.2`      |

You can also edit Mimi's personality (system prompt) there. Settings and the whole conversation are saved in `localStorage` — refresh and she remembers you.

## Project structure

```
mimi/
├── index.html      # the app
├── css/style.css   # styling
├── js/app.js       # chat logic + API client
└── README.md
```