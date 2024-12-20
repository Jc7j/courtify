CREATE TYPE product_type AS ENUM (
  'court_rental',
  'equipment'
);

CREATE TYPE stripe_payment_type AS ENUM (
  'recurring',
  'one_time'
);


CREATE TABLE facility_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    type product_type NOT NULL,
    price_amount INTEGER NOT NULL, -- stored in cents
    currency TEXT NOT NULL DEFAULT 'USD',
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    stripe_payment_type stripe_payment_type,
    metadata JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE facility_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility members can view products" ON facility_products
    FOR SELECT
    USING (
        facility_id IN (
            SELECT facility_id 
            FROM users 
            WHERE id = auth.uid()
        )
        OR is_active = true
    );

CREATE POLICY "Owners and admins can manage products" ON facility_products
    FOR ALL
    USING (
        facility_id IN (
            SELECT facility_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT facility_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Public can view active products" ON facility_products
    FOR SELECT
    USING (is_active = true);
