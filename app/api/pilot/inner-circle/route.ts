import { NextResponse } from "next/server";
import { saveInnerCircle } from "@/lib/pilot/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    if (!body.publicUseAcknowledgement) {
      return NextResponse.json({ error: "Please acknowledge the public-use permission statement." }, { status: 400 });
    }

    const saved = await saveInnerCircle({
      name: body.name,
      email: body.email,
      phone: body.phone,
      willing: Boolean(body.willing),
      futureFeedbackPermission: Boolean(body.futureFeedbackPermission),
      storyInterviewPermission: Boolean(body.storyInterviewPermission),
      publicUseAcknowledgement: Boolean(body.publicUseAcknowledgement),
    });

    return NextResponse.json({ ok: true, ...saved });
  } catch (error) {
    console.error("Inner Circle submission failed", error);
    return NextResponse.json({ error: "We could not save your response yet. Please try again." }, { status: 500 });
  }
}
