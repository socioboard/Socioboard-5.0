/** @jsxRuntime automatic @jsxImportSource react */
// The pragma makes the JSX transform explicit: tools that load this package from another
// workspace (tsx in apps/api dev) apply that app's tsconfig, not this one.
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

// Inline styles only: many email clients strip <style> blocks and ignore external CSS.
const colors = {
  page: '#f4f5f7',
  card: '#ffffff',
  text: '#1f2328',
  muted: '#656d76',
  border: '#e4e7eb',
  brand: '#1d4ed8',
  brandText: '#ffffff',
};
const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Every email: preview line, wordmark, white card, footer. */
export function EmailLayout({
  preview,
  children,
  footer,
}: {
  /** The line inbox lists show after the subject. */
  preview: string;
  children: ReactNode;
  /** Why the recipient got this email. */
  footer: string;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{ backgroundColor: colors.page, fontFamily: font, margin: 0, padding: '24px 0' }}
      >
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>
          <Text
            style={{ fontSize: '20px', fontWeight: 700, color: colors.brand, margin: '0 0 16px' }}
          >
            Socioboard
          </Text>
          <Section
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '32px',
            }}
          >
            {children}
          </Section>
          <Text
            style={{
              fontSize: '12px',
              lineHeight: '18px',
              color: colors.muted,
              margin: '16px 0 0',
            }}
          >
            {footer}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text style={{ fontSize: '20px', fontWeight: 600, color: colors.text, margin: '0 0 16px' }}>
      {children}
    </Text>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text style={{ fontSize: '15px', lineHeight: '24px', color: colors.text, margin: '0 0 16px' }}>
      {children}
    </Text>
  );
}

/** The main button, with the URL spelled out below for clients that block buttons. */
export function Action({ href, label }: { href: string; label: string }) {
  return (
    <>
      <Section style={{ margin: '8px 0 24px' }}>
        <Button
          href={href}
          style={{
            backgroundColor: colors.brand,
            color: colors.brandText,
            fontSize: '15px',
            fontWeight: 600,
            borderRadius: '6px',
            padding: '12px 20px',
            textDecoration: 'none',
          }}
        >
          {label}
        </Button>
      </Section>
      <Hr style={{ borderColor: colors.border, margin: '0 0 16px' }} />
      <Text style={{ fontSize: '13px', lineHeight: '20px', color: colors.muted, margin: 0 }}>
        If the button doesn't work, paste this link into your browser:{' '}
        <Link href={href} style={{ color: colors.brand, wordBreak: 'break-all' }}>
          {href}
        </Link>
      </Text>
    </>
  );
}
