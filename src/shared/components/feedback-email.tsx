import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface FeedbackEmailProps {
  feedback: string
}

export const FeedbackEmail = ({ feedback }: FeedbackEmailProps) => (
  <Html>
    <Head />
    <Preview>New Feedback from Courtify User</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Feedback Received</Heading>

        <Section style={section}>
          <Text style={text}>A user has provided the following feedback:</Text>
          <Text style={feedbackText}>{feedback}</Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>© {new Date().getFullYear()} Courtify</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  backgroundColor: '#ffffff',
  maxWidth: '600px',
}

const section = {
  marginBottom: '28px',
}

const h1 = {
  fontSize: '24px',
  fontWeight: '600',
  marginBottom: '24px',
  color: '#1a1a1a',
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '12px',
}

const feedbackText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#1f2937',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  marginTop: '8px',
}

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  marginBottom: '4px',
}
