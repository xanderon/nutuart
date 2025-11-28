import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const defaultRecipients = [
  "marcelnutu@gmail.com",
  "alexnutu+artgal@gmail.com",
];

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
  const { name, email, phone, message } = body;

  if (!email && !phone) {
    return NextResponse.json(
      { error: "Completează emailul sau telefonul." },
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
