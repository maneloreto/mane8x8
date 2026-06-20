/**
 * Multi-user CRUD web form backed by a Google Sheet.
 *
 * Runs entirely inside Google Apps Script — no Cloud Console, no credentials,
 * no external hosting. The deployed web app executes as the deployer, so end
 * users never need direct access to the spreadsheet.
 *
 * Deploy: Apps Script editor > Deploy > New deployment > type "Web app".
 * See README.md in this folder for full steps.
 */

// ---- Configuration ---------------------------------------------------------
// Spreadsheet to read/write. This is the ID from your sheet URL:
// https://docs.google.com/spreadsheets/d/<THIS PART>/edit
var SPREADSHEET_ID = '1E2fU3jdRYNRhpbUXu6SOERkkYoVmlaHEySOms_z6mPE';
// The tab to use. gid=0 in the URL is the first tab.
var SHEET_GID = 0;
// Column layout (row 1 of the sheet). Created/Updated are managed automatically.
var HEADERS = ['ID', 'First Name', 'Last Name', 'Created', 'Updated'];
// ---------------------------------------------------------------------------

/** Serves the single-page form. */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Entries')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Resolves the target sheet, creating the header row if the tab is empty. */
function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheets().filter(function (s) {
    return s.getSheetId() === SHEET_GID;
  })[0] || ss.getSheets()[0];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Finds the 1-based row number for a given entry ID, or -1 if not found. */
function findRowById_(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

/** Safely converts a cell value (Date, string, or blank) to an ISO string, or ''. */
function toIso_(v) {
  if (v === '' || v === null || v === undefined) return '';
  var d = (v instanceof Date) ? v : new Date(v);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

/** Trims and validates form input; throws on missing required fields. */
function clean_(data) {
  var firstName = (data && data.firstName ? String(data.firstName) : '').trim();
  var lastName = (data && data.lastName ? String(data.lastName) : '').trim();
  if (!firstName && !lastName) {
    throw new Error('Please enter a first or last name.');
  }
  return { firstName: firstName, lastName: lastName };
}

/** Returns all entries as an array of {id, firstName, lastName, created, updated}. */
function getEntries() {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return values
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      return {
        id: r[0],
        firstName: r[1],
        lastName: r[2],
        created: toIso_(r[3]),
        updated: toIso_(r[4])
      };
    });
}

/** Appends a new entry. Returns the full updated list. */
function addEntry(data) {
  var fields = clean_(data);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var now = new Date();
    sheet.appendRow([Utilities.getUuid(), fields.firstName, fields.lastName, now, now]);
  } finally {
    lock.releaseLock();
  }
  return getEntries();
}

/** Updates first/last name for an existing entry. Returns the full updated list. */
function updateEntry(data) {
  var fields = clean_(data);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var row = findRowById_(sheet, data.id);
    if (row === -1) throw new Error('That entry no longer exists.');
    sheet.getRange(row, 2, 1, 2).setValues([[fields.firstName, fields.lastName]]);
    sheet.getRange(row, 5).setValue(new Date());
  } finally {
    lock.releaseLock();
  }
  return getEntries();
}

/** Deletes an entry by ID. Returns the full updated list. */
function deleteEntry(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var row = findRowById_(sheet, id);
    if (row === -1) throw new Error('That entry no longer exists.');
    sheet.deleteRow(row);
  } finally {
    lock.releaseLock();
  }
  return getEntries();
}
