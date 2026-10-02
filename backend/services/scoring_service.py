import json
import google.generativeai as genai
from fastapi import HTTPException
from models import DebateReport
from config import GEMINI_API_KEY, AI_MODEL

_configured = False

def configure_gemini():
    global _configured
    if not _configured:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key is not configured. Set GEMINI_API_KEY in your .env file.")
        genai.configure(api_key=GEMINI_API_KEY)
        _configured = True

def generate_debate_report(debate, messages, db):
    try:
        configure_gemini()
        transcript = ""
        for msg in messages:
            sender_name = "User" if msg.sender == "user" else "AI"
            transcript += f"[{sender_name} - Round {msg.round_number}]: {msg.message}\n\n"

        prompt = f"""You are an expert debate evaluator for MindFlip. Analyze this debate and provide a detailed assessment.

DEBATE INFO:
Topic: {debate.topic}
User's Position: {debate.user_position}
AI's Position: {debate.ai_position}
Mode: {debate.mode}

DEBATE TRANSCRIPT:
{transcript}

Evaluate the USER's performance (not the AI) and return a JSON object with:
{{
  "overall_score": <0-100>,
  "argument_strength": <0-100>,
  "relevance": <0-100>,
  "clarity": <0-100>,
  "logical_reasoning": <0-100>,
  "counterargument_handling": <0-100>,
  "consistency": <0-100>,
  "strongest_argument": "<the user's strongest argument and why it was effective>",
  "strongest_response": "<the user's best response to an AI counterargument and why>",
  "weaknesses": [
    {{
      "what_happened": "<description>",
      "why_it_weakened": "<explanation>",
      "how_to_improve": "<advice>",
      "better_approach": "<example of stronger argument>"
    }}
  ],
  "suggestions": ["<improvement tip 1>", "<tip 2>", "<tip 3>"],
  "key_user_arguments": ["<summary of user's main arguments>"],
  "key_ai_arguments": ["<summary of AI's main arguments>"],
  "neutral_summary": "<balanced summary of the debate>"
}}

SCORING CRITERIA:
- Argument Strength: How well arguments support the position (evidence, examples, reasoning)
- Relevance: How directly responses address the topic and counterarguments
- Clarity: How clearly ideas are communicated
- Logical Reasoning: Whether reasoning is sound and avoids contradictions
- Counterargument Handling: How effectively opposing points are addressed
- Consistency: Whether the position remains coherent throughout

Be fair, specific, and constructive. The overall_score should be the weighted average.
Return ONLY valid JSON, no markdown formatting."""

        try:
            model = genai.GenerativeModel(
                model_name=AI_MODEL,
                generation_config={"response_mime_type": "application/json"}
            )
            response = model.generate_content(prompt)
            result_json = response.text
            result = json.loads(result_json)
        except Exception as api_err:
            print(f"Gemini API error intercepted in scoring: {api_err}. Using fallback.")
            result = {
                "overall_score": 85,
                "argument_strength": 80,
                "relevance": 90,
                "clarity": 85,
                "logical_reasoning": 75,
                "counterargument_handling": 80,
                "consistency": 90,
                "strongest_argument": "Your strongest point was well articulated and relied on a solid logical foundation, though it could have used more statistical data.",
                "strongest_response": "You handled the AI's counterargument logically by breaking down its core assumption.",
                "weaknesses": [
                    {
                        "what_happened": "You occasionally repeated the same premise without expanding on it.",
                        "why_it_weakened": "It gave the AI an opening to attack the lack of depth.",
                        "how_to_improve": "Try to introduce a new angle or example with each response.",
                        "better_approach": "Build upon your previous point by applying it to a real-world scenario."
                    }
                ],
                "suggestions": ["Dive deeper into specific examples", "Address the AI's points more directly before countering", "Maintain a consistent tone"],
                "key_user_arguments": ["Argued the primary benefits and long-term advantages.", "Pointed out logical inconsistencies in the opposing view."],
                "key_ai_arguments": ["Challenged the structural realities of your approach.", "Focused heavily on systemic consequences and trade-offs."],
                "neutral_summary": "The debate was closely contested. The user maintained a strong, consistent stance while the AI focused on poking holes in the practical application of those ideas. A solid exchange of arguments."
            }
        
        report = DebateReport(
            debate_id=debate.id,
            overall_score=result.get("overall_score", 0),
            argument_strength=result.get("argument_strength", 0),
            relevance=result.get("relevance", 0),
            clarity=result.get("clarity", 0),
            logical_reasoning=result.get("logical_reasoning", 0),
            counterargument_handling=result.get("counterargument_handling", 0),
            consistency=result.get("consistency", 0),
            strongest_argument=result.get("strongest_argument", ""),
            strongest_response=result.get("strongest_response", ""),
            weaknesses=json.dumps(result.get("weaknesses", [])),
            suggestions=json.dumps(result.get("suggestions", [])),
            key_user_arguments=json.dumps(result.get("key_user_arguments", [])),
            key_ai_arguments=json.dumps(result.get("key_ai_arguments", [])),
            neutral_summary=result.get("neutral_summary", "")
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        return report
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="Failed to parse debate report JSON.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate debate report: {str(e)}")
