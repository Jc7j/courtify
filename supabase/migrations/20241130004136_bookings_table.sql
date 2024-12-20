CREATE TYPE booking_status AS ENUM (
    'confirmed',  
    'cancelled',  
    'pending'
);

CREATE TYPE payment_status AS ENUM (  
    'paid',      
    'refunded',  
    'failed',
    'processing',
    'pending'
);

CREATE SEQUENCE IF NOT EXISTS bookings_id_seq;

CREATE TABLE bookings (
    id BIGINT PRIMARY KEY DEFAULT nextval('bookings_id_seq'),
    facility_id UUID NOT NULL,
    court_number INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    
    -- When booking completes, status changes to 'confirmed'
    -- Once payment succeeds, payment_status will be updated to 'paid'
    status booking_status NOT NULL DEFAULT 'confirmed',
    payment_status payment_status NOT NULL DEFAULT 'failed',
    
    stripe_payment_intent_id TEXT UNIQUE,
    
    amount_total INTEGER,
    amount_paid INTEGER,
    currency TEXT NOT NULL DEFAULT 'usd',
    
    metadata JSONB NOT NULL DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (facility_id, court_number, start_time) 
        REFERENCES court_availabilities(facility_id, court_number, start_time) 
        ON DELETE RESTRICT
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage bookings" ON bookings
    FOR ALL
    USING (true)
    WITH CHECK (true);
