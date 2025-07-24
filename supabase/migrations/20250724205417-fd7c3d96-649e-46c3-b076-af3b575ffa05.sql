-- Fix function search path security warning for update_needs_washing function
CREATE OR REPLACE FUNCTION public.update_needs_washing()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Calculate if item needs washing based on last_washed date and frequency
  IF NEW.last_washed IS NOT NULL AND NEW.wash_frequency_days IS NOT NULL THEN
    NEW.needs_washing = (CURRENT_DATE - NEW.last_washed) >= NEW.wash_frequency_days;
  ELSE
    NEW.needs_washing = false;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix function search path security warning for existing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;