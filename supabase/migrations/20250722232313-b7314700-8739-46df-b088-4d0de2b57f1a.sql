-- Create outfit history table to track when outfits are worn
CREATE TABLE public.outfit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  outfit_id UUID REFERENCES public.weekly_outfits(id) ON DELETE CASCADE,
  worn_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outfit ratings table for user preferences
CREATE TABLE public.outfit_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  outfit_id UUID REFERENCES public.weekly_outfits(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, outfit_id)
);

-- Create clothing item usage tracking
CREATE TABLE public.clothing_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  last_worn DATE,
  total_wears INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, clothing_item_id)
);

-- Enable RLS on outfit_history
ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own outfit history" 
ON public.outfit_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfit history" 
ON public.outfit_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit history" 
ON public.outfit_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit history" 
ON public.outfit_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on outfit_ratings
ALTER TABLE public.outfit_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own outfit ratings" 
ON public.outfit_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfit ratings" 
ON public.outfit_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit ratings" 
ON public.outfit_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit ratings" 
ON public.outfit_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on clothing_usage
ALTER TABLE public.clothing_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clothing usage" 
ON public.clothing_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clothing usage" 
ON public.clothing_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothing usage" 
ON public.clothing_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothing usage" 
ON public.clothing_usage 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_outfit_history_updated_at
BEFORE UPDATE ON public.outfit_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outfit_ratings_updated_at
BEFORE UPDATE ON public.outfit_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clothing_usage_updated_at
BEFORE UPDATE ON public.clothing_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_outfit_history_user_id ON public.outfit_history(user_id);
CREATE INDEX idx_outfit_history_worn_date ON public.outfit_history(worn_date);
CREATE INDEX idx_outfit_ratings_user_id ON public.outfit_ratings(user_id);
CREATE INDEX idx_clothing_usage_user_id ON public.clothing_usage(user_id);
CREATE INDEX idx_clothing_usage_last_worn ON public.clothing_usage(last_worn);