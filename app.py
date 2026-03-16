import os
from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")


# -----------------------------
# Weather Activity Suggestions
# -----------------------------
@app.route("/weather-suggestion", methods=["POST"])
def weather_suggestion():
    data = request.json
    city = data.get("city")
    temperature = data.get("temperature")
    condition = data.get("condition")

    prompt = f"""
    The weather in {city} is {temperature}°C and {condition}.
    Suggest suitable cultural or travel activities.
    Keep the answer within 2 sentences.
    """

    response = model.generate_content(prompt)

    return jsonify({
        "suggestion": response.text
    })


# -----------------------------
# Smart Cultural Recommendations
# -----------------------------
@app.route("/recommendations", methods=["POST"])
def recommendations():

    data = request.json
    interests = data.get("interests")
    city = data.get("city")

    prompt = f"""
    A traveler is visiting {city}.
    Their interests include: {interests}.

    Suggest 5 cultural places or experiences they should visit.
    """

    response = model.generate_content(prompt)

    return jsonify({
        "recommendations": response.text
    })


# -----------------------------
# AI Itinerary Generator
# -----------------------------
@app.route("/generate-itinerary", methods=["POST"])
def generate_itinerary():

    data = request.json
    preferences = data.get("preferences")
    duration = data.get("duration")
    city = data.get("city")

    prompt = f"""
    Create a {duration}-day cultural travel itinerary for {city}.

    Traveler preferences:
    {preferences}

    Include:
    - Morning
    - Afternoon
    - Evening

    Focus on cultural experiences.
    """

    response = model.generate_content(prompt)

    return jsonify({
        "itinerary": response.text
    })


# -----------------------------
# AI Travel Chatbot
# -----------------------------
@app.route("/chat", methods=["POST"])
def chatbot():

    data = request.json
    message = data.get("message")

    prompt = f"""
    You are an AI cultural tourism assistant.
    Answer the traveler question clearly and concisely.

    Question:
    {message}
    """

    response = model.generate_content(prompt)

    return jsonify({
        "reply": response.text
    })


# -----------------------------
# Health check
# -----------------------------
@app.route("/")
def home():
    return {"status": "AI Cultural Tourism API Running"}


if __name__ == "__main__":
    app.run(debug=True)
