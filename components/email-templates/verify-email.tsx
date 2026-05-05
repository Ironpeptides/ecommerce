import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Row,
  Column,
  Tailwind,
  Text,
} from '@react-email/components';

interface VerifyEmailProps {
  verificationCode: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://yourdomain.com'; // ← fallback for local dev

export default function VerifyEmail({ verificationCode }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Haelolabs verification code is {verificationCode}</Preview>
      <Body style={{ backgroundColor: '#eeeeee', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Section style={{ backgroundColor: '#ffffff' }}>

            {/* Header / Logo */}
            <Section style={{ backgroundColor: '#252f3d', padding: '20px 0', textAlign: 'center' }}>
              <Img
                src={`https://83153x3k0f.ufs.sh/f/WHfEA9ldMx5DkPX4zs1pln71ahxzZC0eTMXmsRfOt36yP42G`}
                width="75"
                height="45"
                alt="Haelolabs Logo"
                style={{ display: 'block', margin: '0 auto' }}
              />
            </Section>

            {/* Body */}
            <Section style={{ padding: '25px 35px' }}>
              <Heading style={{ color: '#333333', fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
                Verify your email address
              </Heading>
              <Text style={{ color: '#333333', fontSize: '14px', lineHeight: '24px', margin: '0 0 14px' }}>
                Thanks for starting the new Haelolabs account creation process. We want to make sure
                it&apos;s really you. Please enter the following verification code when prompted. If you
                don&apos;t want to create an account, you can ignore this message.
              </Text>

              {/* Verification Code Block */}
              <Section style={{ textAlign: 'center', padding: '10px 0' }}>
                <Text style={{ color: '#333333', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px' }}>
                  Verification code
                </Text>
                <Text style={{ color: '#333333', fontSize: '36px', fontWeight: 'bold', margin: '10px 0', letterSpacing: '6px' }}>
                  {verificationCode}
                </Text>
                <Text style={{ color: '#333333', fontSize: '14px', margin: 0 }}>
                  (This code is valid for 10 minutes)
                </Text>
              </Section>
            </Section>

            <Hr style={{ borderColor: '#dddddd', margin: 0 }} />

            {/* Footer disclaimer */}
            <Section style={{ padding: '25px 35px' }}>
              <Text style={{ color: '#333333', fontSize: '14px', margin: 0 }}>
                Haelolabs will never email you and ask you to disclose or verify your
                password, credit card, or banking account number.
              </Text>
            </Section>
          </Section>

          {/* Legal footer */}
          <Text style={{ color: '#333333', fontSize: '12px', margin: '24px 0', padding: '0 20px' }}>
            This message was produced and distributed by Haelolabs, Inc., 410 Terry Ave.
            North, Seattle, WA 98109. © 2024, Haelolabs, Inc.. All rights reserved.
            Haelolabs is a registered trademark of{' '}
            <Link href="https://haelo.fit" target="_blank" style={{ color: '#2754C5', textDecoration: 'underline' }}>
              https://haelo.fit
            </Link>
            , Inc. View our{' '}
            <Link href="https://haelo.fit/privacy" target="_blank" style={{ color: '#2754C5', textDecoration: 'underline' }}>
              privacy policy
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

VerifyEmail.PreviewProps = {
  verificationCode: '596853',
} satisfies VerifyEmailProps;