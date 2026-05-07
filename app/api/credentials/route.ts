import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const headersList = headers();
  const rolloutToken = headersList.get("x-rollout-token");

  if (!rolloutToken) {
    return NextResponse.json(
      { error: "No rollout token provided" },
      { status: 401 }
    );
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const appKey = searchParams.get("appKey");
  const includeData = searchParams.get("includeData");

  if (!appKey) {
    return NextResponse.json(
      { error: "appKey query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`https://universal.rollout.com/api/credentials`);
    url.searchParams.set("appKey", appKey);
    if (includeData) {
      url.searchParams.set("includeData", includeData);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${rolloutToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch credentials" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
