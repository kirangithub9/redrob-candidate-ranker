"""
Redrob Hackathon — Intelligent Candidate Ranking System
========================================================
No API calls. Runs fully offline on CPU.
Command: python rank.py --candidates candidates.jsonl --out submission.csv
"""

import json
import math
import argparse
import csv
import re
from datetime import datetime, timezone

# ─────────────────────────────────────────────────────────────
# JD SIGNALS — extracted from the job_description.docx
# "Senior AI Engineer, Founding Team" at Redrob AI
# ─────────────────────────────────────────────────────────────

# Hard must-have skills (production, not just listed)
MUST_HAVE_SKILLS = {
    "embeddings", "sentence-transformers", "vector database", "pinecone",
    "weaviate", "qdrant", "milvus", "faiss", "opensearch", "elasticsearch",
    "retrieval", "ranking", "reranking", "hybrid search", "dense retrieval",
    "bm25", "ndcg", "mrr", "map", "a/b testing", "evaluation framework",
    "fine-tuning", "lora", "qlora", "peft", "llm", "transformer",
    "nlp", "information retrieval", "recommendation system", "search",
    "python", "pytorch", "tensorflow", "hugging face",
    "e5", "bge", "sentence transformers", "openai embeddings",
}

# Nice-to-have skills
NICE_TO_HAVE_SKILLS = {
    "xgboost", "learning to rank", "distributed systems", "kafka",
    "spark", "airflow", "mlflow", "weights & biases", "ray",
    "feature engineering", "statistical modeling", "data pipeline",
    "open source", "github", "rag", "langchain", "llamaindex",
    "image classification", "speech recognition", "tts", "gans",
}

# Explicit disqualifiers from JD
DISQUALIFIER_TITLES = {
    "marketing manager", "accountant", "hr manager", "civil engineer",
    "mechanical engineer", "graphic designer", "customer support",
    "content writer", "sales executive", "business analyst",
    "operations manager", "project manager",
}

# Consulting firms explicitly mentioned as bad signal
CONSULTING_FIRMS = {
    "tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini",
    "hcl", "tech mahindra", "mindtree",
}

# Strong positive title signals
STRONG_TITLES = {
    "ml engineer", "machine learning engineer", "ai engineer",
    "senior ml engineer", "senior ai engineer", "data scientist",
    "research engineer", "applied scientist", "nlp engineer",
    "search engineer", "ranking engineer", "recommendation engineer",
    "founding engineer", "staff ml engineer", "principal ml engineer",
}

# ─────────────────────────────────────────────────────────────
# SCORING ENGINE
# ─────────────────────────────────────────────────────────────

def normalize(val, lo, hi):
    """Clamp and normalize val to [0,1] between lo and hi."""
    if hi == lo:
        return 0.5
    return max(0.0, min(1.0, (val - lo) / (hi - lo)))


def has_keyword(text: str, keyword: str) -> bool:
    """
    Match `keyword` as a whole word/phrase inside `text` using word
    boundaries. Plain substring checks ("kw in text") cause false
    positives for short tokens — e.g. "llm" matches inside "fulfillment",
    "ai" matches inside "maintain", "search" matches inside "research".
    Word-boundary regex avoids all of these.
    """
    pattern = r'\b' + re.escape(keyword) + r'\b'
    return re.search(pattern, text) is not None


def has_any_keyword(text: str, keywords) -> bool:
    """Return True if any keyword in `keywords` matches `text` as a whole word/phrase."""
    return any(has_keyword(text, kw) for kw in keywords)


def score_skills(candidate: dict) -> tuple:
    """
    Score skills based on:
    - Must-have matches (weighted by proficiency + endorsements)
    - Nice-to-have matches
    - Keyword stuffing penalty (many skills, few endorsements)
    Returns (must_score, nice_score, stuffing_penalty)
    """
    skills = candidate.get("skills", [])
    if not skills:
        return 0.0, 0.0, 0.0

    proficiency_weight = {"advanced": 1.0, "intermediate": 0.7, "beginner": 0.4}
    skill_assessment = candidate.get("redrob_signals", {}).get("skill_assessment_scores", {})

    must_score = 0.0
    nice_score = 0.0
    total_endorsements = 0
    total_skills = len(skills)

    for s in skills:
        name_lower = s.get("name", "").lower()
        prof = proficiency_weight.get(s.get("proficiency", "beginner"), 0.4)
        endorse = min(s.get("endorsements", 0), 50) / 50  # cap at 50
        duration = min(s.get("duration_months", 0), 36) / 36  # cap at 3 yrs

        # Check if assessed — strong trust signal
        assessed_bonus = 0.2 if s.get("name") in skill_assessment else 0.0

        skill_weight = (prof * 0.5) + (endorse * 0.3) + (duration * 0.2) + assessed_bonus
        total_endorsements += s.get("endorsements", 0)

        # Match against must-haves
        matched_must = any(kw in name_lower for kw in MUST_HAVE_SKILLS)
        matched_nice = any(kw in name_lower for kw in NICE_TO_HAVE_SKILLS)

        if matched_must:
            must_score += skill_weight
        elif matched_nice:
            nice_score += skill_weight * 0.5

    # Normalize
    must_score = min(must_score / max(len(MUST_HAVE_SKILLS) * 0.3, 1), 1.0)
    nice_score = min(nice_score / 3.0, 1.0)

    # Keyword stuffing penalty: many skills but few total endorsements
    avg_endorse = total_endorsements / max(total_skills, 1)
    stuffing_penalty = max(0.0, 0.3 - (avg_endorse / 50) * 0.3) if total_skills > 10 else 0.0

    return must_score, nice_score, stuffing_penalty


def score_career(candidate: dict) -> tuple:
    """
    Score based on:
    - Current/recent title alignment
    - Career history relevance
    - Product company vs consulting-only signal
    - Job hopping detection
    - Years of relevant AI experience
    """
    profile = candidate.get("profile", {})
    career = candidate.get("career_history", [])

    current_title = profile.get("current_title", "").lower()
    yoe = profile.get("years_of_experience", 0)

    # Title match score
    # IMPORTANT: check disqualifiers and exact strong-title matches BEFORE
    # the generic "engineer"/"scientist" substring check. Otherwise titles
    # like "Mechanical Engineer" or "Civil Engineer" match "engineer" and
    # get a 0.6 bonus instead of being correctly disqualified.
    title_score = 0.0
    if any(t in current_title for t in DISQUALIFIER_TITLES):
        title_score = 0.05
    elif any(t in current_title for t in STRONG_TITLES):
        title_score = 1.0
    elif "engineer" in current_title or "scientist" in current_title:
        title_score = 0.6

    # Career history analysis
    ai_months = 0
    product_company_months = 0
    consulting_only = True
    total_months = 0
    tenures = []

    for job in career:
        company = job.get("company", "").lower()
        title = job.get("title", "").lower()
        duration = job.get("duration_months", 0)
        desc = job.get("description", "").lower()
        total_months += duration
        tenures.append(duration)

        # AI relevance in title or description.
        # Uses has_any_keyword (word-boundary regex) to avoid false
        # positives like "llm" matching inside "fulfillment", or "ai"
        # matching inside "maintain"/"chair".
        is_ai_role = has_any_keyword(title, ["ml", "ai", "machine learning", "data scientist", "nlp", "search"])
        is_ai_desc = has_any_keyword(desc, [
            "embedding", "retrieval", "ranking model", "reranking", "llm",
            "vector database", "vector search", "nlp", "machine learning model",
            "ml model", "recommendation system", "language model",
        ])
        if is_ai_role or is_ai_desc:
            ai_months += duration

        # Product vs consulting
        if not any(firm in company for firm in CONSULTING_FIRMS):
            product_company_months += duration
            consulting_only = False

    # YoE score — ideal is 5-9 years
    if 5 <= yoe <= 9:
        yoe_score = 1.0
    elif 4 <= yoe < 5:
        yoe_score = 0.8
    elif 9 < yoe <= 12:
        yoe_score = 0.7
    elif 3 <= yoe < 4:
        yoe_score = 0.5
    else:
        yoe_score = 0.3

    # AI experience ratio
    ai_ratio = ai_months / max(total_months, 1)
    ai_exp_score = min(ai_ratio * 1.5, 1.0)  # 67%+ AI roles → full score

    # Product company signal
    product_ratio = product_company_months / max(total_months, 1)
    product_score = min(product_ratio * 1.2, 1.0)

    # Consulting-only penalty
    consulting_penalty = 0.4 if consulting_only else 0.0

    # Job hopping penalty: avg tenure < 12 months
    avg_tenure = sum(tenures) / max(len(tenures), 1) if tenures else 0
    hopping_penalty = 0.3 if avg_tenure < 12 else (0.1 if avg_tenure < 18 else 0.0)

    career_score = (
        title_score * 0.35 +
        ai_exp_score * 0.30 +
        product_score * 0.20 +
        yoe_score * 0.15
    ) - consulting_penalty - hopping_penalty

    # JD explicitly disqualifies certain titles "regardless of other
    # signals" — cap career_score so strong YoE/product-company history
    # cannot compensate for a disqualifying current title.
    if title_score <= 0.05:
        career_score = min(career_score, 0.20)

    return max(0.0, min(1.0, career_score)), title_score


def score_behavioral(candidate: dict) -> float:
    """
    Score platform behavioral signals from redrob_signals.
    This is the 'availability and engagement' signal.
    A great-on-paper candidate who hasn't logged in for 6 months
    and has 5% recruiter response rate should be downweighted.
    """
    signals = candidate.get("redrob_signals", {})

    # Recency — last active
    last_active_str = signals.get("last_active_date")
    recency_score = 0.5
    if last_active_str:
        try:
            last_active = datetime.fromisoformat(last_active_str).replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            days_inactive = (now - last_active).days
            if days_inactive <= 30:
                recency_score = 1.0
            elif days_inactive <= 90:
                recency_score = 0.8
            elif days_inactive <= 180:
                recency_score = 0.5
            elif days_inactive <= 365:
                recency_score = 0.3
            else:
                recency_score = 0.1
        except Exception:
            recency_score = 0.5

    # Open to work flag
    open_to_work = 1.0 if signals.get("open_to_work_flag") else 0.3

    # Recruiter response rate
    response_rate = signals.get("recruiter_response_rate", 0.3)
    if response_rate < 0:
        response_rate = 0.3  # unknown → neutral

    # Profile completeness
    completeness = signals.get("profile_completeness_score", 50) / 100

    # GitHub activity (strong signal for engineers)
    github = signals.get("github_activity_score", -1)
    github_score = min(github / 100, 1.0) if github >= 0 else 0.2

    # Notice period — JD prefers sub-30 days
    notice = signals.get("notice_period_days", 60)
    if notice <= 30:
        notice_score = 1.0
    elif notice <= 60:
        notice_score = 0.7
    elif notice <= 90:
        notice_score = 0.4
    else:
        notice_score = 0.2

    # Verification signals
    verified = (
        (0.5 if signals.get("verified_email") else 0) +
        (0.5 if signals.get("verified_phone") else 0)
    )

    behavioral_score = (
        recency_score   * 0.25 +
        open_to_work    * 0.20 +
        response_rate   * 0.20 +
        completeness    * 0.10 +
        github_score    * 0.10 +
        notice_score    * 0.10 +
        verified        * 0.05
    )

    return max(0.0, min(1.0, behavioral_score))


def score_education(candidate: dict) -> float:
    """Score education tier — JD doesn't hard-require tier-1 but it's a signal."""
    edu = candidate.get("education", [])
    if not edu:
        return 0.4

    tier_scores = {"tier_1": 1.0, "tier_2": 0.8, "tier_3": 0.6, "tier_4": 0.4, "tier_5": 0.3}
    degree_scores = {"ph.d": 1.0, "phd": 1.0, "m.tech": 0.9, "m.e.": 0.85, "m.sc": 0.8,
                     "mba": 0.7, "b.tech": 0.75, "b.e.": 0.7, "b.sc": 0.6}

    best = 0.0
    for e in edu:
        tier = tier_scores.get(e.get("tier", "tier_4"), 0.4)
        degree = e.get("degree", "").lower()
        deg_score = max((v for k, v in degree_scores.items() if k in degree), default=0.5)
        best = max(best, (tier * 0.6 + deg_score * 0.4))

    return best


def score_location(candidate: dict) -> float:
    """Score location preference — Pune/Noida preferred, India OK, international low."""
    profile = candidate.get("profile", {})
    signals = candidate.get("redrob_signals", {})

    location = (profile.get("location") or "").lower()
    country = (profile.get("country") or "").lower()
    willing_to_relocate = signals.get("willing_to_relocate", False)

    preferred_cities = {"pune", "noida", "delhi", "delhi ncr", "gurugram", "gurgaon",
                        "hyderabad", "mumbai", "bangalore", "bengaluru"}

    if any(city in location for city in preferred_cities):
        return 1.0
    if country == "india":
        return 0.8 if willing_to_relocate else 0.6
    # International — JD says case-by-case
    return 0.5 if willing_to_relocate else 0.2


def compute_final_score(candidate: dict) -> tuple:
    """
    Weighted combination of all signals.
    Returns (final_score, component_dict, reasoning_str)
    """
    must_skill, nice_skill, stuff_pen = score_skills(candidate)
    career_score, title_score = score_career(candidate)
    behavioral_score = score_behavioral(candidate)
    edu_score = score_education(candidate)
    loc_score = score_location(candidate)

    # Weights — career + skills dominate per JD intent
    raw_score = (
        must_skill      * 0.35 +   # Core technical skills
        career_score    * 0.30 +   # Career history + title
        behavioral_score* 0.20 +   # Platform signals / availability
        edu_score       * 0.05 +   # Education
        loc_score       * 0.05 +   # Location
        nice_skill      * 0.05     # Nice-to-have skills
    ) - stuff_pen                  # Keyword stuffing penalty

    final_score = max(0.0, min(1.0, raw_score))

    profile = candidate.get("profile", {})
    signals = candidate.get("redrob_signals", {})

    reasoning = (
        f"{profile.get('current_title','?')} with {profile.get('years_of_experience',0):.1f} yrs; "
        f"core skill match {must_skill:.2f}; "
        f"career fit {career_score:.2f}; "
        f"behavioral {behavioral_score:.2f}; "
        f"response rate {signals.get('recruiter_response_rate',0):.2f}."
    )

    components = {
        "must_skill": round(must_skill, 4),
        "nice_skill": round(nice_skill, 4),
        "stuffing_penalty": round(stuff_pen, 4),
        "career_score": round(career_score, 4),
        "title_score": round(title_score, 4),
        "behavioral_score": round(behavioral_score, 4),
        "edu_score": round(edu_score, 4),
        "loc_score": round(loc_score, 4),
        "final_score": round(final_score, 4),
    }

    return final_score, components, reasoning


# ─────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Redrob Candidate Ranker")
    parser.add_argument("--candidates", default="candidates.jsonl", help="Path to candidates.jsonl")
    parser.add_argument("--out", default="submission.csv", help="Output CSV path")
    parser.add_argument("--top", type=int, default=100, help="Number of candidates to output")
    args = parser.parse_args()

    print(f"Loading candidates from {args.candidates}...")
    candidates = []
    with open(args.candidates, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                candidates.append(json.loads(line))
    print(f"Loaded {len(candidates):,} candidates")

    print("Scoring candidates...")
    results = []
    for i, c in enumerate(candidates):
        if (i + 1) % 10000 == 0:
            print(f"  Scored {i+1:,}/{len(candidates):,}")

        cid = c.get("candidate_id", f"CAND_{i:07d}")
        final_score, components, reasoning = compute_final_score(c)
        results.append({
            "candidate_id": cid,
            "score": final_score,
            "reasoning": reasoning,
            **components,
        })

    # Sort descending by score
    results.sort(key=lambda x: x["score"], reverse=True)

    # Assign ranks
    for rank, r in enumerate(results, start=1):
        r["rank"] = rank

    # Write submission CSV (required format: candidate_id, rank, score, reasoning)
    top_n = results[:args.top]
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["candidate_id", "rank", "score", "reasoning"])
        writer.writeheader()
        for r in top_n:
            writer.writerow({
                "candidate_id": r["candidate_id"],
                "rank": r["rank"],
                "score": round(r["score"], 4),
                "reasoning": r["reasoning"],
            })

    print(f"\nTop {args.top} candidates written to {args.out}")
    print("\nTOP 10 CANDIDATES:")
    print(f"{'Rank':<6} {'ID':<15} {'Score':<8} Summary")
    print("-" * 80)
    for r in top_n[:10]:
        print(f"#{r['rank']:<5} {r['candidate_id']:<15} {r['score']:.4f}  {r['reasoning'][:60]}")

    # Stats
    scores = [r["score"] for r in results]
    print(f"\nScore distribution:")
    print(f"  Max:    {max(scores):.4f}")
    print(f"  P90:    {sorted(scores)[int(len(scores)*0.9)]:.4f}")
    print(f"  Median: {sorted(scores)[len(scores)//2]:.4f}")
    print(f"  P10:    {sorted(scores)[int(len(scores)*0.1)]:.4f}")
    print(f"  Min:    {min(scores):.4f}")


if __name__ == "__main__":
    main()
