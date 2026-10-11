# Auto-Publish e-Vedhika.Data.entry_bot.exe to GitHub Releases

This plan configures GitHub Actions to automatically publish `e-Vedhika.Data.entry_bot.exe` directly into the public **GitHub Releases** list (`/releases`), resolving the issue where builds only generated hidden temporary artifacts instead of visible GitHub Releases.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Cause Identified**: Currently, the workflow only runs `actions/upload-artifact@v4`. In GitHub, "Artifacts" are private developer downloads inside Actions, whereas "Releases" require a dedicated Release creation action with write permissions (`softprops/action-gh-release@v2`).

- **Confirmed Decision**: The user requested that builds directly appear in the **GitHub Release list** ("అప్డేట్ చేసింది Release list లోకి పోవడం లేదు github లోకి").
- **Release Strategy**:
  - Automatically create or update a GitHub Release (e.g. `v1.0.0` or latest rolling release tag) on push to `main` and on manual dispatch.
  - Attach `dist/e-Vedhika.Data.entry_bot.exe` directly to the release as a downloadable binary.
  - Add `permissions: contents: write` so GitHub Actions has permission to publish to the Releases page.

---

## 1. Overview & Core Concept

- **What It Delivers**:
  - Whenever you push code to GitHub (or run the workflow manually), GitHub will build the Windows `.exe` and automatically publish it to your repository's public **Releases** page (`https://github.com/<owner>/<repo>/releases`).
  - Anyone visiting the GitHub repository will see **Releases (v1.0.0)** on the right-hand sidebar and can download `e-Vedhika.Data.entry_bot.exe` in 1 click.
- **Target File**: `e-Vedhika.Data.entry_bot.exe`
- **Target Version**: `v.1.0.0` (strictly preserved)

---

## 2. Technical Architecture & Workflow Design

```
┌────────────────────────────────────────────────────────┐
│  GitHub Repository (main branch push / workflow run)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  GitHub Actions Runner (windows-latest)                │
│  - Sets up Python 3.11 & dependencies                  │
│  - PyInstaller compiles: e-Vedhika.Data.entry_bot.exe  │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌────────────────────────┐      ┌─────────────────────────────┐
│ 1. Actions Artifact    │      │ 2. Public GitHub Release    │
│    (Developer Backup)  │      │    (softprops/action-       │
│                        │      │     gh-release@v2)          │
│                        │      │    - Tag: v1.0.0            │
│                        │      │    - Asset: e-Vedhika.Data. │
│                        │      │      entry_bot.exe          │
│                        │      │    - Appears in Releases    │
│                        │      │      tab on GitHub!         │
└────────────────────────┘      └─────────────────────────────┘
```

---

## 3. Implementation Steps

### Step 1: Update `.github/workflows/build-exe.yml`
- Add `permissions: contents: write` to the job.
- Keep `upload-artifact@v4` as backup.
- Add `softprops/action-gh-release@v2`:
  - `tag_name: "v1.0.0"`
  - `name: "e-Vedhika Data Entry Bot v1.0.0"`
  - `files: dist/e-Vedhika.Data.entry_bot.exe`
  - `token: ${{ secrets.GITHUB_TOKEN }}`
  - `draft: false`
  - `prerelease: false`

### Step 2: Update `ExeGeneratorModal.tsx`
- Sync the copyable workflow text in the modal to match the automated GitHub Release creation steps.
- Explain in Telugu and English how the executable appears on the GitHub Releases page.

### Step 3: Verification
- Verify applet builds (`compile_applet`) and passes linter (`lint_applet`).
- Ensure version remains `v.1.0.0`.
