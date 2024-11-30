CREATE TYPE product_type AS ENUM (
  'court_rental',
  'equipment',
  'membership',
  'class',
  'event'
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
    metadata JSONB DEFAULT '{}', -- Flexible field for type-specific data
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example metadata structure for court_rental type:
-- {
--   "min_players": 1,
--   "max_players": 4,
--   "sport_type": "volleyball",
--   "equipment_included": ["net", "balls"],
--   "court_requirements": ["indoor", "regulation_height"]
-- }

-- Add to bookings table
ALTER TABLE bookings
ADD COLUMN product_id UUID REFERENCES company_products(id),
ADD COLUMN booking_details JSONB DEFAULT '{}';

-- RLS Policies
ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can manage their products" ON company_products
    FOR ALL TO authenticated
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
    WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Public can view active products" ON company_products
    FOR SELECT
    USING (is_active = true);
