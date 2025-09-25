const VAPI_BASE_URL = "https://api.vapi.ai";
const VAPI_PUBLIC_KEY = process.env.VAPI_PUBLIC_KEY;

if (!VAPI_PUBLIC_KEY) {
  throw new Error("VAPI_PUBLIC_KEY is not set in environment variables");
}

export async function getAvailablePhoneNumbers() {
  const res = await fetch(`${VAPI_BASE_URL}/phone-number`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${VAPI_PUBLIC_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch phone numbers");
  // The API returns an array of phone number objects
  return res.json();
}

export async function createPhoneNumber(userId: string) {
  const res = await fetch(`${VAPI_BASE_URL}/phone-number`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_PUBLIC_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sipUri: `sip:${userId}@sip.vapi.ai`,
      assistantId: process.env.VAPI_ASSISTANT_ID,
      provider: "vapi",
    }), // Adjust country as needed
  });
  const data = await res.json();

  if (!data.id) throw new Error("Failed to create phone number");
  return data;
}
