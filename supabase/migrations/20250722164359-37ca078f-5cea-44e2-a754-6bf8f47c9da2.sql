-- Create table for weekly outfit assignments
CREATE TABLE public.weekly_outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  clothing_item_ids UUID[] NOT NULL,
  notes TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_outfits ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own outfits" 
ON public.weekly_outfits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfits" 
ON public.weekly_outfits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" 
ON public.weekly_outfits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits" 
ON public.weekly_outfits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_outfits_updated_at
BEFORE UPDATE ON public.weekly_outfits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();