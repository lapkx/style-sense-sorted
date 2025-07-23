-- Add weather-related columns to clothing_items table
ALTER TABLE public.clothing_items 
ADD COLUMN temperature_range text CHECK (temperature_range IN ('very_cold', 'cold', 'cool', 'mild', 'warm', 'hot')),
ADD COLUMN weather_conditions text[] DEFAULT '{}';

-- Add comments for clarity
COMMENT ON COLUMN public.clothing_items.temperature_range IS 'Temperature suitability: very_cold (<0°C), cold (0-10°C), cool (10-15°C), mild (15-20°C), warm (20-25°C), hot (>25°C)';
COMMENT ON COLUMN public.clothing_items.weather_conditions IS 'Weather conditions this item is suitable for: sunny, cloudy, rainy, snowy, windy';