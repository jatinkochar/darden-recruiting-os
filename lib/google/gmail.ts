export type GmailMessageForParsing = {
  subject: string;
  body: string;
  from?: string;
};

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

function decodeBase64Url(data?: string) {
  if (!data) return "";
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(normalized, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function flattenParts(payload: any): string {
  if (!payload) return "";
  let text = decodeBase64Url(payload.body?.data);

  if (payload.parts?.length) {
    text += "\n" + payload.parts.map(flattenParts).join("\n");
  }

  return text;
}

export async function fetchRecruitingGmailMessages(accessToken: string): Promise<GmailMessageForParsing[]> {
  const query = [
    "(McKinsey OR Bain OR BCG OR Darden OR",
    '"Add to Calendar" OR "Access Event" OR RSVP OR register OR registered OR confirmed OR Zoom OR Teams OR "Google Meet")',
    "newer_than:365d"
  ].join(" ");

  const listUrl = `${GMAIL_API}/messages?maxResults=50&q=${encodeURIComponent(query)}`;

  const listResponse = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!listResponse.ok) {
    const text = await listResponse.text();
    throw new Error(`Gmail list failed: ${text}`);
  }

  const list = await listResponse.json();
  const messages = list.messages || [];

  const parsed: GmailMessageForParsing[] = [];

  for (const message of messages) {
    const detailResponse = await fetch(`${GMAIL_API}/messages/${message.id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!detailResponse.ok) continue;

    const detail = await detailResponse.json();
    const headers = detail.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

    parsed.push({
      subject: getHeader("Subject"),
      from: getHeader("From"),
      body: flattenParts(detail.payload)
    });
  }

  return parsed;
}
