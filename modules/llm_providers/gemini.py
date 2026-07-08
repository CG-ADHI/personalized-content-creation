from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
from .base_llm import BaseLLM

load_dotenv()

class GeminiLLM(BaseLLM):

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file")

        self.client = genai.Client(api_key=api_key)

    def generate(self, prompt, target_persona="Content Creator", tone="Professional", max_tokens=1024):

        system_msg = (
            f"You are an expert AI Media Assistant. "
            f"Generate high-quality media content for a {target_persona} "
            f"with a {tone} tone."
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_msg,
                    temperature=0.7,
                    max_output_tokens=max_tokens,
                )
            )

            # Safe return
            if hasattr(response, "text") and response.text:
                return response.text

            # fallback if structure changes
            if response.candidates:
                return response.candidates[0].content.parts[0].text

            return "No response generated."

        except Exception as e:
            print("Gemini API error:", e)
            return "Error generating content from Gemini."