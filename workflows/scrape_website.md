# Scrape Website Workflow

Objective: Scrape a single website and save structured data.

Inputs:
- `tools/scrape_single_site.py` (tool)
- valid credentials in `.env`

Tools:
- Any deterministic Python script placed in `tools/`.

Outputs:
JSON lines file in `.tmp/` named `scrape-<site>.jsonl`

Steps:
1. Verify credentials in `.env`.
2. Run the tool with required flags and capture output to `.tmp/`.
3. Validate JSON lines and upload or persist as required.
