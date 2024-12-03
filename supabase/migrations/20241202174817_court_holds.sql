CREATE TABLE court_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    court_number INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    session_id TEXT NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (company_id, court_number, start_time) 
        REFERENCES court_availabilities(company_id, court_number, start_time) 
        ON DELETE CASCADE,
        
    UNIQUE (company_id, court_number, start_time)
);

CREATE INDEX idx_court_holds_expiry ON court_holds(expires_at);

ALTER TABLE court_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create holds" ON court_holds
    FOR INSERT
    WITH CHECK (
        expires_at <= NOW() + interval '15 minutes'
    );

CREATE POLICY "Public can view holds" ON court_holds
    FOR SELECT
    USING (true);

CREATE OR REPLACE FUNCTION create_court_hold(
    p_company_id UUID,
    p_court_number INTEGER,
    p_start_time TIMESTAMPTZ,
    p_session_id TEXT
) RETURNS UUID AS $$
DECLARE
    v_hold_id UUID;
BEGIN
    -- Clean up expired holds first
    DELETE FROM court_holds WHERE expires_at <= NOW();
    
    -- Check if court is available
    IF NOT EXISTS (
        SELECT 1 FROM court_availabilities 
        WHERE company_id = p_company_id 
        AND court_number = p_court_number
        AND start_time = p_start_time
        AND status = 'available'
    ) THEN
        RAISE EXCEPTION 'Court is not available';
    END IF;
    
    -- Create hold
    INSERT INTO court_holds (
        company_id,
        court_number,
        start_time,
        session_id,
        expires_at
    ) VALUES (
        p_company_id,
        p_court_number,
        p_start_time,
        p_session_id,
        NOW() + interval '15 minutes'
    ) RETURNING id INTO v_hold_id;
    
    -- Update availability status
    UPDATE court_availabilities 
    SET status = 'held'
    WHERE company_id = p_company_id 
    AND court_number = p_court_number
    AND start_time = p_start_time;
    
    RETURN v_hold_id;
EXCEPTION 
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Court is already held';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_expired_holds() RETURNS void AS $$
BEGIN
    UPDATE court_availabilities ca
    SET status = 'available'
    FROM court_holds ch
    WHERE ch.expires_at <= NOW()
    AND ca.company_id = ch.company_id
    AND ca.court_number = ch.court_number
    AND ca.start_time = ch.start_time
    AND ca.status = 'held';
    
    DELETE FROM court_holds WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
