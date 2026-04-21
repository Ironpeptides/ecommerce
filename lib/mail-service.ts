import { Resend } from 'resend';
import { OrderReceiptEmail } from '@/components/email-templates/orderReceiptEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// lib/mail-service.ts
export async function sendOrderConfirmationEmails({
  buyerEmail,
  buyerName,
  adminEmails, // Changed from adminEmail: string to adminEmails: string[]
  orderNumber,
  totalAmount,
  items
}: {
  buyerEmail: string;
  buyerName: string;
  adminEmails: string[];
  orderNumber: string;
  totalAmount: number;
  items: any[];
}) {
  console.log("Sending order confirmation email to buyer1:", buyerEmail);
  try {
    const buyerResult = await resend.emails.send({
      from: `Iron Peptides <onboarding@resend.dev>`,
      to: "simiyunevily@gmail.com",
      subject: `Order Confirmation #${orderNumber}`,
      react: OrderReceiptEmail({ userFirstname: buyerName, orderNumber, totalAmount, items }),
    });
    console.log("Buyer email result:", JSON.stringify(buyerResult)); 

    const adminResults = await Promise.all(adminEmails.map(email =>
      resend.emails.send({
        from: `Iron Peptides <onboarding@resend.dev>`,
        to: "simiyunevily@gmail.com",
        subject: `NEW SALE ALERT: #${orderNumber}`,
        react: OrderReceiptEmail({ userFirstname: "Admin", orderNumber, totalAmount, items, isAdmin: true }),
      })
    ));
    console.log("Admin email results:", JSON.stringify(adminResults)); 

  } catch (error) {
    console.error("Failed to send emails:", JSON.stringify(error)); 
    throw error; 
  }
}