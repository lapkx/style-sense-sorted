-- Add laundry tracking fields to clothing_items table
ALTER TABLE public.clothing_items 
ADD COLUMN last_washed date,
ADD COLUMN care_instructions text,
ADD COLUMN wash_frequency_days integer DEFAULT 7,
ADD COLUMN needs_washing boolean DEFAULT false;

-- Create trigger to automatically update needs_washing based on last_washed and wash_frequency
CREATE OR REPLACE FUNCTION public.update_needs_washing()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate if item needs washing based on last_washed date and frequency
  IF NEW.last_washed IS NOT NULL AND NEW.wash_frequency_days IS NOT NULL THEN
    NEW.needs_washing = (CURRENT_DATE - NEW.last_washed) >= NEW.wash_frequency_days;
  ELSE
    NEW.needs_washing = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs on insert and update
CREATE TRIGGER trigger_update_needs_washing
  BEFORE INSERT OR UPDATE ON public.clothing_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_needs_washing();

-- Create laundry_schedule table for tracking laundry sessions
CREATE TABLE public.laundry_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scheduled_date date NOT NULL,
  clothing_item_ids UUID[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  notes text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on laundry_schedule table
ALTER TABLE public.laundry_schedule ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for laundry_schedule
CREATE POLICY "Users can view their own laundry schedule" 
ON public.laundry_schedule 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own laundry schedule" 
ON public.laundry_schedule 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own laundry schedule" 
ON public.laundry_schedule 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own laundry schedule" 
ON public.laundry_schedule 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at timestamp on laundry_schedule
CREATE TRIGGER update_laundry_schedule_updated_at
  BEFORE UPDATE ON public.laundry_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();