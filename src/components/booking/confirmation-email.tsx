import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from '@react-email/components'
import type { BookingDetails } from './GuestCheckoutForm'

interface EmailProps {
  booking: BookingDetails & { amount: number }
  company: {
    name: string
    address: string
  }
}

export const ConfirmationEmail = ({ booking, company }: EmailProps) => (
  <Html>
    <Head />
    <Preview>Reservation Confirmation for {company.name}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Heading style={h1}>Reservation Confirmation</Heading>
        <Text style={text}>{booking.guestInfo.name},</Text>
        <Text style={text}>Your reservation has been confirmed.</Text>

        {/* Booking Information */}
        <Section style={section}>
          <Heading as="h2" style={h2}>
            Booking Details
          </Heading>
          <div style={card}>
            <Row>
              <Column>
                <Text style={label}>Venue:</Text>
                <Text style={label}>Address:</Text>
                <Text style={label}>Date:</Text>
                <Text style={label}>Time:</Text>
                <Text style={label}>Duration:</Text>
                <Text style={label}>Net Height:</Text>
              </Column>
              <Column>
                <Text style={value}>{company.name}</Text>
                <Text style={value}>{company.address}</Text>
                <Text style={value}>{booking.date}</Text>
                <Text style={value}>{booking.time}</Text>
                <Text style={value}>{booking.duration} hours</Text>
                <Text style={value}>{booking.guestInfo.net_height}</Text>
              </Column>
            </Row>
          </div>
        </Section>

        <Hr style={divider} />

        {/* Payment Receipt */}
        <Section style={section}>
          <Heading as="h2" style={h2}>
            Payment Receipt
          </Heading>
          <div style={card}>
            {/* Court Rental */}
            <Row>
              <Column>
                <Text style={label}>{booking.guestInfo.selectedCourtProduct.name}</Text>
                <Text style={subtext}>
                  ${(booking.guestInfo.selectedCourtProduct.price_amount / 100).toFixed(2)}/hour ×{' '}
                  {booking.duration} hours
                </Text>
              </Column>
              <Column align="right">
                <Text style={value}>
                  $
                  {(
                    (booking.guestInfo.selectedCourtProduct.price_amount * booking.duration) /
                    100
                  ).toFixed(2)}
                </Text>
              </Column>
            </Row>

            {/* Equipment */}
            {booking.guestInfo.selectedEquipment.map((item) => (
              <Row key={item.id}>
                <Column>
                  <Text style={label}>{item.name}</Text>
                </Column>
                <Column align="right">
                  <Text style={value}>${(item.price_amount / 100).toFixed(2)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={divider} />

            {/* Total */}
            <Row>
              <Column>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>${(booking.amount / 100).toFixed(2)}</Text>
              </Column>
            </Row>
          </div>
        </Section>

        {/* Footer */}
        <Hr style={divider} />
        <Section style={footer}>
          <Text style={footerText}>Powered by Courtify</Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} Courtify. All rights reserved.
          </Text>
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

const card = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
}

const h1 = {
  fontSize: '24px',
  fontWeight: '600',
  marginBottom: '24px',
  color: '#1a1a1a',
}

const h2 = {
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '16px',
  color: '#1a1a1a',
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '12px',
}

const label = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '8px',
}

const value = {
  fontSize: '14px',
  color: '#1f2937',
  marginBottom: '8px',
}

const subtext = {
  fontSize: '12px',
  color: '#6b7280',
  marginTop: '-4px',
  marginBottom: '8px',
}

const totalLabel = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
}

const totalValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
}

const divider = {
  borderTop: '1px solid #e5e7eb',
  margin: '24px 0',
}

const address = {
  fontSize: '14px',
  color: '#374151',
  marginTop: '4px',
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
