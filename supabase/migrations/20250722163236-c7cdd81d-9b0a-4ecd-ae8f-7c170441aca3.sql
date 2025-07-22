-- Update clothing_items table to support multiple seasons and occasions
ALTER TABLE public.clothing_items 
DROP COLUMN season,
DROP COLUMN occasion;

ALTER TABLE public.clothing_items 
ADD COLUMN seasons TEXT[],
ADD COLUMN occasions TEXT[];