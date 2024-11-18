-- Enums for status management
CREATE TYPE booking_status AS ENUM (
    'pending',    -- Initial state when booking is created
    'confirmed',  -- After payment is successful
    'cancelled',  -- When booking is cancelled
    'completed',  -- After the booking time has passed
    'no_show'     -- If customer didn't show up
);

CREATE TYPE payment_status AS ENUM (
    'pending',   -- Initial state
    'paid',      -- Payment successful
    'refunded',  -- Payment was refunded
    'failed'     -- Payment failed
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Reference to court availability
    company_id UUID NOT NULL,
    court_number INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    
    -- Customer information
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    
    -- Status tracking
    booking_status booking_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    
    -- Stripe integration
    stripe_customer_id TEXT,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_session_id TEXT UNIQUE,
    
    -- Payment details
    amount_total INTEGER NOT NULL, -- Amount in cents
    amount_paid INTEGER, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    
    -- Additional info
    booking_info JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    
    -- Foreign key to court availability
    FOREIGN KEY (company_id, court_number, start_time) 
        REFERENCES court_availabilities(company_id, court_number, start_time) 
        ON DELETE CASCADE,
        
    -- Basic constraints
    CONSTRAINT valid_amount 
        CHECK (amount_total > 0)
);

-- Indexes for performance
CREATE INDEX idx_bookings_company ON bookings(company_id);
CREATE INDEX idx_bookings_court ON bookings(company_id, court_number);
CREATE INDEX idx_bookings_availability ON bookings(company_id, court_number, start_time);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_stripe_customer ON bookings(stripe_customer_id);
CREATE INDEX idx_bookings_stripe_payment ON bookings(stripe_payment_intent_id);
CREATE INDEX idx_bookings_stripe_session ON bookings(stripe_session_id);

-- RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Company staff can view all bookings
CREATE POLICY bookings_select_company ON bookings
    FOR SELECT TO authenticated
    USING (company_id IN (
        SELECT company_id 
        FROM users 
        WHERE users.id = auth.uid()
    ));

-- Customers can view bookings by their email
CREATE POLICY bookings_select_customer ON bookings
    FOR SELECT TO anon
    USING (customer_email = current_setting('request.jwt.claims')::json->>'email');

-- Company staff can update bookings
CREATE POLICY bookings_update_company ON bookings
    FOR UPDATE TO authenticated
    USING (company_id IN (
        SELECT company_id 
        FROM users 
        WHERE users.id = auth.uid()
    ));

-- Anyone can create a booking
CREATE POLICY bookings_insert_public ON bookings
    FOR INSERT WITH CHECK (true);
