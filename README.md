# ECHOES
AI Emotion Intelligence

# ECHOES 🌗

ECHOES is a local-first emotion analysis tool. Paste in a piece of text — a journal entry, a speech, a letter — and it uses a locally-running LLM (via [Ollama](https://ollama.com)) to break down the emotional content into a readable, visual report: an 8-axis emotion radar, sentiment, intensity, complexity, and a short written insight.

Everything runs on your machine. No API keys, no cloud calls, no data leaving your computer.

![sentiment](https://img.shields.io/badge/runs-100%25%20local-238636) ![python](https://img.shields.io/badge/backend-Flask-58a6ff) ![model](https://img.shields.io/badge/model-Ollama%20%2F%20llama3.2-c084fc)

## Features

- **Emotion breakdown** across 8 axes — joy, sadness, anger, fear, surprise, disgust, trust, anticipation — each scored 0–100
- **Radar chart** visualization of the full emotional profile (via Chart.js)
- **Sentiment, intensity & complexity** scoring at a glance
- **AI-generated insight** — a short psychological read on the emotional undercurrents of the text
- **Sample texts** included to try the tool instantly
- Clean, dark-mode UI with no external services or sign-up required

## How it works

```
Browser (index.html / app.js)
        │  POST /analyze { text }
        ▼
Flask server (server.py)
        │  prompts a local model
        ▼
Ollama (localhost:11434)
        │  returns structured JSON
        ▼
Rendered back to the UI as the emotion report
```

The Flask server sends your text to a locally running Ollama model with a prompt asking it to return a structured JSON object (emotion scores, dominant emotion, sentiment, intensity, complexity, and a short insight). The frontend renders that JSON into the radar chart, emotion cards, and meta stats.

## Requirements

- Python 3.8+
- [Ollama](https://ollama.com) installed and running locally
- The `llama3.2` model pulled in Ollama (or another model — see [Configuration](#configuration))

## Setup

1. **Install and start Ollama**, then pull the model used by default:

   ```bash
   ollama pull llama3.2
   ollama serve
   ```

2. **Clone this repo** and install Python dependencies:

   ```bash
   git clone <your-repo-url>
   cd ECHOES
   pip install flask flask-cors requests
   ```

3. **Run the server:**

   ```bash
   python server.py
   ```

4. Open **http://localhost:3000** in your browser.

## Usage

1. Paste or type text into the input box (or click one of the sample chips to load an example).
2. Click **Analyze**.
3. View the emotional breakdown, radar chart, sentiment/intensity/complexity scores, and written insight.

## Configuration

Model and Ollama endpoint are set at the top of `server.py`:

```python
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"
```

Swap `MODEL` for any model you have pulled in Ollama (e.g. `mistral`, `llama3.1`, `phi3`) to change analysis quality/speed.

## Project structure

```
.
├── index.html      # App shell / markup
├── style.css       # Dark-mode UI styling
├── app.js          # Frontend logic — rendering, charting, API calls
└── server.py       # Flask backend — proxies requests to Ollama
```

## Tech stack

- **Frontend:** vanilla JS, [Chart.js](https://www.chartjs.org/) for the radar chart, [Tabler Icons](https://tabler.io/icons)
- **Backend:** Flask + Flask-CORS
- **Model inference:** [Ollama](https://ollama.com), default model `llama3.2`

## Troubleshooting

- **"Cannot connect to Ollama"** — make sure `ollama serve` is running and the model in `MODEL` has been pulled.
- **"Analysis failed — is server.py running?"** — start the Flask server with `python server.py` and confirm it's listening on port 3000.
- **Slow responses** — larger models take longer; try a smaller model or ensure Ollama has adequate system resources.

## Privacy

All analysis happens locally through your own Ollama instance. No text you analyze is sent to any third-party API or external server.

## License

MIT — feel free to use, modify, and share.

