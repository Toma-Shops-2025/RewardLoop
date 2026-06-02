import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "RewardLoop";
const ADMIN_URL = "https://www.rewardloop.fun/app/admin/redemptions";

interface NewRedemptionAlertProps {
  userName?: string;
  userEmail?: string;
  points?: number;
  giftCardBrand?: string;
  recipientEmail?: string;
  withdrawalId?: string;
}

const formatBrand = (brand?: string) =>
  brand
    ? brand
        .split("_")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
    : "Unknown";

const NewRedemptionAlertEmail = ({
  userName,
  userEmail,
  points,
  giftCardBrand,
  recipientEmail,
  withdrawalId,
}: NewRedemptionAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      New redemption: {points ?? "?"} pts for {formatBrand(giftCardBrand)}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New redemption request</Heading>
        <Text style={text}>
          A user just requested a gift card redemption on {SITE_NAME}.
        </Text>

        <Section style={card}>
          <Text style={row}>
            <strong>User:</strong> {userName || "Player"}
          </Text>
          <Text style={row}>
            <strong>Account email:</strong> {userEmail || "—"}
          </Text>
          <Hr style={hr} />
          <Text style={row}>
            <strong>Brand:</strong> {formatBrand(giftCardBrand)}
          </Text>
          <Text style={row}>
            <strong>Points (incl. fee):</strong> {points ?? "—"}
          </Text>
          <Text style={row}>
            <strong>Send gift card to:</strong> {recipientEmail || "—"}
          </Text>
          {withdrawalId ? (
            <Text style={rowMuted}>ID: {withdrawalId}</Text>
          ) : null}
        </Section>

        <Section style={{ textAlign: "center", margin: "28px 0 8px" }}>
          <Button style={button} href={ADMIN_URL}>
            Open admin panel
          </Button>
        </Section>

        <Text style={footer}>{SITE_NAME} admin notification</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: NewRedemptionAlertEmail,
  subject: (data: Record<string, any>) =>
    `New redemption: ${data?.points ?? "?"} pts for ${formatBrand(data?.giftCardBrand)}`,
  displayName: "New redemption alert (admin)",
  to: "founder@rewardloop.fun",
  previewData: {
    userName: "Jane Doe",
    userEmail: "jane@example.com",
    points: 3060,
    giftCardBrand: "amazon",
    recipientEmail: "jane@example.com",
    withdrawalId: "abcd-1234",
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
};
const container = { padding: "24px 28px", maxWidth: "560px", margin: "0 auto" };
const h1 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "0 0 16px",
};
const text = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
  margin: "0 0 20px",
};
const card = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "16px 18px",
  margin: "0 0 8px",
};
const row = {
  fontSize: "14px",
  color: "#0f172a",
  margin: "6px 0",
  lineHeight: "1.5",
};
const rowMuted = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "10px 0 0",
};
const hr = { borderColor: "#e2e8f0", margin: "12px 0" };
const button = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
};
const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center" as const,
  margin: "24px 0 0",
};
