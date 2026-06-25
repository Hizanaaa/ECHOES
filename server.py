from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")

    prompt = f"""You are an expert emotion analysis AI trained on psychology and NLP.
Analyze the emotional content of the text below and return ONLY valid JSON — no preamble, no explanation, no markdown fences, just the raw JSON object.

Text:
\"\"\"{text}\"\"\"

Return exactly this JSON shape with no other text:
{{
  "emotions": {{
    "joy": <integer 0-100>,
    "sadness": <integer 0-100>,
    "anger": <integer 0-100>,
    "fear": <integer 0-100>,
    "surprise": <integer 0-100>,
    "disgust": <integer 0-100>,
    "trust": <integer 0-100>,
    "anticipation": <integer 0-100>
  }},
  "dominant": "<one of the eight emotion keys>",
  "sentiment": "<Positive|Negative|Mixed|Neutral>",
  "intensity": <integer 1-10>,
  "complexity": <integer 1-10>,
  "wordCount": <integer>,
  "insight": "<2-3 sentence psychological analysis of the emotional undercurrents, written in a thoughtful analytical tone>"
}}"""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        }, timeout=60)

        if not response.ok:
            return jsonify({"error": f"Ollama error: {response.status_code}"}), 500

        raw = response.json().get("response", "")
        parsed = json.loads(raw)
        return jsonify({"result": json.dumps(parsed)})

    except requests.exceptions.ConnectionError:
        return jsonify({
            "error": "Cannot connect to Ollama. Make sure it is running — open a terminal and run: ollama serve"
        }), 503
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Failed to parse model response: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("\n  ECHOES running at http://localhost:3000")
    print("  Make sure Ollama is running: ollama serve\n")
    app.run(port=3000, debug=True)