# Redrob Hackathon — Intelligent Candidate Ranking System

Ranks 100,000 candidates for a Senior AI Engineer role **without any API calls**, runs fully offline on CPU in ~15 seconds.

## Quick Start

```bash
pip install -r requirements.txt
python rank.py --candidates candidates.jsonl --out submission.csv
```

## How It Works

### The Problem with Keyword Matching
The JD explicitly warns: "The right answer is NOT find candidates whose skills section contains the most AI keywords."

A candidate titled "Marketing Manager" can have all the AI keywords — that's a keyword stuffer, not a fit. Our system catches this.

### Scoring Architecture

```
Final Score = 
    Core Skill Match    × 0.35   ← weighted by proficiency + endorsements
  + Career Fit          × 0.30   ← title + AI exp ratio + product company
  + Behavioral Signals  × 0.20   ← recency, response rate, availability
  + Education           × 0.05   ← institution tier
  + Location            × 0.05   ← Pune/Noida preferred
  + Nice-to-have Skills × 0.05
  − Keyword Stuffing Penalty     ← many skills, low endorsements
```

### Key Design Decisions

**1. Keyword stuffing penalty**
If a candidate lists 15+ skills but has an average of <5 endorsements per skill, they get penalized. Real engineers get endorsed for real skills.

**2. Career title filter**
The JD explicitly disqualifies: Marketing Managers, HR Managers, Accountants, Civil/Mechanical Engineers, Content Writers, Graphic Designers, Customer Support, Sales, Business Analysts, and Operations Managers regardless of their skill list.

**3. Consulting-only penalty**
Candidates whose entire career is at TCS/Infosys/Wipro/Accenture/Cognizant/Capgemini get penalized per JD's explicit statement.

**4. Behavioral signals**
- Last active > 180 days → heavily penalized
- Recruiter response rate < 10% → penalized
- Open to work flag → rewarded
- GitHub activity score → strong positive signal for engineers
- Notice period ≤ 30 days → preferred per JD

**5. AI experience ratio**
We compute what fraction of total career months were spent in AI/ML roles. A candidate with 8 years total but only 6 months in AI roles scores lower than one with 5 years total, all in ML.

## Files

```
rank.py                    ← main ranker (run this)
app.py                     ← Gradio demo for Hugging Face Spaces
requirements.txt           ← pip dependencies
submission.csv             ← output ranked candidates
submission_metadata.yaml   ← hackathon submission metadata
SPACE_README.md            ← README for HF Space (rename to README.md when deploying there)
README.md                  ← this file
deck/
  redrob_ranker_deck.pptx  ← presentation deck
  redrob_ranker_deck.pdf   ← PDF version for submission
data/
  sample_candidates.json   ← small sample for testing
  sample_candidates.jsonl  ← same sample in .jsonl format (for Gradio demo)
  job_description.txt      ← the JD this was built against
```

## Run the Gradio Demo Locally

```bash
pip install -r requirements.txt
python app.py
```

Open the printed local URL, upload `data/sample_candidates.jsonl`, and click "Rank Candidates".

## Deploy to Hugging Face Spaces

1. Create a new Space at huggingface.co → SDK: **Gradio**
2. Upload: `app.py`, `rank.py`, `requirements.txt`, `data/sample_candidates.jsonl`
3. Rename `SPACE_README.md` → `README.md` in the Space (it contains the required YAML header)
4. The Space builds automatically and gives you a public URL — use this as your `sandbox_link`


## Expected Output Format

```csv
candidate_id,rank,score,reasoning
CAND_0002025,1,0.6916,"Senior AI Engineer with 5.9 yrs; core skill match 0.66; ..."
```
