import google.generativeai as genai
from fastapi import HTTPException
from config import GEMINI_API_KEY, AI_MODEL

_configured = False

def configure_gemini():
    global _configured
    if not _configured:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key is not configured. Set GEMINI_API_KEY in your .env file.")
        genai.configure(api_key=GEMINI_API_KEY)
        _configured = True

def generate_ai_response(debate, messages, user_message, db):
    try:
        configure_gemini()
        
        system_prompt = f"""You are MindFlip's AI debater. You are participating in a structured debate.

DEBATE DETAILS:
- Topic: {debate.topic}
- Your Position: {debate.ai_position} (You must defend this position)
- Opponent's Position: {debate.user_position}
- Debate Mode: {debate.mode}
- Current Round: {debate.current_round} of {debate.total_rounds}

CRITICAL RULES:
1. You MUST defend the {debate.ai_position} position. Never abandon it.
2. You must NOT agree with the opponent's arguments. You can acknowledge merit but must counter.
3. Respond DIRECTLY to what the opponent said - no generic responses.
4. Identify weaknesses, assumptions, and logical gaps in their argument.
5. Provide specific, relevant counterarguments.
6. Do NOT repeat arguments you've already made.
7. Do NOT invent fake statistics or sources.
8. If evidence is uncertain, say so honestly.
9. Remain respectful and constructive - no insults.
10. Keep responses concise (2-4 paragraphs max).
11. Distinguish facts from opinions.
12. Make the debate intellectually useful.
"""

        if debate.mode == "Friendly":
            system_prompt += "\nMode Specifics: Be constructive and encouraging while still challenging their ideas. Use a warm but firm tone."
        elif debate.mode == "Academic":
            system_prompt += "\nMode Specifics: Focus on logical rigor, evidence quality, and definitional clarity. Point out logical fallacies by name when relevant."
        elif debate.mode == "Devil's Advocate":
            system_prompt += "\nMode Specifics: Aggressively challenge every assumption. Push back hard on weak reasoning. Be provocative but fair."
        elif debate.mode == "Socratic":
            system_prompt += "\nMode Specifics: Ask probing questions that expose assumptions. Lead the opponent to examine their own reasoning through questioning."
        elif debate.mode == "Competitive":
            system_prompt += "\nMode Specifics: Be precise and rigorous. Exploit logical weaknesses. Build strong structured arguments."

        if debate.current_round == 1:
            system_prompt += "\nRound Specifics: Present your opening argument for your position."
        elif debate.current_round == debate.total_rounds:
            system_prompt += "\nRound Specifics: Deliver your strongest closing argument, summarizing key points."
        else:
            system_prompt += "\nRound Specifics: Respond to the opponent's latest argument and strengthen your position."

        history = []
        for msg in messages:
            role = "model" if msg.sender == "ai" else "user"
            history.append({"role": role, "parts": [msg.message]})
            
        model = genai.GenerativeModel(
            model_name=AI_MODEL,
            system_instruction=system_prompt
        )

        try:
            chat = model.start_chat(history=history)
            if user_message:
                response = chat.send_message(user_message)
            elif not messages:
                response = chat.send_message(f"Please provide your opening argument defending the {debate.ai_position} position.")
            else:
                response = chat.send_message("Continue the debate.")
                
            return response.text
            
        except Exception as api_err:
            print(f"Gemini API error intercepted: {api_err}. Using fallback.")
            return generate_mock_response(debate, messages)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI response: {str(e)}")

def generate_mock_response(debate, messages):
    import random
    ai_pos = debate.ai_position
    
    if not messages:
        return f"I strongly advocate for the **{ai_pos}** position. If we analyze the logical foundations and practical realities of this topic, it becomes clear that this stance provides the most sustainable and beneficial outcome. The opposing view often relies on idealistic assumptions that do not hold up under close scrutiny. I look forward to hearing your first point."
    
    responses = [
        f"That is an interesting point, but it overlooks a crucial factor. From the **{ai_pos}** perspective, your argument relies on an exception rather than the rule. If we apply your logic universally, it leads to significant contradictions. How do you address the systemic issues this would cause?",
        f"I hear your reasoning, but the broader evidence heavily favors the **{ai_pos}** stance. We must prioritize long-term consequences over short-term fixes. Your argument assumes a perfect scenario that rarely exists in reality.",
        f"You make a fair observation, however, it misses the deeper implications. Defending the **{ai_pos}** side means acknowledging the practical trade-offs. The points you propose could potentially create more problems than they solve.",
        f"While I understand where you are coming from, the logic from the **{ai_pos}** side remains much stronger. Your statement relies heavily on anecdotal assumptions. We need to look at the structural reality of the situation.",
        f"I fundamentally disagree with that premise. From a **{ai_pos}** standpoint, the risks you are downplaying are actually the most critical parts of this debate. You haven't fully addressed the negative externalities of your approach."
    ]
    
    return random.choice(responses)
