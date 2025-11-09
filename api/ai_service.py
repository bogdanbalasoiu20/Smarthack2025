"""
AI Service for Presentation Generation using Anthropic Claude API.
"""

import json
import anthropic
from django.conf import settings


class PresentationAIService:
    """Service for generating presentation content using AI."""

    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not configured in settings")
        self.client = anthropic.Anthropic(api_key=self.api_key)

    def generate_presentation_structure(self, prompt: str, num_slides: int = None) -> dict:
        """
        Generate a complete presentation structure from a user prompt.

        Args:
            prompt: User's description of what presentation they want
            num_slides: Optional number of slides to generate (if not specified, AI decides)

        Returns:
            dict with structure:
            {
                "title": "Presentation Title",
                "description": "Brief description",
                "frames": [
                    {
                        "title": "Frame Title",
                        "order": 0,
                        "background_color": "#ffffff",
                        "elements": [
                            {
                                "type": "TEXT",
                                "content": {
                                    "text": "Content here",
                                    "fontSize": 48,
                                    "fontFamily": "Arial",
                                    "color": "#000000",
                                    "align": "center",
                                    "fontWeight": "bold"
                                },
                                "position": {
                                    "x": 100,
                                    "y": 100,
                                    "width": 800,
                                    "height": 100,
                                    "rotation": 0,
                                    "z_index": 1
                                }
                            }
                        ]
                    }
                ]
            }
        """

        system_prompt = """You are an expert presentation designer. Generate structured presentation content based on user prompts.

Your output MUST be valid JSON with this exact structure:
{
  "title": "string - catchy presentation title",
  "description": "string - brief 1-2 sentence description",
  "frames": [
    {
      "title": "string - slide title",
      "order": number - starting from 0,
      "background_color": "string - hex color like #ffffff",
      "elements": [
        {
          "type": "TEXT",
          "content": {
            "text": "string - the text content",
            "fontSize": number - font size in pixels (24-72 for titles, 16-32 for body),
            "fontFamily": "string - Arial, Helvetica, or Times New Roman",
            "color": "string - hex color",
            "align": "string - left, center, or right",
            "fontWeight": "string - normal or bold"
          },
          "position": {
            "x": number - pixels from left (0-1920),
            "y": number - pixels from top (0-1080),
            "width": number - element width in pixels,
            "height": number - element height in pixels,
            "rotation": 0,
            "z_index": number - layer order
          }
        }
      ]
    }
  ]
}

Design guidelines:
- Standard slide is 1920x1080 pixels
- Title slides: large centered text (fontSize: 64-72)
- Content slides: title at top (fontSize: 48), body text below (fontSize: 24-32)
- Use professional colors (avoid too bright)
- Position titles around y: 100-200
- Position body content around y: 300-400
- Leave margins (min 100px from edges)
- Use 2-4 text elements per slide max
- Create logical flow: intro -> main points -> conclusion
- Keep text concise and impactful

IMPORTANT: Return ONLY the JSON, no other text."""

        user_message = f"""Create a presentation about: {prompt}"""

        if num_slides:
            user_message += f"\n\nCreate exactly {num_slides} slides."
        else:
            user_message += "\n\nCreate an appropriate number of slides (typically 5-10) for this topic."

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=4096,
                temperature=0.7,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            )

            # Extract JSON from response
            response_text = message.content[0].text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            response_text = response_text.strip()

            # Parse JSON
            presentation_data = json.loads(response_text)

            # Validate structure
            if not all(key in presentation_data for key in ["title", "description", "frames"]):
                raise ValueError("Invalid presentation structure from AI")

            return presentation_data

        except anthropic.APIError as e:
            raise Exception(f"Anthropic API error: {str(e)}")
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"AI generation failed: {str(e)}")

    def enhance_slide_content(self, text: str, style: str = "professional") -> str:
        """
        Enhance or rewrite slide text with different styles.

        Args:
            text: Original text
            style: One of: professional, casual, concise, detailed

        Returns:
            Enhanced text
        """

        style_prompts = {
            "professional": "Rewrite this in a professional, business-appropriate tone",
            "casual": "Rewrite this in a friendly, conversational tone",
            "concise": "Make this more concise while keeping key points",
            "detailed": "Expand this with more detail and context"
        }

        prompt = style_prompts.get(style, style_prompts["professional"])

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=1024,
                temperature=0.7,
                messages=[
                    {
                        "role": "user",
                        "content": f"{prompt}:\n\n{text}\n\nReturn only the rewritten text, no explanations."
                    }
                ]
            )

            return message.content[0].text.strip()

        except Exception as e:
            raise Exception(f"Text enhancement failed: {str(e)}")

    def suggest_visuals(self, text: str) -> list:
        """
        Suggest visual elements (images, icons, charts) based on text content.

        Args:
            text: The content to analyze

        Returns:
            List of visual suggestions with type and keywords
        """
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=1024,
                temperature=0.7,
                system="""You are a visual design expert. Analyze the given text and suggest relevant visual elements.

Return a JSON array of suggestions with this format:
[
  {
    "type": "icon" | "image" | "chart" | "diagram",
    "keyword": "string - search term or description",
    "relevance": number between 0-1,
    "description": "brief explanation of why this visual helps"
  }
]

Suggest 3-5 visual elements that would enhance the message. Return ONLY the JSON array.""",
                messages=[
                    {
                        "role": "user",
                        "content": f"Suggest visuals for this content:\n\n{text}"
                    }
                ]
            )

            response_text = message.content[0].text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            response_text = response_text.strip()

            import json
            suggestions = json.loads(response_text)
            return suggestions

        except Exception as e:
            raise Exception(f"Visual suggestion failed: {str(e)}")

    def give_slide_advice(self, slide_content: str, context: str = "") -> dict:
        """
        Analyze a slide and give improvement advice.

        Args:
            slide_content: Current content of the slide
            context: Optional context about the presentation

        Returns:
            Dict with advice and suggestions
        """
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=2048,
                temperature=0.7,
                system="""You are an expert presentation coach. Analyze slides and provide actionable advice.

Return a JSON object with this format:
{
  "overall_score": number 1-10,
  "strengths": ["string - what works well"],
  "improvements": ["string - specific suggestions"],
  "content_advice": "string - advice about the content",
  "design_advice": "string - advice about visual design",
  "quick_wins": ["string - easy improvements to make now"]
}

Be specific, constructive, and actionable. Return ONLY the JSON object.""",
                messages=[
                    {
                        "role": "user",
                        "content": f"""Analyze this slide and give improvement advice:

Slide Content: {slide_content}

{f'Presentation Context: {context}' if context else ''}

Provide specific, actionable advice to make this slide more effective."""
                    }
                ]
            )

            response_text = message.content[0].text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            response_text = response_text.strip()

            import json
            advice = json.loads(response_text)
            return advice

        except Exception as e:
            raise Exception(f"Slide advice failed: {str(e)}")
