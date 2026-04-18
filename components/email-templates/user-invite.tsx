import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";

interface InvitationEmailProps {
  userFirstname?: string;
  inviteLink: string;
  orgName?: string;
  roleName?: string;
  invitedBy?: string;
}

const ORG_NAME = "Iron Peptides Innovation";
const SUPPORT_EMAIL = "support@ironpeptides.com";
const ORG_ADDRESS = "410 Terry Ave. North, Seattle, WA 98109";
const LOGO_URL =
  "https://83153x3k0f.ufs.sh/f/WHfEA9ldMx5DkPX4zs1pln71ahxzZC0eTMXmsRfOt36yP42G";

export const InvitationEmail = ({
  userFirstname,
  inviteLink,
  invitedBy,
  orgName = ORG_NAME,
  roleName,
}: InvitationEmailProps) => {
  const greeting = userFirstname ? `Hi ${userFirstname},` : "Hi there,";
  const inviterText = invitedBy ? `${invitedBy}` : "Someone";
  const roleText = roleName ? ` as ${roleName}` : "";

  return (
    <Html>
      <Head />
      <Preview>
        {inviterText} invited you to join {orgName} — accept your invitation
        inside.
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* ── Header band ── */}
          <Section style={styles.header}>
            <Img
              src={LOGO_URL}
              width="90"
              height="54"
              alt={ORG_NAME}
              style={{ display: "block", margin: "0 auto" }}
            />
          </Section>

          {/* ── Main card ── */}
          <Section style={styles.card}>

            {/* Hero label */}
            <Text style={styles.eyebrow}>You&apos;re invited</Text>

            {/* Greeting */}
            <Text style={styles.greeting}>{greeting}</Text>

            {/* Body copy */}
            <Text style={styles.body_text}>
              <strong>{inviterText}</strong> has invited you to join{" "}
              <strong>{orgName}</strong>
              {roleText}. Click the button below to accept your invitation and
              set up your account — it only takes a minute.
            </Text>

            {/* What to expect bullets */}
            <Section style={styles.featureBox}>
              <Row>
                <Column style={styles.featureIcon}>✅</Column>
                <Column>
                  <Text style={styles.featureText}>
                    Access your team workspace immediately after sign-up
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column style={styles.featureIcon}>🔒</Column>
                <Column>
                  <Text style={styles.featureText}>
                    Your account is secured with industry-standard encryption
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column style={styles.featureIcon}>🚀</Column>
                <Column>
                  <Text style={styles.featureText}>
                    Start collaborating with your team right away
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center", margin: "32px 0 24px" }}>
              <Button href={inviteLink} style={styles.button}>
                Accept Invitation
              </Button>
            </Section>

            {/* Fallback link */}
            <Text style={styles.fallback_label}>
              Button not working? Paste this link into your browser:
            </Text>
            <Text style={styles.fallback_link}>{inviteLink}</Text>

            <Hr style={styles.divider} />

            {/* Expiry + ignore notice */}
            <Text style={styles.notice}>
              ⏳ This invitation link expires in{" "}
              <strong>48 hours</strong>. If you weren&apos;t expecting this
              email, you can safely ignore it — no account will be created
              without your action.
            </Text>

            {/* Sign-off */}
            <Text style={styles.signoff}>
              Warm regards,
              <br />
              <strong>The {ORG_NAME} Team</strong>
            </Text>
          </Section>

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Text style={styles.footer_text}>
              {ORG_NAME}, Inc. · {ORG_ADDRESS}
            </Text>
            <Text style={styles.footer_text}>
              Questions? Reply to this email or reach us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.footer_link}>
                {SUPPORT_EMAIL}
              </a>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f4f5f7",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 0 60px",
  },
  // Branded top bar
  header: {
    backgroundColor: "#252f3d",
    borderRadius: "8px 8px 0 0",
    padding: "24px 0",
    textAlign: "center",
  },
  // White card body
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "0 0 8px 8px",
    padding: "40px 48px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
    color: "#4f8ef7",
    margin: "0 0 12px",
  },
  greeting: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0 0 16px",
  },
  body_text: {
    fontSize: "15px",
    lineHeight: "26px",
    color: "#4a5568",
    margin: "0 0 24px",
  },
  featureBox: {
    backgroundColor: "#f7faff",
    borderRadius: "6px",
    padding: "16px 20px",
    margin: "0 0 8px",
  },
  featureIcon: {
    width: "28px",
    verticalAlign: "top",
    paddingTop: "2px",
  },
  featureText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#4a5568",
    margin: "4px 0",
  },
  button: {
    backgroundColor: "#252f3d",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 36px",
    letterSpacing: "0.3px",
  },
  fallback_label: {
    fontSize: "13px",
    color: "#718096",
    margin: "0 0 4px",
    textAlign: "center" as const,
  },
  fallback_link: {
    fontSize: "12px",
    color: "#4f8ef7",
    wordBreak: "break-all" as const,
    textAlign: "center" as const,
    margin: "0 0 24px",
  },
  divider: {
    borderColor: "#e2e8f0",
    margin: "24px 0",
  },
  notice: {
    fontSize: "13px",
    lineHeight: "22px",
    color: "#718096",
    backgroundColor: "#fffbeb",
    borderRadius: "6px",
    padding: "12px 16px",
    margin: "0 0 24px",
  },
  signoff: {
    fontSize: "15px",
    lineHeight: "26px",
    color: "#4a5568",
    margin: "0",
  },
  // Footer below card
  footer: {
    textAlign: "center" as const,
    padding: "24px 0 0",
  },
  footer_text: {
    fontSize: "12px",
    color: "#a0aec0",
    margin: "4px 0",
    lineHeight: "20px",
  },
  footer_link: {
    color: "#a0aec0",
    textDecoration: "underline",
  },
};

// ─── Preview props ────────────────────────────────────────────────────────────

InvitationEmail.PreviewProps = {
  userFirstname: "Alan",
  inviteLink: "https://ironpeptides.com/register?token=abc123",
  invitedBy: "John Doe",
  orgName: "Iron Peptides Innovation",
  roleName: "Secretary",
} satisfies InvitationEmailProps;

export default InvitationEmail;