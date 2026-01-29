import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = headers();
    const rolloutToken = headersList.get("x-rollout-token");
    const clozeApiKey = headersList.get("X-CLOZE-API-Key");

    if (!rolloutToken) {
      return NextResponse.json({ error: "No rollout token provided" }, { status: 401 });
    }

    if (!clozeApiKey) {
      return NextResponse.json({ error: "No Cloze API key provided" }, { status: 400 });
    }

    // Fetch messages from Cloze API
   

    const url = `https://api.cloze.com/v1/messages/opens?api_key=${clozeApiKey}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching messages:", errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch messages' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // The API returns an array with a single object containing messages
    // Extract the messages array from the response
    if (Array.isArray(data) && data.length > 0) {
      return NextResponse.json(data[0]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
