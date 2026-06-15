"""
Gradio demo wrapper for Hugging Face Spaces.
Lets reviewers upload a small candidates.jsonl sample and see ranked results.

Run locally:
    python app.py

Deploy to HF Spaces:
    1. Create a new Space (SDK: Gradio)
    2. Push this repo (app.py, rank.py, requirements.txt)
    3. Space auto-builds and launches
"""

import json
import tempfile
import pandas as pd
import gradio as gr

from rank import compute_final_score


def rank_candidates_file(file_obj, top_n):
    """
    Read an uploaded .jsonl file, score every candidate,
    and return a ranked DataFrame.
    """
    if file_obj is None:
        return pd.DataFrame(), "Please upload a candidates.jsonl file."

    candidates = []
    with open(file_obj, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    candidates.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    if not candidates:
        return pd.DataFrame(), "No valid JSON lines found in the file."

    results = []
    for i, c in enumerate(candidates):
        cid = c.get("candidate_id", f"CAND_{i:07d}")
        profile = c.get("profile", {})
        final_score, components, reasoning = compute_final_score(c)
        results.append({
            "rank": 0,  # placeholder, set after sorting
            "candidate_id": cid,
            "name": profile.get("anonymized_name", ""),
            "title": profile.get("current_title", ""),
            "years_exp": profile.get("years_of_experience", 0),
            "score": round(final_score, 4),
            "skill": components["must_skill"],
            "career": components["career_score"],
            "behavioral": components["behavioral_score"],
            "reasoning": reasoning,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    for r, row in enumerate(results, start=1):
        row["rank"] = r

    top_n = int(top_n)
    df = pd.DataFrame(results[:top_n])
    status = f"Scored {len(candidates):,} candidates. Showing top {min(top_n, len(results))}."
    return df, status


def export_full_csv(file_obj):
    """Run ranking on the full uploaded file and return a downloadable CSV."""
    if file_obj is None:
        return None

    candidates = []
    with open(file_obj, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    candidates.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    results = []
    for i, c in enumerate(candidates):
        cid = c.get("candidate_id", f"CAND_{i:07d}")
        final_score, _, reasoning = compute_final_score(c)
        results.append({
            "candidate_id": cid,
            "score": round(final_score, 4),
            "reasoning": reasoning,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    for r, row in enumerate(results, start=1):
        row["rank"] = r

    df = pd.DataFrame(results)
    df = df[["candidate_id", "rank", "score", "reasoning"]]

    out_path = tempfile.NamedTemporaryFile(
        delete=False, suffix=".csv", mode="w", encoding="utf-8"
    ).name
    df.to_csv(out_path, index=False)
    return out_path


# ─────────────────────────────────────────────────────────────
# UI
# ─────────────────────────────────────────────────────────────
with gr.Blocks(title="Redrob Candidate Ranker") as demo:
    gr.Markdown(
        """
        # Redrob Candidate Ranker — Sandbox Demo

        Upload a `candidates.jsonl` file (one JSON object per line) and the ranker
        will score every candidate against the **Senior AI Engineer** job description
        using a multi-signal weighted model.

        **No API calls. No GPU. Runs entirely on CPU.**

        Try it with the included `sample_candidates.json` (a small subset) or your
        own `candidates.jsonl`.
        """
    )

    with gr.Row():
        file_input = gr.File(label="Upload candidates.jsonl", file_types=[".jsonl", ".json"])
        top_n_input = gr.Slider(
            minimum=5, maximum=100, value=20, step=5,
            label="How many top candidates to display"
        )

    run_btn = gr.Button("Rank Candidates", variant="primary")
    status_box = gr.Markdown()
    results_table = gr.Dataframe(
        headers=["rank", "candidate_id", "name", "title", "years_exp",
                 "score", "skill", "career", "behavioral", "reasoning"],
        wrap=True,
    )

    run_btn.click(
        fn=rank_candidates_file,
        inputs=[file_input, top_n_input],
        outputs=[results_table, status_box],
    )

    gr.Markdown("---")
    gr.Markdown("### Export full ranked submission.csv")
    export_btn = gr.Button("Generate submission.csv (full file)")
    download_file = gr.File(label="Download ranked CSV")

    export_btn.click(
        fn=export_full_csv,
        inputs=[file_input],
        outputs=[download_file],
    )

    gr.Markdown(
        """
        ---
        **Methodology (summary):**
        Final score = 0.35 × skill match + 0.30 × career fit + 0.20 × behavioral
        signals + 0.05 × education + 0.05 × location + 0.05 × nice-to-have skills,
        minus a keyword-stuffing penalty. See `README.md` for full details.
        """
    )


if __name__ == "__main__":
    demo.launch()
