import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, location } = await req.json();

    if (!process.env.JSEARCH_API_KEY) {
      return NextResponse.json(
        { error: "JSEARCH_API_KEY is missing" },
        { status: 500 }
      );
    }

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      query
    )}&location=${encodeURIComponent(location)}&num_pages=1`;

    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": process.env.JSEARCH_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    const data = await response.json();

    return NextResponse.json(data.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
