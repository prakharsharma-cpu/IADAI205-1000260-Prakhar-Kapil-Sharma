"""
╔══════════════════════════════════════════════════════════════╗
║          Cultural AI Travel — Streamlit Edition              ║
║   AI-powered cultural travel companion using Google Gemini   ║
╚══════════════════════════════════════════════════════════════╝
"""

import streamlit as st
import os, json, random, re, io, base64, calendar as cal_lib
from datetime import datetime, date, timedelta

# ─── Page Config (MUST be first Streamlit call) ──────────────
st.set_page_config(
    page_title="Cultural AI Travel",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={"About": "Cultural AI Travel — Powered by Google Gemini"},
)

# ─── Optional library imports (graceful degradation) ─────────
try:
    from google import genai
    from google.genai import types as genai_types
    GENAI_OK = True
except ImportError:
    GENAI_OK = False

try:
    from fpdf import FPDF
    FPDF_OK = True
except ImportError:
    FPDF_OK = False

try:
    from gtts import gTTS
    GTTS_OK = True
except ImportError:
    GTTS_OK = False

try:
    from PIL import Image
    PIL_OK = True
except ImportError:
    PIL_OK = False

try:
    import markdown as md_lib
    MD_OK = True
except ImportError:
    MD_OK = False

# ═══════════════════════════════════════════════════════════════
#  DARK THEME CSS
# ═══════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

/* ── Root variables ── */
:root {
    --bg-base:    #111318;
    --bg-card:    #1c1f28;
    --bg-card2:   #22263100;
    --accent:     #d4f870;
    --accent-dim: rgba(212,248,112,0.12);
    --border:     #2a2f3d;
    --text:       #f0f2f7;
    --muted:      #6b7280;
    --danger:     #ff5e6c;
    --info:       #60a5fa;
    --font:       'DM Sans', sans-serif;
}

/* ── Global resets ── */
html, body, [class*="css"] { font-family: var(--font) !important; }
.stApp { background: var(--bg-base) !important; }
.main .block-container { padding: 1.5rem 2rem 3rem !important; max-width: 1400px !important; }

/* ── Sidebar ── */
[data-testid="stSidebar"] {
    background: var(--bg-card) !important;
    border-right: 1px solid var(--border) !important;
}
[data-testid="stSidebar"] .stMarkdown p { color: var(--muted) !important; font-size: 0.72rem !important; letter-spacing: .12em !important; }

/* ── Inputs & selects ── */
.stTextInput > div > div > input,
.stTextArea > div > div > textarea,
.stSelectbox > div > div > div,
.stNumberInput > div > div > input {
    background: #0f1117 !important;
    border: 1px solid var(--border) !important;
    border-radius: 12px !important;
    color: var(--text) !important;
    font-family: var(--font) !important;
}
.stTextInput > div > div > input:focus,
.stTextArea > div > div > textarea:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 2px rgba(212,248,112,.2) !important;
}
.stMultiSelect span { background: var(--accent-dim) !important; color: var(--accent) !important; border-radius: 8px !important; }

/* ── Buttons ── */
.stButton > button {
    background: var(--accent) !important;
    color: #111318 !important;
    border: none !important;
    border-radius: 14px !important;
    font-weight: 700 !important;
    font-family: var(--font) !important;
    transition: all .2s ease !important;
}
.stButton > button:hover { filter: brightness(0.9) !important; transform: translateY(-1px) !important; }
.stButton > button[kind="secondary"] {
    background: var(--bg-card) !important;
    color: var(--text) !important;
    border: 1px solid var(--border) !important;
}
.stDownloadButton > button {
    background: var(--bg-card) !important;
    color: var(--text) !important;
    border: 1px solid var(--border) !important;
    border-radius: 14px !important;
    font-weight: 600 !important;
}

/* ── Tabs ── */
.stTabs [data-baseweb="tab-list"] { gap: 8px !important; background: transparent !important; border-bottom: 1px solid var(--border) !important; }
.stTabs [data-baseweb="tab"] {
    background: transparent !important;
    border-radius: 10px 10px 0 0 !important;
    color: var(--muted) !important;
    font-weight: 600 !important;
    padding: .5rem 1rem !important;
}
.stTabs [aria-selected="true"] { background: var(--accent-dim) !important; color: var(--accent) !important; border-bottom: 2px solid var(--accent) !important; }

/* ── Expanders ── */
.streamlit-expanderHeader { background: var(--bg-card) !important; border-radius: 12px !important; border: 1px solid var(--border) !important; color: var(--text) !important; }
.streamlit-expanderContent { background: #0f1117 !important; border: 1px solid var(--border) !important; border-top: none !important; border-radius: 0 0 12px 12px !important; }

/* ── Metric cards ── */
[data-testid="metric-container"] { background: var(--bg-card) !important; border-radius: 16px !important; border: 1px solid var(--border) !important; padding: 1rem !important; }
[data-testid="metric-container"] label { color: var(--muted) !important; }
[data-testid="metric-container"] [data-testid="stMetricValue"] { color: var(--accent) !important; }

/* ── Spinners & status ── */
.stSpinner > div { border-top-color: var(--accent) !important; }
[data-testid="stStatusWidget"] { color: var(--accent) !important; }

/* ── Checkboxes ── */
.stCheckbox > label { color: var(--text) !important; }

/* ── Sliders ── */
.stSlider [data-baseweb="slider"] div[role="slider"] { background: var(--accent) !important; }

/* ── Cards (custom) ── */
.ai-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 1.5rem;
    transition: border-color .2s, transform .2s;
}
.ai-card:hover { border-color: rgba(212,248,112,.4); transform: translateY(-2px); }

.dest-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: border-color .25s, transform .25s;
}
.dest-card:hover { border-color: var(--accent); transform: translateY(-3px); }

.day-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.25rem;
    margin-bottom: .75rem;
}

.tag {
    display: inline-block;
    background: var(--accent-dim);
    color: var(--accent);
    border-radius: 8px;
    padding: 2px 10px;
    font-size: .78rem;
    font-weight: 700;
    letter-spacing: .04em;
}
.tag-dark {
    display: inline-block;
    background: rgba(255,255,255,.06);
    color: var(--muted);
    border-radius: 8px;
    padding: 2px 10px;
    font-size: .75rem;
    font-weight: 600;
}
.section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text);
    margin-bottom: .2rem;
}
.section-sub { color: var(--muted); font-size: .9rem; margin-bottom: 1.5rem; }

.chat-user {
    display: flex; justify-content: flex-end; margin: .5rem 0;
}
.chat-bot {
    display: flex; justify-content: flex-start; margin: .5rem 0;
}
.bubble-user {
    background: var(--accent);
    color: #111318;
    border-radius: 18px 18px 4px 18px;
    padding: .75rem 1.1rem;
    max-width: 75%;
    font-weight: 500;
    font-size: .9rem;
    line-height: 1.5;
}
.bubble-bot {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 18px 18px 18px 4px;
    padding: .75rem 1.1rem;
    max-width: 75%;
    font-size: .9rem;
    line-height: 1.6;
}

.accent-btn {
    display: inline-flex; align-items: center; gap: .4rem;
    background: var(--accent); color: #111318;
    border: none; border-radius: 12px;
    padding: .55rem 1.3rem; font-weight: 700;
    font-size: .88rem; cursor: pointer;
    transition: filter .2s, transform .2s;
}
.accent-btn:hover { filter: brightness(.88); transform: translateY(-1px); }

.rating-star { color: #facc15; }
.unesco-badge {
    display: inline-block;
    background: #1d4ed8;
    color: white;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: .72rem;
    font-weight: 700;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 6px; }
::-webkit-scrollbar-thumb:hover { background: var(--muted); }
</style>
""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
#  DATA
# ═══════════════════════════════════════════════════════════════
DESTINATIONS = [
    {"id":"1","name":"Eiffel Tower","country":"France","continent":"Europe","type":"Historical","cost":150,"season":"Spring","rating":4.8,"visitors":7.0,"unesco":True,"img":"https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&q=80"},
    {"id":"2","name":"Colosseum","country":"Italy","continent":"Europe","type":"Historical","cost":120,"season":"Autumn","rating":4.7,"visitors":7.4,"unesco":True,"img":"https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80"},
    {"id":"3","name":"Machu Picchu","country":"Peru","continent":"South America","type":"Adventure","cost":90,"season":"Winter","rating":4.9,"visitors":1.5,"unesco":True,"img":"https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80"},
    {"id":"4","name":"Taj Mahal","country":"India","continent":"Asia","type":"Cultural","cost":50,"season":"Winter","rating":4.8,"visitors":6.5,"unesco":True,"img":"https://images.unsplash.com/photo-1564507592208-0270e940256e?w=600&q=80"},
    {"id":"5","name":"Great Wall","country":"China","continent":"Asia","type":"Historical","cost":80,"season":"Autumn","rating":4.6,"visitors":10.0,"unesco":True,"img":"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80"},
    {"id":"6","name":"Santorini","country":"Greece","continent":"Europe","type":"Scenic","cost":200,"season":"Summer","rating":4.7,"visitors":2.0,"unesco":False,"img":"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80"},
    {"id":"7","name":"Kyoto","country":"Japan","continent":"Asia","type":"Cultural","cost":110,"season":"Spring","rating":4.9,"visitors":5.0,"unesco":True,"img":"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80"},
    {"id":"8","name":"Petra","country":"Jordan","continent":"Asia","type":"Historical","cost":70,"season":"Spring","rating":4.8,"visitors":1.2,"unesco":True,"img":"https://images.unsplash.com/photo-1548018560-c76e9d0b669e?w=600&q=80"},
    {"id":"9","name":"Angkor Wat","country":"Cambodia","continent":"Asia","type":"Cultural","cost":45,"season":"Winter","rating":4.7,"visitors":2.6,"unesco":True,"img":"https://images.unsplash.com/photo-1537601655038-77f63b3e46df?w=600&q=80"},
    {"id":"10","name":"Machu Picchu","country":"Peru","continent":"South America","type":"Nature","cost":90,"season":"Spring","rating":4.9,"visitors":1.5,"unesco":True,"img":"https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80"},
    {"id":"11","name":"Dubrovnik","country":"Croatia","continent":"Europe","type":"Scenic","cost":130,"season":"Summer","rating":4.6,"visitors":1.8,"unesco":True,"img":"https://images.unsplash.com/photo-1555990539-e6b68de44a67?w=600&q=80"},
    {"id":"12","name":"Marrakech","country":"Morocco","continent":"Africa","type":"Cultural","cost":60,"season":"Spring","rating":4.5,"visitors":1.9,"unesco":True,"img":"https://images.unsplash.com/photo-1539020140153-e479b8e97aec?w=600&q=80"},
    {"id":"13","name":"Bali","country":"Indonesia","continent":"Asia","type":"Nature","cost":55,"season":"Summer","rating":4.7,"visitors":6.3,"unesco":False,"img":"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80"},
    {"id":"14","name":"Prague","country":"Czech Republic","continent":"Europe","type":"Historical","cost":85,"season":"Autumn","rating":4.6,"visitors":7.9,"unesco":True,"img":"https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80"},
    {"id":"15","name":"Rio de Janeiro","country":"Brazil","continent":"South America","type":"Scenic","cost":100,"season":"Summer","rating":4.5,"visitors":3.5,"unesco":False,"img":"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80"},
]

CITIES = [
    "Tokyo","Paris","Rome","Barcelona","Istanbul","Cairo","Mumbai","Bangkok",
    "Kyoto","Lisbon","Prague","Dubrovnik","Cusco","Marrakech","Seoul","Havana",
    "Budapest","Athens","Bali","Petra","Vienna","Amsterdam","Edinburgh","Nairobi",
    "Reykjavik","Cartagena","Luang Prabang","Hoi An","Tbilisi","Oaxaca",
]

LANG_MAP = {
    "French":"fr","Spanish":"es","Japanese":"ja","Hindi":"hi",
    "German":"de","Italian":"it","Korean":"ko","Portuguese":"pt",
    "Arabic":"ar","Mandarin":"zh-CN",
}

ARIA_SYSTEM = """You are "Aria," a world-class cultural historian and passionate travel explorer for Cultural AI.
Your personality is engaging, evocative, and deeply knowledgeable about the world's diverse heritage.

Guidelines:
1. **Cultural Storyteller:** Share fascinating historical anecdotes and the "why" behind local traditions.
2. **Nuanced Etiquette:** Explain subtle social cues like Japanese 'Omotenashi' or Danish 'Hygge'.
3. **Engaging Tone:** Be enthusiastic, warm, sophisticated, and descriptive.
4. **Multilingual Adaptability:** Occasionally weave in beautiful untranslatable local words with their meanings.
5. **Practical Expert:** Include hidden gems, seasonal nuances, and realistic budget advice.
6. **Formatting:** Use bold, bullet points, and clear sections for readability.
Always be helpful, accurate, and inspiring about travel and culture."""


# ═══════════════════════════════════════════════════════════════
#  SESSION STATE
# ═══════════════════════════════════════════════════════════════
def init_state():
    defaults = {
        "user_name": None,
        "view": "dashboard",
        "search": "",
        # Itinerary
        "itinerary": [],
        "itinerary_dest": "",
        "itinerary_suggestion": "",
        "itinerary_image": None,
        "saved_trips": [],
        # Toolbox
        "toolbox": {},
        # Chat
        "chat": [{"id":"welcome","sender":"bot",
                  "text":"✈️ Hello! I am **Aria**, your Cultural AI companion. Ask me anything about destinations, culture, etiquette, or travel planning!"}],
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

init_state()


# ═══════════════════════════════════════════════════════════════
#  GEMINI CLIENT
#  Key is loaded exclusively from:
#    1. st.secrets["GEMINI_API_KEY"]  (secrets.toml in .streamlit/)
#    2. GEMINI_API_KEY environment variable (fallback for local dev)
#
#  secrets.toml example (.streamlit/secrets.toml):
#    GEMINI_API_KEY = "AIzaSy..."
# ═══════════════════════════════════════════════════════════════
@st.cache_resource(show_spinner=False)
def get_client():
    """Return a configured Gemini client or None.

    Resolution order:
      1. st.secrets["GEMINI_API_KEY"]
      2. GEMINI_API_KEY environment variable
    """
    if not GENAI_OK:
        return None

    key = None

    # 1. Streamlit secrets (secrets.toml / Streamlit Cloud secret manager)
    try:
        key = st.secrets.get("GEMINI_API_KEY") or st.secrets.get("gemini_api_key")
    except Exception:
        pass

    # 2. Environment variable fallback (useful for local dev without secrets.toml)
    if not key:
        key = os.environ.get("GEMINI_API_KEY", "").strip()

    if not key:
        return None

    try:
        return genai.Client(api_key=key)
    except Exception:
        return None


def _call(model: str, prompt: str | list, system: str = None,
          json_out: bool = False, temp: float = 0.8) -> str | None:
    """Generic Gemini text call. Returns response text or None."""
    client = get_client()
    if not client:
        return None
    cfg_kwargs = {"temperature": temp}
    if system:
        cfg_kwargs["system_instruction"] = system
    if json_out:
        cfg_kwargs["response_mime_type"] = "application/json"
    cfg = genai_types.GenerateContentConfig(**cfg_kwargs)
    try:
        resp = client.models.generate_content(model=model, contents=prompt, config=cfg)
        return resp.text
    except Exception as e:
        st.warning(f"Gemini error: {e}")
        return None


# ═══════════════════════════════════════════════════════════════
#  AI FUNCTIONS
# ═══════════════════════════════════════════════════════════════
def ai_weather_suggestion(city: str, temp: int, cond: str) -> str:
    r = _call("gemini-2.0-flash",
              f"City: {city}, Temp: {temp}°C, Condition: {cond}. "
              f"Give 1-2 sentence activity suggestion for a traveler.",
              temp=0.6)
    return r or f"Enjoy your trip to {city}! Current weather: {temp}°C, {cond}."


def ai_generate_itinerary(prefs: dict, days: int) -> list:
    prompt = (
        f"Generate a detailed {days}-day cultural travel itinerary for: {json.dumps(prefs)}. "
        "Return ONLY a valid JSON array (no markdown fences) with exactly this structure per item:\n"
        '[{"day":1,"title":"...","description":"...","location":"...","weather":"..."}]\n'
        f"Generate exactly {days} objects."
    )
    raw = _call("gemini-2.0-flash", prompt, json_out=True, temp=0.85)
    if not raw:
        return []
    try:
        clean = re.sub(r"```json|```", "", raw).strip()
        return json.loads(clean)
    except Exception:
        return []


def ai_refine_itinerary(plan: list, request: str) -> list:
    prompt = (
        f"Current itinerary (JSON): {json.dumps(plan)}\n"
        f"User request: \"{request}\"\n"
        "Modify the itinerary based on the request, keeping the same JSON structure. "
        "Return ONLY the updated JSON array, no markdown."
    )
    raw = _call("gemini-2.0-flash", prompt, json_out=True, temp=0.75)
    if not raw:
        return plan
    try:
        clean = re.sub(r"```json|```", "", raw).strip()
        return json.loads(clean)
    except Exception:
        return plan


def ai_translate(text: str, lang: str) -> str:
    r = _call("gemini-2.0-flash",
              f"Translate to {lang}: \"{text}\". Return only the translation.")
    return r or text


def ai_translate_itinerary(plan: list, lang: str) -> list:
    out = []
    for day in plan:
        t = ai_translate(day["title"], lang)
        d = ai_translate(day["description"], lang)
        out.append({**day, "title": t, "description": d})
    return out


def ai_chatbot(message: str, history: list) -> str:
    client = get_client()
    if not client:
        return "⚙️ The Gemini API key is not configured. Please add it to `.streamlit/secrets.toml`."
    raw_history = []
    for m in history:
        if m.get("sender") == "user":
            raw_history.append({"role": "user", "parts": [{"text": m["text"]}]})
        elif m.get("sender") == "bot" and m.get("id") != "welcome":
            raw_history.append({"role": "model", "parts": [{"text": m["text"]}]})
    try:
        chat = client.chats.create(
            model="gemini-2.0-flash",
            history=raw_history,
            config=genai_types.GenerateContentConfig(
                system_instruction=ARIA_SYSTEM,
                temperature=0.82,
            ),
        )
        r = chat.send_message(message)
        return r.text or "I couldn't process that. Please try again."
    except Exception as e:
        return f"⚠️ Error: {e}"


def ai_packing_list(dest: str, days: int, season: str, interests: list) -> list:
    prompt = (
        f"Smart packing list for {days}-day trip to {dest} in {season}. "
        f"Interests: {', '.join(interests)}. "
        "Return ONLY a JSON array of strings (no markdown). ~25-35 items."
    )
    raw = _call("gemini-2.0-flash", prompt, json_out=True, temp=0.7)
    if not raw:
        return []
    try:
        return json.loads(re.sub(r"```json|```", "", raw).strip())
    except Exception:
        return []


def ai_etiquette(dest: str) -> str:
    r = _call("gemini-2.0-flash",
              f"Local etiquette, tipping culture, and 5 essential phrases for {dest}. Use markdown.",
              system="You are a global etiquette expert.", temp=0.6)
    return r or "No data available."


def ai_budget(dest: str, days: int, level: str) -> str:
    r = _call("gemini-2.0-flash",
              f"Detailed budget estimate: {days}-day trip to {dest}, {level} traveler. "
              "Break down by Accommodation, Food, Transport, Activities. "
              "Include local currency and USD. Use markdown table format.",
              system="You are a travel finance expert.", temp=0.6)
    return r or "Budget data unavailable."


def ai_phrasebook(dest: str) -> str:
    r = _call("gemini-2.0-flash",
              f"Travel phrasebook for {dest}. Categories: Greetings, Dining, Emergency, Shopping. "
              "Show English | Local | Phonetic columns. Use markdown table.",
              system="You are a professional linguist and travel guide.", temp=0.6)
    return r or "Phrasebook unavailable."


def ai_safety(dest: str) -> str:
    r = _call("gemini-2.0-flash",
              f"Essential safety & health tips for travelers visiting {dest}. "
              "Include: common scams, safe/unsafe areas, water safety, emergency numbers, vaccinations. Markdown.",
              system="You are a global travel safety consultant.", temp=0.6)
    return r or "Safety data unavailable."


def ai_hidden_gems(dest: str) -> str:
    r = _call("gemini-2.0-flash",
              f"5 hidden gems in {dest} not in major guidebooks. "
              "For each: name, why it's special, how to get there. Markdown format.",
              system="You are a local insider and travel explorer.", temp=0.75)
    return r or "Hidden gems unavailable."


def ai_journal_expand(notes: str, dest: str) -> str:
    r = _call("gemini-2.0-flash",
              f"I visited {dest}. Raw notes: \"{notes}\". "
              "Expand into a beautiful 200-300 word travel journal entry. Evocative, descriptive language.",
              system="You are a professional travel writer.", temp=0.9)
    return r or "Could not expand your journal."


def ai_generate_image(prompt: str, aspect_ratio: str = "16:9") -> bytes | None:
    """Try to generate an image using Imagen. Returns raw bytes or None."""
    client = get_client()
    if not client:
        return None
    try:
        resp = client.models.generate_images(
            model="imagen-3.0-generate-001",
            prompt=prompt,
            config=genai_types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio=aspect_ratio,
            ),
        )
        if resp.generated_images:
            return resp.generated_images[0].image.image_bytes
    except Exception:
        pass
    return None


def ai_analyze_image(img_bytes: bytes, mime: str, user_prompt: str) -> str:
    client = get_client()
    if not client:
        return "Please configure your Gemini API key in `.streamlit/secrets.toml`."
    try:
        img_part = genai_types.Part.from_bytes(data=img_bytes, mime_type=mime)
        resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[img_part, user_prompt],
            config=genai_types.GenerateContentConfig(
                system_instruction=(
                    "You are a cultural expert. Analyze the provided image and answer the user's "
                    "question with deep cultural, historical, or practical travel insights."
                )
            ),
        )
        return resp.text or "Could not analyze the image."
    except Exception as e:
        return f"Error: {e}"


def ai_generate_video(prompt: str) -> str | None:
    """Generate a trip video using Veo. Returns video URL or None."""
    client = get_client()
    if not client:
        return None
    import time
    try:
        op = client.models.generate_videos(
            model="veo-2.0-generate-001",
            prompt=prompt,
            config=genai_types.GenerateVideosConfig(
                number_of_videos=1,
                duration_seconds=5,
                aspect_ratio="16:9",
            ),
        )
        for _ in range(30):
            if op.done:
                break
            time.sleep(10)
            op = client.operations.get_videos_operation(operation=op)
        if op.response and op.response.generated_videos:
            return op.response.generated_videos[0].video.uri
    except Exception as e:
        st.error(f"Video generation error: {e}")
    return None


# ═══════════════════════════════════════════════════════════════
#  UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════
def make_pdf(itinerary: list, destination: str) -> bytes | None:
    if not FPDF_OK:
        return None
    try:
        class TripPDF(FPDF):
            def header(self):
                self.set_fill_color(212, 248, 112)
                self.rect(0, 0, 210, 18, "F")
                self.set_font("Helvetica", "B", 13)
                self.set_text_color(17, 19, 24)
                self.cell(0, 18, "  ✈ Cultural AI Travel Itinerary", ln=True)
            def footer(self):
                self.set_y(-12)
                self.set_font("Helvetica", "I", 8)
                self.set_text_color(120, 120, 120)
                self.cell(0, 10, f"Generated by Cultural AI Travel  •  Page {self.page_no()}", align="C")

        pdf = TripPDF()
        pdf.set_auto_page_break(auto=True, margin=18)
        pdf.add_page()
        pdf.ln(8)

        pdf.set_font("Helvetica", "B", 22)
        pdf.set_text_color(17, 19, 24)
        pdf.cell(0, 12, destination, ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(100, 110, 130)
        pdf.cell(0, 8, f"{len(itinerary)}-Day Cultural Experience  •  {datetime.now().strftime('%B %Y')}", ln=True)
        pdf.ln(6)

        for day in itinerary:
            pdf.set_fill_color(28, 31, 40)
            pdf.set_draw_color(42, 47, 61)
            pdf.set_font("Helvetica", "B", 12)
            pdf.set_text_color(212, 248, 112)
            pdf.cell(0, 9, f"Day {day.get('day','')}  —  {day.get('title','')}", ln=True, fill=True)
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(200, 205, 215)
            pdf.multi_cell(0, 6, day.get("description", ""), align="L")
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(107, 114, 128)
            meta = f"  📍 {day.get('location','')}   ☁ {day.get('weather','')}"
            pdf.cell(0, 7, meta, ln=True)
            pdf.ln(4)

        return bytes(pdf.output())
    except Exception as e:
        st.warning(f"PDF error: {e}")
        return None


def make_tts(text: str, lang_code: str = "en") -> bytes | None:
    if not GTTS_OK:
        return None
    try:
        clean = re.sub(r"[#*_`\[\]()>]", "", text)
        clean = re.sub(r"\n+", " ", clean)[:800]
        tts = gTTS(text=clean, lang=lang_code, slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        return buf.getvalue()
    except Exception as e:
        st.warning(f"TTS error: {e}")
        return None


def md_render(text: str):
    """Render markdown text as HTML in Streamlit."""
    if MD_OK:
        html = md_lib.markdown(text, extensions=["tables", "nl2br"])
    else:
        html = text.replace("\n", "<br>")
    st.markdown(f"""
    <div style='color:#d1d5db;line-height:1.7;font-size:.9rem;
                padding:1rem;background:#0f1117;border-radius:12px;
                border:1px solid #2a2f3d;'>
        {html}
    </div>
    """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
#  SIDEBAR
# ═══════════════════════════════════════════════════════════════
def sidebar():
    with st.sidebar:
        st.markdown("""
        <div style='text-align:center;padding:1rem 0 1.5rem;'>
            <div style='font-size:2.2rem;font-weight:900;color:#d4f870;
                        font-family:"Playfair Display",serif;letter-spacing:-.02em;'>
                Cultural AI
            </div>
            <div style='color:#6b7280;font-size:.78rem;letter-spacing:.15em;margin-top:.2rem;'>
                TRAVEL COMPANION
            </div>
        </div>
        """, unsafe_allow_html=True)

        # ── API status indicator (read-only, no key input) ──
        if get_client():
            st.markdown("""
            <div style='display:flex;align-items:center;gap:.6rem;
                        background:rgba(212,248,112,.08);border:1px solid rgba(212,248,112,.25);
                        border-radius:12px;padding:.55rem .9rem;margin-bottom:1rem;'>
                <div style='width:8px;height:8px;background:#d4f870;border-radius:50%;flex-shrink:0;'></div>
                <div style='color:#d4f870;font-size:.78rem;font-weight:600;'>Gemini AI Connected</div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div style='display:flex;align-items:center;gap:.6rem;
                        background:rgba(255,94,108,.08);border:1px solid rgba(255,94,108,.25);
                        border-radius:12px;padding:.55rem .9rem;margin-bottom:1rem;'>
                <div style='width:8px;height:8px;background:#ff5e6c;border-radius:50%;flex-shrink:0;'></div>
                <div style='color:#ff5e6c;font-size:.78rem;font-weight:600;'>Gemini not configured</div>
            </div>
            """, unsafe_allow_html=True)
            st.caption("Add `GEMINI_API_KEY` to `.streamlit/secrets.toml`")

        st.markdown("---")

        # Username
        if not st.session_state.user_name:
            name = st.text_input("👤 Your Name", placeholder="Enter your name…")
            if name:
                st.session_state.user_name = name
                st.rerun()
        else:
            st.markdown(f"""
            <div style='display:flex;align-items:center;gap:.7rem;
                        background:#1c1f28;border-radius:14px;padding:.75rem 1rem;
                        border:1px solid #2a2f3d;margin-bottom:1rem;'>
                <div style='width:38px;height:38px;background:#d4f870;border-radius:50%;
                            display:flex;align-items:center;justify-content:center;
                            font-weight:800;color:#111318;font-size:.95rem;'>
                    {st.session_state.user_name[0].upper()}
                </div>
                <div>
                    <div style='color:#f0f2f7;font-weight:700;font-size:.9rem;'>
                        {st.session_state.user_name}
                    </div>
                    <div style='color:#6b7280;font-size:.74rem;'>Traveler Pro</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<p style='margin-bottom:.4rem;'>NAVIGATION</p>", unsafe_allow_html=True)

        pages = [
            ("🏠", "dashboard",        "Dashboard"),
            ("🗓️", "itinerary",        "Trip Planner"),
            ("🌍", "recommendations",  "Discover"),
            ("🧰", "toolbox",          "Travel Toolbox"),
            ("🤖", "chatbot",          "AI Assistant"),
            ("🎬", "video",            "Trip Video"),
            ("📸", "vision",           "Photo Analyzer"),
            ("📔", "journal",          "Travel Journal"),
        ]
        for icon, key, label in pages:
            active = st.session_state.view == key
            if st.button(f"{icon}  {label}", key=f"nav_{key}",
                         use_container_width=True):
                st.session_state.view = key
                st.rerun()

        st.markdown("---")
        st.markdown(f"""
        <div style='color:#4b5563;font-size:.72rem;text-align:center;padding:.5rem 0;'>
            Cultural AI Travel v2.0<br>Powered by Google Gemini
        </div>
        """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
#  PAGE: DASHBOARD
# ═══════════════════════════════════════════════════════════════
def page_dashboard():
    name = st.session_state.user_name or "Traveler"
    fname = name.split()[0]

    # Header
    c1, c2 = st.columns([3, 1])
    with c1:
        st.markdown(f"""
        <div style='margin-bottom:1.5rem;'>
            <div style='font-family:"Playfair Display",serif;font-size:2.5rem;
                        font-weight:800;color:#f0f2f7;line-height:1.1;'>
                Hello, {fname}! 🌏
            </div>
            <div style='color:#6b7280;font-size:1rem;margin-top:.4rem;'>
                Where will your curiosity take you today?
            </div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        if st.button("✈️  Plan New Trip", use_container_width=True):
            st.session_state.view = "itinerary"
            st.rerun()

    # Stats row
    total_saved = len(st.session_state.saved_trips)
    dests_count = len(DESTINATIONS)
    s1, s2, s3, s4 = st.columns(4)
    with s1:
        st.metric("Destinations", dests_count, "Curated")
    with s2:
        st.metric("Saved Trips", total_saved, "Your Plans")
    with s3:
        st.metric("AI Tools", "8", "Available")
    with s4:
        today = datetime.now()
        st.metric("Today", today.strftime("%b %d"), today.strftime("%A"))

    st.markdown("---")

    # AI Suite cards
    st.markdown("<div class='section-title'>Your AI Travel Suite</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-sub'>Powerful AI tools to plan your perfect cultural journey</div>", unsafe_allow_html=True)

    tools = [
        ("🗓️", "Smart Itinerary", "AI-crafted multi-day personalized plans", "itinerary"),
        ("🧰", "Travel Toolbox", "Packing, Etiquette, Budget & more", "toolbox"),
        ("🤖", "Aria Chatbot", "Your 24/7 cultural travel expert", "chatbot"),
        ("🎬", "Trip Video", "Generate cinematic trip memories with Veo AI", "video"),
    ]
    cols = st.columns(4)
    for col, (icon, title, sub, view) in zip(cols, tools):
        with col:
            st.markdown(f"""
            <div class='ai-card' style='cursor:pointer;min-height:140px;'>
                <div style='font-size:2rem;margin-bottom:.7rem;'>{icon}</div>
                <div style='font-weight:700;color:#f0f2f7;font-size:1rem;margin-bottom:.3rem;'>{title}</div>
                <div style='color:#6b7280;font-size:.82rem;line-height:1.4;'>{sub}</div>
            </div>
            """, unsafe_allow_html=True)
            if st.button("Get Started →", key=f"suite_{view}", use_container_width=True):
                st.session_state.view = view
                st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # Top Destinations
    st.markdown("<div class='section-title'>Top Cultural Destinations</div>", unsafe_allow_html=True)
    top3 = DESTINATIONS[:3]
    d1, d2, d3 = st.columns(3)
    for col, dest in zip([d1, d2, d3], top3):
        with col:
            badge = '<span class="unesco-badge">UNESCO</span>' if dest["unesco"] else ""
            st.markdown(f"""
            <div class='dest-card'>
                <div style='position:relative;overflow:hidden;height:180px;'>
                    <img src='{dest["img"]}' style='width:100%;height:100%;object-fit:cover;'/>
                    <div style='position:absolute;top:10px;left:10px;'>{badge}</div>
                    <div style='position:absolute;bottom:10px;right:10px;
                                background:rgba(0,0,0,.65);border-radius:8px;
                                padding:3px 8px;font-size:.78rem;color:#facc15;'>
                        ⭐ {dest["rating"]}
                    </div>
                </div>
                <div style='padding:1rem;'>
                    <div style='font-weight:700;color:#f0f2f7;font-size:1.05rem;margin-bottom:.3rem;'>{dest["name"]}</div>
                    <div style='color:#6b7280;font-size:.82rem;margin-bottom:.6rem;'>📍 {dest["country"]}, {dest["continent"]}</div>
                    <div style='display:flex;justify-content:space-between;align-items:center;'>
                        <span class='tag-dark'>{dest["type"]}</span>
                        <span class='tag'>Best: {dest["season"]}</span>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Popular grid
    st.markdown("<div class='section-title'>Most Popular</div>", unsafe_allow_html=True)
    pop = DESTINATIONS[3:7]
    p1, p2 = st.columns(2)
    for i, dest in enumerate(pop):
        col = p1 if i % 2 == 0 else p2
        with col:
            badge = "🏛️ UNESCO" if dest["unesco"] else ""
            st.markdown(f"""
            <div class='ai-card' style='display:flex;gap:1rem;align-items:center;padding:1rem;margin-bottom:.75rem;'>
                <img src='{dest["img"]}' style='width:80px;height:80px;border-radius:12px;object-fit:cover;flex-shrink:0;'/>
                <div>
                    <div style='font-weight:700;color:#f0f2f7;font-size:.95rem;'>{dest["name"]}</div>
                    <div style='color:#6b7280;font-size:.8rem;margin:.2rem 0;'>📍 {dest["country"]} · {badge}</div>
                    <span class='tag' style='font-size:.74rem;'>{dest["type"]}</span>
                </div>
                <div style='margin-left:auto;text-align:right;'>
                    <div style='color:#facc15;font-size:.82rem;'>⭐ {dest["rating"]}</div>
                    <div style='color:#6b7280;font-size:.75rem;'>${dest["cost"]}/day</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

    # Saved trips
    if st.session_state.saved_trips:
        st.markdown("---")
        st.markdown("<div class='section-title'>Your Saved Trips</div>", unsafe_allow_html=True)
        for trip in st.session_state.saved_trips[-3:]:
            st.markdown(f"""
            <div class='ai-card' style='display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;'>
                <div style='width:44px;height:44px;background:rgba(212,248,112,.15);border-radius:12px;
                            display:flex;align-items:center;justify-content:center;font-size:1.3rem;'>
                    📍
                </div>
                <div>
                    <div style='font-weight:700;color:#f0f2f7;'>{trip.get("destination","—")}</div>
                    <div style='color:#6b7280;font-size:.8rem;'>{trip.get("duration",0)}-day plan · {trip.get("date","")}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
#  PAGE: ITINERARY GENERATOR
# ═══════════════════════════════════════════════════════════════
def page_itinerary():
    st.markdown("<div class='section-title'>✈️ Smart Itinerary Generator</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-sub'>Set your preferences and generate a personalized AI itinerary</div>", unsafe_allow_html=True)

    with st.container():
        st.markdown("<div class='ai-card'>", unsafe_allow_html=True)

        c1, c2, c3 = st.columns([3, 1, 1])
        with c1:
            dest = st.text_input("🌍 Destination (leave empty for AI pick)",
                                 placeholder="e.g. Kyoto, Japan")
        with c2:
            duration = st.number_input("📅 Days", min_value=1, max_value=30, value=5)
        with c3:
            age = st.number_input("👤 Your Age", min_value=10, max_value=99, value=30)

        c4, c5, c6 = st.columns(3)
        with c4:
            budget = st.selectbox("💰 Budget", ["Budget", "Mid-range", "Luxury"])
        with c5:
            season = st.selectbox("🌤️ Season", ["Spring", "Summer", "Autumn", "Winter"])
        with c6:
            lang = st.selectbox("🌐 Itinerary Language", ["English"] + list(LANG_MAP.keys()))

        st.markdown("**🎯 Interests**")
        interest_opts = ["Culture", "Nature", "Adventure", "History", "Art", "Cuisine", "Architecture", "Wellness"]
        sel_interests = []
        cols_i = st.columns(8)
        for i, opt in enumerate(interest_opts):
            with cols_i[i]:
                if st.checkbox(opt, key=f"int_{opt}", value=opt in ["Culture", "Cuisine"]):
                    sel_interests.append(opt)

        access = st.checkbox("♿ Require Accessibility Features")
        st.markdown("</div>", unsafe_allow_html=True)

    gen_col, _ = st.columns([1, 2])
    with gen_col:
        gen_btn = st.button("🪄  Generate Smart Itinerary", use_container_width=True)

    if gen_btn:
        target = dest.strip() or random.choice(CITIES)
        prefs = {
            "destination": target, "age": age, "interests": sel_interests,
            "duration": duration, "budget": budget, "season": season,
            "accessibility": access,
        }
        temp_val = random.randint(15, 32)
        cond_val = random.choice(["sunny", "partly cloudy", "clear skies", "light breeze"])

        with st.spinner("🧠 Aria is crafting your perfect itinerary…"):
            suggestion = ai_weather_suggestion(target, temp_val, cond_val)
            plan = ai_generate_itinerary(prefs, duration)

        if lang != "English" and plan:
            with st.spinner(f"🌐 Translating to {lang}…"):
                plan = ai_translate_itinerary(plan, lang)

        if plan:
            img_bytes = None
            with st.spinner("🎨 Generating destination image…"):
                img_bytes = ai_generate_image(
                    f"Beautiful cinematic photo of {target}, cultural travel, golden hour", "16:9")

            st.session_state.itinerary = plan
            st.session_state.itinerary_dest = target
            st.session_state.itinerary_suggestion = suggestion
            st.session_state.itinerary_image = img_bytes

            st.session_state.saved_trips.append({
                "destination": target, "duration": duration,
                "date": datetime.now().strftime("%b %d, %Y"), "plan": plan,
            })
            st.success(f"✅ {duration}-day itinerary for {target} generated!")
        else:
            st.error("Could not generate itinerary. Check your API key configuration.")

    if st.session_state.itinerary:
        plan = st.session_state.itinerary
        target = st.session_state.itinerary_dest

        if st.session_state.itinerary_suggestion:
            st.info(f"💡 **AI Suggestion:** {st.session_state.itinerary_suggestion}")

        if st.session_state.itinerary_image:
            img = Image.open(io.BytesIO(st.session_state.itinerary_image))
            st.image(img, use_container_width=True, caption=f"📸 {target}")
        else:
            match = next((d for d in DESTINATIONS if d["name"].lower() in target.lower()), None)
            if match:
                st.markdown(f"""
                <img src='{match["img"]}' style='width:100%;border-radius:16px;max-height:300px;object-fit:cover;margin-bottom:1rem;'/>
                """, unsafe_allow_html=True)

        st.markdown("---")

        ctrl1, ctrl2, ctrl3 = st.columns([2, 1, 1])
        with ctrl1:
            st.markdown(f"### 🗓️ {target} — {len(plan)}-Day Itinerary")
        with ctrl2:
            if FPDF_OK:
                pdf_bytes = make_pdf(plan, target)
                if pdf_bytes:
                    st.download_button("📄 Export PDF", data=pdf_bytes,
                                       file_name=f"Cultural_AI_{target.replace(' ','_')}.pdf",
                                       mime="application/pdf", use_container_width=True)
            else:
                st.caption("Install fpdf2 for PDF export")
        with ctrl3:
            json_str = json.dumps(plan, indent=2, ensure_ascii=False)
            st.download_button("📋 Export JSON", data=json_str,
                               file_name=f"itinerary_{target.replace(' ','_')}.json",
                               mime="application/json", use_container_width=True)

        with st.expander("✏️ Refine Your Itinerary"):
            ref_col1, ref_col2 = st.columns([4, 1])
            with ref_col1:
                ref_req = st.text_input("Refinement request",
                                        placeholder="e.g. 'Make it more budget-friendly' or 'Add art galleries'")
            with ref_col2:
                st.markdown("<br>", unsafe_allow_html=True)
                if st.button("✨ Refine", use_container_width=True):
                    if ref_req:
                        with st.spinner("Refining…"):
                            updated = ai_refine_itinerary(plan, ref_req)
                        if updated:
                            st.session_state.itinerary = updated
                            st.success("Itinerary refined!")
                            st.rerun()

        st.markdown("<br>", unsafe_allow_html=True)
        for day in plan:
            weather_icon = "☀️" if "sun" in str(day.get("weather","")).lower() else "⛅"
            st.markdown(f"""
            <div class='day-card'>
                <div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.6rem;'>
                    <div>
                        <span class='tag' style='margin-bottom:.4rem;display:inline-block;'>Day {day.get("day","")}</span>
                        <div style='font-weight:700;color:#f0f2f7;font-size:1.1rem;margin-top:.3rem;'>
                            {day.get("title","")}
                        </div>
                    </div>
                    <div style='text-align:right;font-size:.82rem;color:#6b7280;'>
                        <div>📍 {day.get("location","")}</div>
                        <div>{weather_icon} {day.get("weather","")}</div>
                    </div>
                </div>
                <div style='color:#d1d5db;line-height:1.65;font-size:.9rem;'>
                    {day.get("description","")}
                </div>
            </div>
            """, unsafe_allow_html=True)

    if st.session_state.saved_trips:
        with st.expander(f"📂 Saved Trips ({len(st.session_state.saved_trips)})"):
            for trip in reversed(st.session_state.saved_trips):
                if st.button(f"📍 {trip['destination']} — {trip['duration']} days  ({trip['date']})",
                             key=f"load_{trip['date']}_{trip['destination']}", use_container_width=True):
                    st.session_state.itinerary = trip["plan"]
                    st.session_state.itinerary_dest = trip["destination"]
                    st.session_state.itinerary_suggestion = ""
                    st.session_state.itinerary_image = None
                    st.rerun()


# ═══════════════════════════════════════════════════════════════
#  PAGE: SMART RECOMMENDATIONS
# ═══════════════════════════════════════════════════════════════
def page_recommendations():
    st.markdown("<div class='section-title'>🌍 Discover Destinations</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-sub'>Explore curated cultural destinations around the world</div>", unsafe_allow_html=True)

    fc1, fc2, fc3, fc4 = st.columns([3, 1, 1, 1])
    with fc1:
        search = st.text_input("🔍 Search", value=st.session_state.search,
                               placeholder="Search by name, country, type…")
        st.session_state.search = search
    with fc2:
        cont_filter = st.selectbox("Continent", ["All", "Europe", "Asia", "Africa", "South America", "North America", "Oceania"])
    with fc3:
        type_filter = st.selectbox("Type", ["All", "Historical", "Cultural", "Nature", "Scenic", "Adventure"])
    with fc4:
        unesco_only = st.checkbox("UNESCO only")

    results = DESTINATIONS
    if search:
        q = search.lower()
        results = [d for d in results if q in d["name"].lower() or q in d["country"].lower()
                   or q in d["continent"].lower() or q in d["type"].lower()]
    if cont_filter != "All":
        results = [d for d in results if d["continent"] == cont_filter]
    if type_filter != "All":
        results = [d for d in results if d["type"] == type_filter]
    if unesco_only:
        results = [d for d in results if d["unesco"]]

    st.markdown(f"<div style='color:#6b7280;font-size:.85rem;margin-bottom:1rem;'>{len(results)} destinations found</div>",
                unsafe_allow_html=True)

    if not results:
        st.markdown("""
        <div style='text-align:center;padding:3rem;background:#1c1f28;border-radius:20px;border:1px dashed #2a2f3d;'>
            <div style='font-size:2.5rem;margin-bottom:.5rem;'>🔍</div>
            <div style='color:#f0f2f7;font-weight:600;'>No destinations match your search</div>
        </div>
        """, unsafe_allow_html=True)
        return

    cols = st.columns(3)
    for i, dest in enumerate(results):
        with cols[i % 3]:
            badge = '<span class="unesco-badge">UNESCO</span>' if dest["unesco"] else ""
            fav_key = f"fav_{dest['id']}"
            if fav_key not in st.session_state:
                st.session_state[fav_key] = False

            st.markdown(f"""
            <div class='dest-card' style='margin-bottom:1.25rem;'>
                <div style='position:relative;overflow:hidden;height:180px;'>
                    <img src='{dest["img"]}' style='width:100%;height:100%;object-fit:cover;'/>
                    <div style='position:absolute;top:10px;left:10px;'>{badge}</div>
                    <div style='position:absolute;bottom:10px;right:10px;
                                background:rgba(0,0,0,.65);border-radius:8px;
                                padding:3px 9px;color:#facc15;font-size:.82rem;'>
                        ⭐ {dest["rating"]}
                    </div>
                </div>
                <div style='padding:1rem 1rem .75rem;'>
                    <div style='display:flex;justify-content:space-between;align-items:start;margin-bottom:.3rem;'>
                        <div style='font-weight:700;color:#f0f2f7;font-size:1rem;'>{dest["name"]}</div>
                        <div style='color:#6b7280;font-size:.78rem;'>${dest["cost"]}/day</div>
                    </div>
                    <div style='color:#6b7280;font-size:.82rem;margin-bottom:.6rem;'>
                        📍 {dest["country"]}, {dest["continent"]}
                    </div>
                    <div style='display:flex;justify-content:space-between;align-items:center;'>
                        <span class='tag-dark'>{dest["type"]}</span>
                        <span class='tag' style='font-size:.74rem;'>🌸 {dest["season"]}</span>
                    </div>
                    <div style='color:#6b7280;font-size:.78rem;margin-top:.5rem;'>
                        {dest["visitors"]}M annual visitors
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

            bc1, bc2, bc3 = st.columns(3)
            with bc1:
                if st.button("Plan ✈️", key=f"plan_{dest['id']}", use_container_width=True):
                    st.session_state.view = "itinerary"
                    st.rerun()
            with bc2:
                fav_lbl = "❤️" if st.session_state[fav_key] else "🤍"
                if st.button(fav_lbl, key=f"fav_btn_{dest['id']}", use_container_width=True):
                    st.session_state[fav_key] = not st.session_state[fav_key]
                    st.rerun()
            with bc3:
                if st.button("Chat 🤖", key=f"chat_{dest['id']}", use_container_width=True):
                    st.session_state.view = "chatbot"
                    msg = f"Tell me about visiting {dest['name']} in {dest['country']}."
                    st.session_state.chat.append({"id": f"auto_{dest['id']}", "sender": "user", "text": msg})
                    st.rerun()


# ═══════════════════════════════════════════════════════════════
#  PAGE: TRAVEL TOOLBOX
# ═══════════════════════════════════════════════════════════════
def page_toolbox():
    st.markdown("<div class='section-title'>🧰 Travel Toolbox</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-sub'>AI-powered utilities to prepare for your next adventure</div>", unsafe_allow_html=True)

    with st.container():
        st.markdown("<div class='ai-card'>", unsafe_allow_html=True)
        tc1, tc2, tc3, tc4 = st.columns([3, 1, 1, 1])
        with tc1:
            tb_dest = st.text_input("🌍 Destination", placeholder="e.g. Tokyo, Japan", key="tb_dest")
        with tc2:
            tb_days = st.number_input("📅 Days", 1, 60, 5, key="tb_days")
        with tc3:
            tb_budget = st.selectbox("💰 Budget", ["Budget", "Mid-range", "Luxury"], key="tb_budget")
        with tc4:
            tb_season = st.selectbox("🌤️ Season", ["Spring", "Summer", "Autumn", "Winter"], key="tb_season")

        tb_interests_all = ["Culture", "Cuisine", "Adventure", "Nature", "Art", "History", "Shopping", "Wellness"]
        tb_ints = st.multiselect("🎯 Interests", tb_interests_all, default=["Culture", "Cuisine"], key="tb_ints")
        st.markdown("</div>", unsafe_allow_html=True)

    gen_col, _ = st.columns([1, 3])
    with gen_col:
        gen_tb = st.button("🪄  Generate All Toolbox Data", use_container_width=True)

    if gen_tb and tb_dest:
        results = {}
        with st.spinner("🔧 Generating all toolbox data (may take a moment)…"):
            results["packing"] = ai_packing_list(tb_dest, tb_days, tb_season, tb_ints)
            results["etiquette"] = ai_etiquette(tb_dest)
            results["budget"] = ai_budget(tb_dest, tb_days, tb_budget)
            results["phrasebook"] = ai_phrasebook(tb_dest)
            results["safety"] = ai_safety(tb_dest)
            results["gems"] = ai_hidden_gems(tb_dest)
        st.session_state.toolbox = results
        st.success(f"✅ Toolbox data generated for {tb_dest}!")

    if not tb_dest and gen_tb:
        st.warning("Please enter a destination first.")

    tabs = st.tabs(["🎒 Packing", "🙏 Etiquette", "💰 Budget",
                    "💬 Phrasebook", "🛡️ Safety", "💎 Hidden Gems",
                    "🔊 Translator", "📸 Image Analysis"])
    tb = st.session_state.toolbox
    dest_label = tb_dest or "(enter destination above)"

    with tabs[0]:
        packing = tb.get("packing", [])
        if packing:
            st.markdown(f"**🎒 Packing List for {dest_label}** ({len(packing)} items)")
            st.markdown("<br>", unsafe_allow_html=True)
            items_per_col = (len(packing) + 1) // 2
            pc1, pc2 = st.columns(2)
            for i, item in enumerate(packing):
                col = pc1 if i < items_per_col else pc2
                with col:
                    chk_key = f"pck_{i}_{item[:10]}"
                    if chk_key not in st.session_state:
                        st.session_state[chk_key] = False
                    st.checkbox(item, key=chk_key)
            if packing:
                txt = "\n".join(f"☐ {x}" for x in packing)
                st.download_button("📋 Export List", txt,
                                   f"packing_{dest_label.replace(' ','_')}.txt",
                                   "text/plain")
        else:
            st.info("Generate toolbox data to see your smart packing list.")

    with tabs[1]:
        et = tb.get("etiquette")
        if et:
            md_render(et)
        else:
            st.info("Generate toolbox data to see local etiquette guide.")

    with tabs[2]:
        bud = tb.get("budget")
        if bud:
            md_render(bud)
        else:
            st.info("Generate toolbox data to see budget estimate.")

    with tabs[3]:
        ph = tb.get("phrasebook")
        if ph:
            md_render(ph)
        else:
            st.info("Generate toolbox data to see travel phrasebook.")

    with tabs[4]:
        sf = tb.get("safety")
        if sf:
            md_render(sf)
        else:
            st.info("Generate toolbox data to see safety tips.")

    with tabs[5]:
        gm = tb.get("gems")
        if gm:
            md_render(gm)
        else:
            st.info("Generate toolbox data to see hidden gems.")

    with tabs[6]:
        st.markdown("### 🔊 Voice Translator")
        st.markdown("<div style='color:#6b7280;margin-bottom:1rem;'>Translate text and hear it spoken aloud.</div>",
                    unsafe_allow_html=True)
        vt1, vt2 = st.columns([3, 2])
        with vt1:
            src_text = st.text_area("Enter text to translate",
                                    placeholder="e.g. Where is the nearest train station?", height=120)
            lang_sel = st.selectbox("Target Language", list(LANG_MAP.keys()))
            if st.button("🌐 Translate & Speak", use_container_width=True):
                if src_text.strip():
                    with st.spinner("Translating…"):
                        translated = ai_translate(src_text, lang_sel)
                    st.session_state["trans_result"] = translated
                    st.session_state["trans_lang"] = LANG_MAP[lang_sel]
                else:
                    st.warning("Enter some text first.")

        with vt2:
            result = st.session_state.get("trans_result", "")
            if result:
                st.markdown(f"""
                <div class='ai-card' style='text-align:center;padding:1.5rem;'>
                    <div style='color:#6b7280;font-size:.8rem;margin-bottom:.5rem;'>
                        {lang_sel} Translation
                    </div>
                    <div style='font-size:1.4rem;font-weight:700;color:#f0f2f7;line-height:1.4;'>
                        {result}
                    </div>
                </div>
                """, unsafe_allow_html=True)
                if GTTS_OK:
                    lang_code = st.session_state.get("trans_lang", "en")
                    if st.button("🔊 Play Audio", use_container_width=True):
                        with st.spinner("Generating audio…"):
                            audio = make_tts(result, lang_code)
                        if audio:
                            st.audio(audio, format="audio/mp3")
                        else:
                            st.warning("Could not generate audio.")
                else:
                    st.caption("Install gTTS for audio playback: `pip install gTTS`")
            else:
                st.markdown("""
                <div class='ai-card' style='text-align:center;padding:2rem;'>
                    <div style='font-size:2.5rem;margin-bottom:.5rem;opacity:.3;'>🔊</div>
                    <div style='color:#6b7280;'>Your translation will appear here</div>
                </div>
                """, unsafe_allow_html=True)

    with tabs[7]:
        st.markdown("### 📸 Cultural Image Analyzer")
        st.markdown("<div style='color:#6b7280;margin-bottom:1rem;'>Upload a travel photo for deep cultural insights.</div>",
                    unsafe_allow_html=True)
        up_img = st.file_uploader("Upload travel photo", type=["jpg", "jpeg", "png", "webp"])
        img_prompt = st.text_input("Ask about the image",
                                   placeholder="What is the cultural significance of this site?",
                                   value="Describe the cultural, historical, and travel significance of this image.")
        if up_img and st.button("🔍 Analyze Image", use_container_width=True):
            img_bytes = up_img.read()
            mime = up_img.type
            ia1, ia2 = st.columns(2)
            with ia1:
                st.image(img_bytes, caption="Uploaded Image", use_container_width=True)
            with ia2:
                with st.spinner("Analyzing…"):
                    analysis = ai_analyze_image(img_bytes, mime, img_prompt)
                st.markdown(f"""
                <div style='background:#0f1117;border:1px solid #2a2f3d;border-radius:14px;
                            padding:1.2rem;color:#d1d5db;font-size:.9rem;line-height:1.7;'>
                    {analysis.replace(chr(10),'<br>')}
                </div>
                """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
#  PAGE: CHATBOT
# ═══════════════════════════════════════════════════════════════
def page_chatbot():
    st.markdown("<div class='section-title'>🤖 Aria — AI Travel Assistant</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-sub'>Your 24/7 cultural expert. Ask anything about destinations, culture, etiquette, and travel planning.</div>", unsafe_allow_html=True)

    chat_html = '<div style="display:flex;flex-direction:column;gap:.5rem;padding:1rem 0;">'
    for msg in st.session_state.chat:
        if msg["sender"] == "user":
            chat_html += f"""
            <div class='chat-user'>
                <div class='bubble-user'>{msg["text"]}</div>
            </div>"""
        else:
            text_escaped = msg["text"].replace("<", "&lt;").replace(">", "&gt;")
            chat_html += f"""
            <div class='chat-bot'>
                <div style='display:flex;align-items:flex-start;gap:.5rem;'>
                    <div style='width:30px;height:30px;background:#d4f870;border-radius:50%;
                                display:flex;align-items:center;justify-content:center;
                                font-size:.9rem;flex-shrink:0;margin-top:3px;'>✈</div>
                    <div class='bubble-bot'>{text_escaped}</div>
                </div>
            </div>"""
    chat_html += "</div>"

    st.markdown(f"""
    <div style='background:#1c1f28;border:1px solid #2a2f3d;border-radius:20px;
                padding:1rem;height:420px;overflow-y:auto;margin-bottom:1rem;'>
        {chat_html}
    </div>
    """, unsafe_allow_html=True)

    inp_col, btn_col = st.columns([5, 1])
    with inp_col:
        user_msg = st.text_input("Message Aria", label_visibility="collapsed",
                                 placeholder="Ask about destinations, weather, cultural tips…",
                                 key="chat_input")
    with btn_col:
        send = st.button("Send ➤", use_container_width=True)

    if send and user_msg.strip():
        st.session_state.chat.append({"id": f"u_{len(st.session_state.chat)}", "sender": "user", "text": user_msg})
        with st.spinner("Aria is thinking…"):
            reply = ai_chatbot(user_msg, st.session_state.chat[:-1])
        st.session_state.chat.append({"id": f"b_{len(st.session_state.chat)}", "sender": "bot", "text": reply})

        if GTTS_OK:
            audio = make_tts(reply, "en")
            if audio:
                st.audio(audio, format="audio/mp3")

        st.rerun()

    st.markdown("<div style='margin-top:.75rem;'><span style='color:#6b7280;font-size:.82rem;'>Quick prompts: </span></div>",
                unsafe_allow_html=True)
    qp_cols = st.columns(4)
    quick = [
        "Best time to visit Japan?",
        "Cultural etiquette in India?",
        "Hidden gems in Europe?",
        "Budget travel tips for SE Asia",
    ]
    for col, q in zip(qp_cols, quick):
        with col:
            if st.button(q, key=f"qp_{q[:10]}", use_container_width=True):
                st.session_state.chat.append({"id": f"u_q{len(st.session_state.chat)}", "sender": "user", "text": q})
                with st.spinner("Aria is thinking…"):
                    reply = ai_chatbot(q, st.session_state.chat[:-1])
                st.session_state.chat.append({"id": f"b_q{len(st.session_state.chat)}", "sender": "bot", "text": reply})
                st.rerun()

    clear_col, _ = st.columns([1, 4])
    with clear_col:
        if st.button("🗑️ Clear Chat", use_container_width=True):
            st.session_state.chat = [{"id": "welcome", "sender": "bot",
                                       "text": "✈️ Chat cleared. How can I help you plan your next adventure?"}]
            st.rerun()


# ═══════════════════════════════════════════════════════════════
#  PAGE: TRIP VIDEO (Veo)
# ═══════════════════════════════════════════════════════════════
def page_video():
    st.markdown("<div class='section-title'>🎬 Trip Memory Video</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-sub'>Generate a cinematic video memory of your journey using Google's Veo AI</div>", unsafe_allow_html=True)

    st.warning("""
    **⚠️ Paid API Required:** Video generation uses the Veo model which requires a paid Google Cloud
    project with Veo API access enabled. Standard Gemini API keys may not have access.
    """)

    with st.container():
        st.markdown("<div class='ai-card'>", unsafe_allow_html=True)
        vid_prompt = st.text_area(
            "Describe your trip memory",
            placeholder="e.g. A cinematic video of a serene temple in Kyoto at sunrise, cherry blossoms falling…",
            height=120,
        )
        v1, v2, v3 = st.columns(3)
        with v1:
            vid_duration = st.selectbox("Duration", ["5s", "8s", "10s"])
        with v2:
            vid_ratio = st.selectbox("Aspect Ratio", ["16:9", "9:16", "1:1"])
        with v3:
            vid_style = st.selectbox("Style", ["Cinematic", "Documentary", "Aerial", "Time-lapse"])
        st.markdown("</div>", unsafe_allow_html=True)

    if st.button("🎬 Generate Video", use_container_width=False):
        if not vid_prompt.strip():
            st.warning("Please describe your trip memory first.")
        elif not get_client():
            st.error("Gemini API key not configured. Add it to `.streamlit/secrets.toml`.")
        else:
            full_prompt = f"{vid_prompt}. Style: {vid_style}. Professional quality travel video."
            with st.spinner("🎬 Generating video (this may take 2-5 minutes)…"):
                video_url = ai_generate_video(full_prompt)
            if video_url:
                st.success("✅ Video generated!")
                st.video(video_url)
            else:
                st.error("Video generation failed. Ensure your API key has Veo access.")

    st.markdown("---")
    st.markdown("### 💡 Video Prompt Inspiration")
    inspo = [
        "A cinematic timelapse of the Eiffel Tower from day to night, city lights reflecting on the Seine",
        "An aerial drone shot gliding over Santorini's white cubic buildings and blue-domed churches",
        "A slow-motion walk through a vibrant Tokyo street market at sunset",
        "Ancient temples of Angkor Wat emerging from jungle mist at golden hour",
    ]
    for tip in inspo:
        if st.button(f"💡 {tip[:60]}…", key=f"vid_tip_{tip[:15]}", use_container_width=True):
            st.session_state["vid_prompt_fill"] = tip


# ═══════════════════════════════════════════════════════════════
#  PAGE: PHOTO ANALYZER (Vision)
# ═══════════════════════════════════════════════════════════════
def page_vision():
    st.markdown("<div class='section-title'>📸 Cultural Photo Analyzer</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-sub'>Upload any travel photo and get deep cultural, historical, and practical insights</div>", unsafe_allow_html=True)

    up = st.file_uploader("Upload a travel photo", type=["jpg", "jpeg", "png", "webp"])
    if up:
        col1, col2 = st.columns(2)
        with col1:
            st.image(up, caption="Your Travel Photo", use_container_width=True)

        with col2:
            prompt_presets = {
                "Cultural History": "What is the cultural and historical significance of what I see here? Include the era, civilization, and traditions related to this place or object.",
                "Travel Tips": "As a travel expert, give me practical tips for visiting this location. Include best time to visit, what to wear, etiquette, and hidden spots nearby.",
                "Art & Architecture": "Analyze the architectural style, artistic elements, and design philosophy visible in this image. Include the historical period and influences.",
                "Food & Cuisine": "If there's food or a restaurant/market visible, describe the cuisine, key dishes, local ingredients, and dining etiquette.",
                "Nature & Environment": "Describe the natural landscape, ecosystem, and geographical features visible. Include the best activities for this type of environment.",
            }
            preset = st.selectbox("Analysis Type", list(prompt_presets.keys()))
            custom_prompt = st.text_area("Custom Question (optional)",
                                         placeholder="Or type your own question about the image…",
                                         height=80)
            final_prompt = custom_prompt.strip() if custom_prompt.strip() else prompt_presets[preset]

            if st.button("🔍 Analyze Photo", use_container_width=True):
                img_bytes = up.read()
                with st.spinner("🧠 Analyzing your photo…"):
                    result = ai_analyze_image(img_bytes, up.type, final_prompt)
                st.session_state["vision_result"] = result

        if st.session_state.get("vision_result"):
            st.markdown("### 🧠 AI Analysis")
            md_render(st.session_state["vision_result"])

            if GTTS_OK:
                if st.button("🔊 Listen to Analysis"):
                    with st.spinner("Generating audio…"):
                        audio = make_tts(st.session_state["vision_result"])
                    if audio:
                        st.audio(audio, format="audio/mp3")


# ═══════════════════════════════════════════════════════════════
#  PAGE: TRAVEL JOURNAL
# ═══════════════════════════════════════════════════════════════
def page_journal():
    st.markdown("<div class='section-title'>📔 AI Travel Journal</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-sub'>Turn your rough notes into beautiful travel stories</div>", unsafe_allow_html=True)

    j1, j2 = st.columns([1, 1])
    with j1:
        jdest = st.text_input("📍 Where were you?", placeholder="e.g. Kyoto, Japan")
        jnotes = st.text_area("✏️ Your raw notes",
                              placeholder="Just jot down what you saw, felt, experienced…\ne.g. Visited temple at sunrise. Monks chanting. Green tea ceremony. Amazing ramen near station.",
                              height=200)
        jdate = st.date_input("📅 Date of Visit", value=date.today())

        if st.button("✨ Expand into Journal Entry", use_container_width=True):
            if jdest and jnotes:
                with st.spinner("Aria is crafting your story…"):
                    expanded = ai_journal_expand(jnotes, jdest)
                st.session_state["journal_result"] = expanded
                st.session_state["journal_dest"] = jdest
                st.session_state["journal_date"] = jdate.strftime("%B %d, %Y")
            else:
                st.warning("Please enter a destination and some notes.")

    with j2:
        result = st.session_state.get("journal_result", "")
        jdest_res = st.session_state.get("journal_dest", "")
        jdate_res = st.session_state.get("journal_date", "")
        if result:
            st.markdown(f"""
            <div style='background:#1c1f28;border:1px solid #2a2f3d;border-radius:20px;
                        padding:1.5rem;'>
                <div style='font-family:"Playfair Display",serif;font-size:1.3rem;
                            font-weight:700;color:#d4f870;margin-bottom:.3rem;'>
                    {jdest_res}
                </div>
                <div style='color:#6b7280;font-size:.8rem;margin-bottom:1rem;
                            border-bottom:1px solid #2a2f3d;padding-bottom:.75rem;'>
                    ✍️ {jdate_res}
                </div>
                <div style='color:#d1d5db;font-size:.93rem;line-height:1.85;
                            font-style:italic;'>
                    {result.replace(chr(10),"<br>")}
                </div>
            </div>
            """, unsafe_allow_html=True)

            ec1, ec2 = st.columns(2)
            with ec1:
                full_text = f"# {jdest_res}\n*{jdate_res}*\n\n{result}"
                st.download_button("📋 Save as Text", full_text,
                                   f"journal_{jdest_res.replace(' ','_')}.txt", "text/plain",
                                   use_container_width=True)
            with ec2:
                if GTTS_OK and st.button("🔊 Read Aloud", use_container_width=True):
                    with st.spinner("Generating narration…"):
                        audio = make_tts(result)
                    if audio:
                        st.audio(audio, format="audio/mp3")
        else:
            st.markdown("""
            <div style='background:#1c1f28;border:1px dashed #2a2f3d;border-radius:20px;
                        padding:3rem;text-align:center;height:100%;min-height:320px;
                        display:flex;flex-direction:column;justify-content:center;align-items:center;'>
                <div style='font-size:3rem;margin-bottom:1rem;opacity:.3;'>📔</div>
                <div style='color:#6b7280;font-size:.95rem;'>
                    Your beautifully expanded journal entry will appear here
                </div>
            </div>
            """, unsafe_allow_html=True)

    if "journal_entries" not in st.session_state:
        st.session_state["journal_entries"] = []

    if st.session_state.get("journal_result"):
        col_save, _ = st.columns([1, 3])
        with col_save:
            if st.button("💾 Save to Journal", use_container_width=True):
                st.session_state["journal_entries"].append({
                    "dest": st.session_state.get("journal_dest",""),
                    "date": st.session_state.get("journal_date",""),
                    "text": st.session_state.get("journal_result",""),
                })
                st.success("Saved!")

    if st.session_state["journal_entries"]:
        st.markdown("---")
        st.markdown("### 📚 Your Journal")
        for entry in reversed(st.session_state["journal_entries"]):
            with st.expander(f"📍 {entry['dest']}  —  {entry['date']}"):
                st.markdown(f"""
                <div style='color:#d1d5db;font-size:.9rem;line-height:1.8;font-style:italic;'>
                    {entry['text'].replace(chr(10),'<br>')}
                </div>
                """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
#  ROUTER
# ═══════════════════════════════════════════════════════════════
def main():
    sidebar()

    view = st.session_state.view

    if not st.session_state.user_name:
        st.markdown("""
        <div style='max-width:420px;margin:4rem auto;text-align:center;
                    background:#1c1f28;border:1px solid #2a2f3d;border-radius:28px;padding:3rem;'>
            <div style='font-family:"Playfair Display",serif;font-size:2.8rem;
                        font-weight:800;color:#d4f870;margin-bottom:.5rem;'>
                Cultural AI
            </div>
            <div style='color:#f0f2f7;font-size:1.3rem;font-weight:600;margin-bottom:.75rem;'>
                Welcome, Traveler ✈️
            </div>
            <div style='color:#6b7280;font-size:.9rem;line-height:1.6;margin-bottom:1.5rem;'>
                Your AI-powered cultural travel companion.<br>
                Enter your name in the sidebar to get started.
            </div>
            <div style='color:#d4f870;font-size:.8rem;font-weight:700;letter-spacing:.08em;'>
                ← SET YOUR NAME IN THE SIDEBAR
            </div>
        </div>
        """, unsafe_allow_html=True)
        return

    if view == "dashboard":
        page_dashboard()
    elif view == "itinerary":
        page_itinerary()
    elif view == "recommendations":
        page_recommendations()
    elif view == "toolbox":
        page_toolbox()
    elif view == "chatbot":
        page_chatbot()
    elif view == "video":
        page_video()
    elif view == "vision":
        page_vision()
    elif view == "journal":
        page_journal()
    else:
        page_dashboard()


if __name__ == "__main__":
    main()
