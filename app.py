import os
import traceback
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from modules.llm_providers.gemini import GeminiLLM
from modules.content_formatter import format_output
from modules.validator import validate_output

load_dotenv()

# ---------------------------------------------------
# Flask Setup
# ---------------------------------------------------

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'history.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# ---------------------------------------------------
# Database Model
# ---------------------------------------------------

class ContentHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    platform = db.Column(db.String(100))
    persona = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, server_default=db.func.now())


with app.app_context():
    db.create_all()


# ---------------------------------------------------
# AI Model
# ---------------------------------------------------

text_model = GeminiLLM()


# ---------------------------------------------------
# Platform Mapping
# ---------------------------------------------------

PLATFORM_ALIASES = {
    "email": "Email",
    "mail": "Email",
    "professional email": "Email",
    "linkedin": "LinkedIn",
    "linkedin post": "LinkedIn",
    "twitter": "Twitter",
    "tweet": "Twitter",
    "x": "Twitter",
    "instagram": "Instagram",
    "facebook": "Facebook",
    "blog": "Blog",
    "article": "Blog",
    "youtube": "YouTube",
    "ad": "Ad",
}


def normalize_platform(raw):
    return PLATFORM_ALIASES.get(raw.strip().lower(), raw.strip().title())


# ---------------------------------------------------
# Prompt Builder
# ---------------------------------------------------

def build_prompt(platform, topic, tone, persona, target_audience,
                 keywords, cta_style, emoji_instruction, length,
                 word_count=200):

    kw = keywords if keywords else "none"

    # ---------------- EMAIL ----------------

    if platform == "Email":

        prompt = f"""
You are a professional email writer.

Write a formal email about "{topic}".

PARAMETERS
- Sender role: {persona}
- Target audience: {target_audience}
- Tone: {tone}
- Keywords: {kw}
- {emoji_instruction}
- Length: approximately {word_count} words

OUTPUT FORMAT

Subject: Clear subject line

Dear Sir/Madam,

Opening paragraph explaining the purpose.

2-3 short paragraphs with details.

Closing paragraph with {cta_style} call-to-action.

Best regards,
{persona}

RULES
- First line must start with Subject:
- Do not include explanations
- Do not stop mid sentence
- Return only the email
"""

        tokens = max(1200, word_count * 8)

    # ---------------- LINKEDIN ----------------

    elif platform == "LinkedIn":

        prompt = f"""
You are a LinkedIn content expert.

Write an engaging LinkedIn post about "{topic}".

PARAMETERS
- Author persona: {persona}
- Target audience: {target_audience}
- Tone: {tone}
- Keywords: {kw}
- {emoji_instruction}
- Target length: approximately {word_count} words

STRUCTURE
1. Hook (first line stops the scroll)
2. 3 short paragraphs
3. Key takeaway
4. End with {cta_style} CTA
5. Add 3 hashtags

RULES
- Do not start with explanations
- Each paragraph max 3 sentences
- Do not stop mid sentence
- Return only the post
"""

        tokens = max(1500, word_count * 8)

    # ---------------- TWITTER ----------------

    elif platform == "Twitter":

        prompt = f"""
You are a Twitter/X copywriter.

Write a tweet about "{topic}".

PARAMETERS
- Persona: {persona}
- Tone: {tone}
- {emoji_instruction}

RULES
- Maximum 280 characters
- Include 1 or 2 hashtags
- Return only the tweet
"""

        tokens = 200

    # ---------------- BLOG ----------------

    elif platform == "Blog":

        prompt = f"""
You are an expert blog writer.

Write a blog post about "{topic}".

PARAMETERS
- Author persona: {persona}
- Target audience: {target_audience}
- Tone: {tone}
- Keywords: {kw}
- Target length: {word_count} words
- {emoji_instruction}

STRUCTURE
Title
Introduction
4 sections with headings
Conclusion with {cta_style} CTA

RULES
- Use markdown headings
- Do not stop mid sentence
- Return only the blog
"""

        tokens = max(2500, word_count * 6)

    # ---------------- FALLBACK ----------------

    else:

        prompt = f"""
Write content about "{topic}" for {platform}.

Tone: {tone}
Audience: {target_audience}
Keywords: {kw}

Write approximately {word_count} words.

End with {cta_style} CTA.

Return only the content.
"""

        tokens = max(900, word_count * 6)

    return prompt.strip(), tokens


# ---------------------------------------------------
# Routes
# ---------------------------------------------------

@app.route("/")
def home():
    return jsonify({
        "status": "Backend running",
        "model": "Gemini 2.5 Flash"
    })


@app.route("/api/generate", methods=["POST"])
def generate_content():

    try:

        data = request.json

        topic = data.get("topic", "").strip()

        if not topic:
            return jsonify({"error": "Topic required"}), 400

        raw_platform = data.get("platform") or data.get("mode") or "LinkedIn"
        platform = normalize_platform(raw_platform)

        persona = data.get("persona", "Professional")
        target_audience = data.get("target_audience_type", "General")
        tone = data.get("tone", "Professional")
        cta_style = data.get("cta_style", "Soft")

        keywords = data.get("keywords", "")

        if isinstance(keywords, list):
            keywords = ", ".join(keywords)

        emoji_pref = data.get("emoji_pref", "no").lower()

        emoji_instruction = (
            "Use emojis where appropriate."
            if emoji_pref == "yes"
            else "Do not use emojis."
        )

        word_limit = data.get("word_limit", 200)

        prompt, max_tokens = build_prompt(
            platform,
            topic,
            tone,
            persona,
            target_audience,
            keywords,
            cta_style,
            emoji_instruction,
            "medium",
            word_count=word_limit
        )

        # Safety minimum tokens
        max_tokens = max(max_tokens, 600)

        raw_output = text_model.generate(prompt, max_tokens=max_tokens)

        final_output = format_output(platform, raw_output)

        status = validate_output(platform, final_output)

        db.session.add(ContentHistory(
            topic=topic,
            content=final_output,
            platform=platform,
            persona=persona
        ))

        db.session.commit()

        return jsonify({
            "success": True,
            "content": final_output,
            "platform": platform,
            "status": status,
            "revision_count": 1
        })

    except Exception as e:

        print("\nERROR in /api/generate")
        traceback.print_exc()

        db.session.rollback()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------------------------------------------
# History
# ---------------------------------------------------

@app.route("/api/history", methods=["GET"])
def get_history():

    items = ContentHistory.query.order_by(ContentHistory.id.desc()).all()

    return jsonify({
        "history": [
            {
                "id": i.id,
                "topic": i.topic,
                "content": i.content,
                "platform": i.platform,
                "persona": i.persona
            }
            for i in items
        ]
    })


@app.route("/api/delete/<int:id>", methods=["DELETE"])
def delete_history(id):

    item = ContentHistory.query.get_or_404(id)

    db.session.delete(item)

    db.session.commit()

    return jsonify({"message": "Deleted"})


# ---------------------------------------------------
# Run Server
# ---------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=8000, use_reloader=False)