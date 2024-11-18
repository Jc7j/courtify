-- Trigger functions and triggers
CREATE OR REPLACE FUNCTION update_availability_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time < timezone('UTC', now()) THEN
        IF NEW.status != 'past' THEN
            NEW.status := 'past';
        END IF;
    ELSE
        IF NEW.status = 'past' AND OLD.status IS NULL THEN
            NEW.status := 'available';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION validate_availability_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'past' THEN
        RAISE EXCEPTION 'Cannot modify past availabilities';
    END IF;

    IF NEW.start_time >= NEW.end_time THEN
        RAISE EXCEPTION 'Start time must be before end time';
    END IF;

    IF EXISTS (
        SELECT 1 FROM court_availabilities
        WHERE company_id = NEW.company_id
        AND court_number = NEW.court_number
        AND start_time < NEW.end_time
        AND end_time > NEW.start_time
        AND start_time != OLD.start_time
    ) THEN
        RAISE EXCEPTION 'Time slot overlaps with existing availability';
    END IF;

    IF NEW.end_time < NOW() THEN
        NEW.status := 'past';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER check_availability_status
    BEFORE INSERT OR UPDATE ON court_availabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_availability_status();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courts_updated_at
    BEFORE UPDATE ON courts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_court_availabilities_updated_at
    BEFORE UPDATE ON court_availabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER validate_availability_update
    BEFORE UPDATE ON court_availabilities
    FOR EACH ROW
    EXECUTE FUNCTION validate_availability_update();
