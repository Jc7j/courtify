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
    id BIGINT PRIMARY KEY DEFAULT nextval('bookings_id_seq'),
    company_id UUID NOT NULL,
    court_number INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    
    status booking_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    
    stripe_payment_intent_id TEXT UNIQUE,
    product_id UUID REFERENCES company_products(id) ON DELETE SET NULL,
    
    amount_total INTEGER NOT NULL,
    amount_paid INTEGER,
    currency TEXT NOT NULL DEFAULT 'usd',
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (company_id, court_number, start_time) 
        REFERENCES court_availabilities(company_id, court_number, start_time) 
        ON DELETE CASCADE,
        
    CONSTRAINT valid_amount CHECK (amount_total > 0)
);

-- Essential indexes
CREATE INDEX idx_bookings_company_date ON bookings(company_id, start_time);
CREATE INDEX idx_bookings_customer ON bookings(customer_email, start_time);
CREATE INDEX idx_bookings_status ON bookings(status, payment_status);
CREATE INDEX idx_bookings_stripe ON bookings(stripe_payment_intent_id);

-- RLS Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

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
