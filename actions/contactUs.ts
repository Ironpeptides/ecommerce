// app/actions/sendForm.ts
'use server';

import { Resend } from "resend";
import z from "zod";

// Define the return type properly
export type FormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    institution?: string[];
    subject?: string[];
    inquiryType?: string[];
    message?: string[];
    _form?: string[];
  };
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendForm(prevState: FormState, formData: FormData): Promise<FormState> {
  
  const schema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    institution: z.string().optional(),
    subject: z.string().min(3, { message: "Subject is required" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
    inquiryType: z.string().min(1, { message: "Please select an inquiry type" }),
  });

  const parse = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    institution: formData.get("institution"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    inquiryType: formData.get("inquiryType"),
  });

  if (!parse.success) {
    const errors: FormState['errors'] = {};
    parse.error.errors.forEach((err) => {
      const path = err.path[0];
      if (path && typeof path === 'string') {
        if (!errors[path as keyof typeof errors]) {
          errors[path as keyof typeof errors] = [];
        }
        errors[path as keyof typeof errors]?.push(err.message);
      }
    });
    return { message: "error", errors };
  }

  const { name, email, institution, subject, message, inquiryType } = parse.data;

  try {
    let recipientEmail = "simiyunevily@gmail.com"  //"research@[sitename].com";
    
    if (inquiryType === "bulk" || inquiryType === "institutional") {
      recipientEmail =   "simiyunevily@gmail.com" //"institutional@[sitename].com";
    } else if (inquiryType === "compliance") {
      recipientEmail =   "simiyunevily@gmail.com"//"compliance@[sitename].com";
    }

    const { error } = await resend.emails.send({
      from: `${name} <onboarding@resend.dev>`,
      to: recipientEmail,
      replyTo: email,
      subject: `[${inquiryType.toUpperCase()}] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; margin-bottom: 5px; }
            .value { padding: 8px; background: white; border-left: 3px solid #333; }
            .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Research Inquiry</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Inquiry Type:</div>
                <div class="value">${inquiryType.toUpperCase()}</div>
              </div>
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              ${institution ? `
              <div class="field">
                <div class="label">Institution:</div>
                <div class="value">${institution}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br/>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent from your website contact form.</p>
              <p>Please reply directly to ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Inquiry Type: ${inquiryType}
Name: ${name}
Email: ${email}
${institution ? `Institution: ${institution}\n` : ''}
Subject: ${subject}
Message: ${message}

---
This message was sent from your website contact form. Please reply directly to ${email}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { message: "error", errors: { _form: ["Failed to send message. Please try again."] } };
    }

    return { message: "success" };
    
  } catch (error) {
    console.error("Server action error:", error);
    return { message: "error", errors: { _form: ["An unexpected error occurred."] } };
  }
}