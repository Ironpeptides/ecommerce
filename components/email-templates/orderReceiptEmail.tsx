import {
  Body, Container, Head, Hr, Html, Img, Preview, Section, Text, Row, Column,
} from "@react-email/components";

interface OrderReceiptEmailProps {
  userFirstname: string;
  orderNumber: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  isAdmin?: boolean;
}

const LOGO_URL = "https://lh6ptlb953.ufs.sh/f/otE6z0gvCqP3UuvEfQFLOryNz0fkKC81E45URpsHneVZmIqg";

export const OrderReceiptEmail = ({
  userFirstname,
  orderNumber,
  totalAmount,
  items,
  isAdmin = false,
}: OrderReceiptEmailProps) => (
  <Html>
    <Head />
    <Preview>{isAdmin ? `New Sale: #${orderNumber}` : `Your Receipt for Order #${orderNumber}`}</Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Img src={LOGO_URL} width="150" height="50" style={{ margin: "0 auto" }} />
        </Section>
        <Section style={styles.card}>
          <Text style={styles.eyebrow}>{isAdmin ? "ADMIN NOTIFICATION" : "THANK YOU FOR YOUR PURCHASE"}</Text>
          <Text style={styles.greeting}>Hi {userFirstname},</Text>
          <Text style={styles.body_text}>
            {isAdmin 
              ? `A new order has been placed and paid for. Total: $${totalAmount.toFixed(2)}`
              : `We've received your invoice for order #${orderNumber}. Your items are being prepared for shipment after verification of payment`}
          </Text>

          <Section style={styles.featureBox}>
            {items.map((item, idx) => (
              <Row key={idx} style={{ marginBottom: "8px" }}>
                <Column><Text style={styles.featureText}>{item.quantity}x {item.name}</Text></Column>
                <Column align="right"><Text style={styles.featureText}>${(item.price * item.quantity).toFixed(2)}</Text></Column>
              </Row>
            ))}
            <Hr />
            <Row>
              <Column><Text style={{ fontWeight: 'bold' }}>Total</Text></Column>
              <Column align="right"><Text style={{ fontWeight: 'bold' }}>${totalAmount.toFixed(2)}</Text></Column>
            </Row>
          </Section>

          <Text style={styles.signoff}>Warm regards, <br /><strong>Haelolabs</strong></Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const styles = {
  body: { backgroundColor: "#f4f5f7", fontFamily: "sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "20px 0" },
  header: { backgroundColor: "#252f3d", padding: "24px", borderRadius: "8px 8px 0 0" },
  card: { backgroundColor: "#ffffff", padding: "40px", borderRadius: "0 0 8px 8px" },
  eyebrow: { fontSize: "12px", fontWeight: "700", color: "#4f8ef7" },
  greeting: { fontSize: "22px", fontWeight: "700", margin: "16px 0" },
  body_text: { fontSize: "15px", color: "#4a5568" },
  featureBox: { backgroundColor: "#f7faff", padding: "16px", borderRadius: "6px" },
  featureText: { fontSize: "14px", margin: "0" },
  signoff: { fontSize: "15px", marginTop: "24px" },
};