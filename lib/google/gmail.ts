export type GmailMessageForParsing = {
  subject: string;
  body: string;
  from?: string;
};

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

function decodeBase64Url(data?: string) {
  if (!data) return "";

  try {
    return Buffer.from(
      data.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf-8");
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

function headerValue(headers: any[], name: string) {
  return headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

export async function fetchRecruitingGmailMessages(
  accessToken: string,
): Promise<GmailMessageForParsing[]> {
  /*
    Intentionally generic.

    Do not limit to only MBB/Darden. The parser decides whether the message is
    a recruiting event. The Gmail query only narrows to emails that are likely
    to contain event/recruiting language, while excluding obvious personal,
    payment, security, order, and receipt emails.
  */
  const query = [
    "(",
    '"coffee chat" OR',
    '"office hours" OR',
    '"office spotlight" OR',
    '"information session" OR',
    '"info session" OR',
    '"career fair" OR',
    '"resume review" OR',
    '"case workshop" OR',
    '"campus recruiting" OR',
    '"add to calendar" OR',
    '"calendar invite" OR',
    '"Google Meet" OR',
    "Zoom OR",
    "Webex OR",
    "Teams OR",
    "RSVP OR",
    "webinar OR",
    "interview OR",
    "recruiting OR",
    "careers OR",
    "registered OR",
    "confirmed OR",
    "invitation",
    ")",
    "newer_than:365d",
    "-subject:(receipt OR invoice OR payment OR transaction OR statement OR refund OR order OR shipped OR delivered OR OTP OR verification OR password)",
    "-from:(bank OR noreply@paypal.com OR no-reply@amazon OR amazon.in OR swiggy OR zomato OR uber)",
  ].join(" ");

  const listResponse = await fetch(
    `${GMAIL_API}/messages?maxResults=150&q=${encodeURIComponent(query)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!listResponse.ok) {
    throw new Error(`Gmail list failed: ${await listResponse.text()}`);
  }

  const list = await listResponse.json();
  const parsed: GmailMessageForParsing[] = [];

  for (const message of list.messages || []) {
    const detailResponse = await fetch(
      `${GMAIL_API}/messages/${message.id}?format=full`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!detailResponse.ok) continue;

    const detail = await detailResponse.json();
    const headers = detail.payload?.headers || [];

    parsed.push({
      subject: headerValue(headers, "Subject"),
      from: headerValue(headers, "From"),
      body: flattenParts(detail.payload),
    });
  }

  return parsed;
}
