from fastapi import APIRouter, HTTPException
from services.topics_data import get_all_topics, get_topics_for_domain
from schemas import TopicsResponse, TopicDomain

router = APIRouter(prefix="/topics", tags=["Topics"])

@router.get("", response_model=TopicsResponse)
def get_topics():
    topics_dict = get_all_topics()
    domains = [TopicDomain(name=k, topics=v) for k, v in topics_dict.items()]
    return TopicsResponse(domains=domains)

@router.get("/{domain}")
def get_domain_topics(domain: str):
    if domain == "toss-question":
        import random
        from schemas import TossQuestionResponse
        questions = [
            {"question": "What is the primary objective of a 'Devil's Advocate'?", "options": ["To agree with everyone", "To provoke debate by arguing against the consensus", "To summarize the debate", "To make the debate longer"], "correct_index": 1},
            {"question": "Which logical fallacy involves attacking the person rather than their argument?", "options": ["Straw Man", "Ad Hominem", "Slippery Slope", "False Dilemma"], "correct_index": 1},
            {"question": "In a formal debate, what is a 'rebuttal'?", "options": ["A closing statement", "A counter-argument to the opponent's points", "The opening statement", "A neutral summary"], "correct_index": 1},
            {"question": "What does 'burden of proof' mean?", "options": ["The obligation to provide evidence for a claim", "A heavy argument", "The time limit of a speech", "The final score of the debate"], "correct_index": 0},
            {"question": "Which of these is a valid way to support an argument?", "options": ["Personal insult", "Logical reasoning and evidence", "Speaking louder", "Ignoring the opponent"], "correct_index": 1}
        ]
        return TossQuestionResponse(**random.choice(questions))

    topics = get_topics_for_domain(domain)
    if not topics:
        raise HTTPException(status_code=404, detail="Domain not found")
    return {"domain": domain, "topics": topics}
