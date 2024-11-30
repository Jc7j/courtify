CREATE TYPE booking_status AS ENUM (
    'pending',   
    'confirmed',  
    'cancelled',  
    'completed',  
    'no_show'     
);

CREATE TYPE payment_status AS ENUM (
    'pending',   
    'paid',      
    'refunded',  
    'failed'     
);

-- Create sequence for booking IDs
CREATE SEQUENCE bookings_id_seq;

-- Bookings table
CREATE TABLE bookings (
    -- Use bigint for ID instead of UUID
    id BIGINT PRIMARY KEY DEFAULT nextval('bookings_id_seq'),
    -- Reference to court availability
    company_id UUID NOT NULL,
    court_number INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    
    -- Customer information (normalized to a minimum)
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    
    -- Status tracking (combined into single status for simplicity)
    status booking_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    
    -- Stripe integration (only essential fields)
    stripe_payment_intent_id TEXT UNIQUE,
    product_id UUID REFERENCES company_products(id) ON DELETE SET NULL,
    
    -- Payment details (simplified)
    amount_total INTEGER NOT NULL, -- Amount in cents
    amount_paid INTEGER, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    
    -- Additional info (combined into single JSONB)
    metadata JSONB DEFAULT '{}'::jsonb, -- Combines booking_info and notes
    
    -- Timestamps (only essential ones)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key to court availability
    FOREIGN KEY (company_id, court_number, start_time) 
        REFERENCES court_availabilities(company_id, court_number, start_time) 
        ON DELETE CASCADE,
        
    -- Constraints
    CONSTRAINT valid_amount CHECK (amount_total > 0),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0),
    -- Ensure court rentals have court numbers
    CONSTRAINT valid_court_rental CHECK (
        (product_id IS NULL) OR 
        (product_id IS NOT NULL AND court_number IS NOT NULL AND EXISTS (
            SELECT 1 FROM company_products 
            WHERE id = bookings.product_id 
            AND type = 'court_rental'
        ))
    )
);

-- Essential indexes only
CREATE INDEX idx_bookings_company_date ON bookings(company_id, start_time);
CREATE INDEX idx_bookings_customer ON bookings(customer_email, start_time);
CREATE INDEX idx_bookings_status ON bookings(status, payment_status);
CREATE INDEX idx_bookings_stripe ON bookings(stripe_payment_intent_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Simplified RLS policies
CREATE POLICY "Company staff can manage bookings" ON bookings
    FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Customers can view their bookings" ON bookings
    FOR SELECT
    USING (
        customer_email = current_setting('request.jwt.claims')::json->>'email'
        OR 
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Public can create pending bookings" ON bookings
    FOR INSERT
    WITH CHECK (
        status = 'pending' 
        AND payment_status = 'pending'
    );
