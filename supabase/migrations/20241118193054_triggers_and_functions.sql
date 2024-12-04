CREATE OR REPLACE FUNCTION validate_availability_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status to past if end_time has passed
    IF NEW.end_time < NOW() THEN
        NEW.status := 'past';
    END IF;

    -- Don't allow modifications to past availabilities
    IF OLD.status = 'past' THEN
        RAISE EXCEPTION 'Cannot modify past availabilities';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_court_availabilities(
    p_company_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
) RETURNS SETOF court_availabilities AS $$
BEGIN
    -- First update past availabilities
    UPDATE court_availabilities
    SET status = 'past'
    WHERE company_id = p_company_id
    AND end_time < NOW()
    AND status != 'past';
    
    -- Then return results
    RETURN QUERY
    SELECT *
    FROM court_availabilities
    WHERE company_id = p_company_id
    AND start_time <= p_end_time
    AND end_time >= p_start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

