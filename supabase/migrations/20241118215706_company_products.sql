CREATE TYPE product_type AS ENUM (
  'court_rental',
  'equipment'
--   'membership',
--   'class',
--   'event'
);

CREATE TYPE stripe_payment_type AS ENUM (
  'recurring',
  'one_time'
);


CREATE TABLE company_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type product_type NOT NULL,
    price_amount INTEGER NOT NULL, -- stored in cents
    currency TEXT NOT NULL DEFAULT 'USD',
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    stripe_payment_type stripe_payment_type,
    metadata JSONB DEFAULT '{}', -- Flexible field for type-specific data
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Add unique constraint for Stripe IDs
    CONSTRAINT unique_stripe_price_id UNIQUE (stripe_price_id),
    CONSTRAINT unique_stripe_product_id UNIQUE (stripe_product_id)
);

-- Example metadata structure for court_rental type:
-- {
--   "min_players": 1,
--   "max_players": 4,
--   "sport_type": "volleyball",
--   "equipment_included": ["net", "balls"],
--   "court_requirements": ["indoor", "regulation_height"]
-- }

-- RLS Policies
ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;

-- Company members can view products
CREATE POLICY "Company members can view products" ON company_products
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE id = auth.uid()
        )
        OR is_active = true
    );

-- Only owners/admins can manage products
CREATE POLICY "Owners and admins can manage products" ON company_products
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Public can view active products" ON company_products
    FOR SELECT
    USING (is_active = true);
