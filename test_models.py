from modules.llm_providers.gemini import GeminiLLM
from modules.content_formatter import format_output
from modules.validator import validate_output

print("\n🎯 ADVANCED CONTENT GENERATOR (GEMINI)\n")

# -------- User Inputs --------
topic = input("Enter Topic: ")
persona = input("Target Persona (e.g., Student, CEO, Influencer): ")
target_audience_type = input("Target Audience (Students / Professionals / General Public): ")
platform = input("Platform (LinkedIn / Instagram / Twitter / Email / Blog): ")
tone = input("Tone (Professional / Casual / Witty / Persuasive / Friendly): ")
length = input("Length (Short / Medium / Long): ")
keywords = input("Keywords (comma separated): ")
writing_style = input("Writing Style (Storytelling / Informative / Persuasive / AIDA / PAS): ")
emoji_pref = input("Include emojis? (yes / no): ")
cta_style = input("Call-to-action style (Question / Direct / Soft): ")
purpose = input("Content purpose (Inform / Persuade / Awareness / Marketing): ")
age_group = input("Audience Age Group (Teen / Young Adult / Adult / Senior): ")
content_format = input("Content Format (Bullets / Sentences / Mixed): ")

# -------- Defaults (VERY IMPORTANT) --------
tone = tone or "Professional"
length = length or "Medium"
writing_style = writing_style or "Informative"
emoji_pref = emoji_pref or "no"
cta_style = cta_style or "Soft"
purpose = purpose or "Inform"
age_group = age_group or "Adult"
content_format = content_format or "Sentences"

# -------- Token Control --------
token_map = {
    "short": 500,
    "medium": 1000,
    "long": 2000
}
max_tokens = token_map.get(length.lower(), 700)

# -------- Dynamic Structure Rules --------
if length.lower() == "short":
    structure_rules = "- Keep it concise: strictly 1 to 2 sentences.\n- Maximum 40 words total.\n- Ensure the final sentence is completely finished before adding any hashtags or call-to-action."
elif length.lower() == "medium":
    structure_rules = "- Write EXACTLY 3 paragraphs.\n- Each paragraph must have 3-4 sentences.\n- Use clear line breaks between paragraphs."
elif length.lower() == "long":
    structure_rules = "- Write a comprehensive post with 4 or more paragraphs.\n- Include a hook, detailed body, and a strong conclusion."
else:
    structure_rules = "- Write a complete, well-structured post."

# -------- Prompt Engineering --------
prompt = f"""
You are a professional AI social media content creator.

CONTENT CONTEXT:
- Persona: {persona}
- Target audience: {target_audience_type}
- Audience age group: {age_group}
- Purpose: {purpose}
- Writing style: {writing_style}
- Content format: {content_format}
- Tone: {tone}

PLATFORM: {platform}

GENERAL RULES:
- Write ONLY the final content
- No explanations
- Naturally include keywords: {keywords}
- End with a call-to-action ({cta_style} style)
- Do NOT end abruptly
- Complete all sentences fully

Topic: {topic}
Length: {length}

STRUCTURE RULES:
{structure_rules}

Now generate ONLY the {platform} content.
"""

# -------- Model Call --------
model = GeminiLLM()
output = model.generate(prompt, max_tokens=max_tokens)

# -------- Post-processing --------
output = format_output(platform, output)

# -------- Validation --------
status = validate_output(platform, output)

# -------- Output --------
print("\n" + "=" * 60)
print(f"✅ GENERATED CONTENT ({platform.upper()})")
print("=" * 60)
print(output)
print("\n[VALIDATION STATUS]:", status)