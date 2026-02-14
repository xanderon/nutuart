import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const defaultRecipients = ["marcelnutu@yahoo.com"];

const resend =
  resendApiKey && resendApiKey !== ""
    ? new Resend(resendApiKey)
    : null;

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const buildEmail = ({
  name,
  email,
  phone,
  message,
}: ContactPayload) => {
  const lines = [
    name && `Nume: ${name}`,
    email && `Email: ${email}`,
    phone && `Telefon: ${phone}`,
    message && `Mesaj:\n${message}`,
  ]
    .filter(Boolean)
    .join("\n");

  return lines || "Mesaj gol.";
};

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name) {
    return NextResponse.json(
      { error: "Completează numele." },
      { status: 400 }
    );
  }

  if (!email && !phone) {
    return NextResponse.json(
      { error: "Completează emailul sau telefonul." },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: "Completează mesajul." },
      { status: 400 }
    );
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Serviciul de email nu este configurat." },
      { status: 500 }
    );
  }

  try {
    const subject = "Mesaj nou - NutuArt";
    const text = buildEmail({ name, email, phone, message });

    const to = process.env.CONTACT_RECIPIENTS
      ? process.env.CONTACT_RECIPIENTS.split(",").map((entry) => entry.trim())
      : defaultRecipients;

    await resend.emails.send({
      from: "NutuArt <no-reply@nutuart.ro>",
      to,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact email error", error);
    return NextResponse.json(
      { error: "Nu am putut trimite mesajul." },
      { status: 500 }
    );
  }
}
