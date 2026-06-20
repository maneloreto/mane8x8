# Entries — multi-user form backed by Google Sheets

A single-page web form that lets anyone in the 8x8 org add, edit, and delete
entries (first name / last name). Data lives in this Google Sheet:
`https://docs.google.com/spreadsheets/d/1E2fU3jdRYNRhpbUXu6SOERkkYoVmlaHEySOms_z6mPE/edit`

It runs as a **Google Apps Script web app** — no Google Cloud Console, no
service-account key, no separate hosting. The script runs as you (the deployer),
so users don't need direct access to the spreadsheet; they only need the app URL.

## Files

- `Code.gs` — server side: serves the page and handles read/add/update/delete.
- `Index.html` — the form UI (calls the server via `google.script.run`).
- `appsscript.json` — manifest. Web-app access is `DOMAIN` (8x8 org only),
  executing as the deployer.

## Deploy (copy-paste, ~5 minutes)

1. Go to <https://script.google.com> → **New project**.
2. **Project Settings** (gear icon) → tick **"Show appsscript.json manifest file
   in editor"**.
3. Recreate the three files with the **exact same names**:
   - `Code.gs` → paste the contents of `Code.gs`.
   - `appsscript.json` → paste the contents of `appsscript.json`.
   - **+ → HTML** named `Index` → paste the contents of `Index.html`.
     (Apps Script adds the `.html` automatically; the file must be called `Index`.)
4. Click **Deploy → New deployment**. Select type **Web app**.
   - Description: anything.
   - Execute as: **Me**.
   - Who has access: **Anyone within 8x8** (the org domain).
5. Click **Deploy**. The first time, Google asks you to **authorize** — approve
   the spreadsheet access (this is the deployer's own consent, not a Cloud
   Console client).
6. Copy the **Web app URL** and share it. That's the form.

> After any code change, do **Deploy → Manage deployments → edit (pencil) →
> Version: New version → Deploy** to publish it to the same URL.

## How it works

- The sheet's first tab (`gid=0`) gets a header row on first use:
  `ID | First Name | Last Name | Created | Updated`.
- Each entry has a generated `ID` (UUID) so edit/delete target the right row even
  if rows are reordered or other people are editing at the same time.
- `LockService` serializes writes, so concurrent users don't clobber each other.
- Everyone can edit/delete every entry (shared list, as chosen).

## Optional: manage via `clasp` (CLI) instead of copy-paste

If you'd rather push from this repo:

```bash
npm install -g @google/clasp
clasp login
clasp create --type webapp --title "Entries" --rootDir apps_script
clasp push
```

`clasp` also requires enabling the Apps Script API for your account at
<https://script.google.com/home/usersettings> (a per-user toggle, not Cloud
Console). If that toggle is also restricted, use the copy-paste path above.

## Changing fields

To add columns (e.g. email, team), update `HEADERS` in `Code.gs`, extend the
`clean_`, `getEntries`, `addEntry`, and `updateEntry` mappings, and add matching
inputs/cells in `Index.html`.
