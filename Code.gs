/** Gmail auto-sync backend stub. Paste into Google Apps Script and deploy as Web App.
 * Search query extracts recruiting event emails; expand as needed.
 */
function doGet(){return ContentService.createTextOutput(JSON.stringify({updatedAt:new Date().toISOString(),events:[]})).setMimeType(ContentService.MimeType.JSON);}
