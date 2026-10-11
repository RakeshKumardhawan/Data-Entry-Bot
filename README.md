# Data Entry Bot - Gram Panchayat Portal Automation

A web-based automation companion and data entry platform imported and migrated from Python Selenium bot to React + Vite.

## Features
- **Portal Selection**:
  - `1. TMP Portal` (TMP పోర్టల్ డేటా ఎంట్రీ)
  - `2. Other Portal` (వేరే పోర్టల్ ఎంట్రీ)
- **Gram Panchayat Batch Handling**:
  - Batch target file support (`<gp_name>.xlsx`, e.g., `Akkalapalli.xlsx`).
  - Preloaded sample data for Akkalapalli, Gollapalli, Kothapalli, Rampur.
- **Duplicate Mobile Validation**:
  - Highlights repeated numbers in Telugu and English:
    `హెచ్చరిక: Excel లో రిపీట్ అయిన మొబైల్ నంబర్లు ఉన్నాయి!`
  - Exact prompt matching:
    `ఈ రిపీటెడ్ నంబర్లను మార్చి మళ్ళీ రన్ చేస్తారా? లేక ఇలాగే కంటిన్యూ చేయాలా? (y=continue / n=stop)`
  - Direct in-table editing and 1-click auto-fix / deduplication.
- **Bot Automation Simulation**:
  - Real-time field entry simulation (Browser viewport and CLI terminal view).
  - Progress tracking, playback speed controls (1x, 2x, Turbo), pause/resume.
- **Update Checker**:
  - Checks update status (`check_for_updates()`).
- **Excel Ingestion & Export**:
  - Client-side `.xlsx` spreadsheet upload, preview, and download.
