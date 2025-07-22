import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Clothing detection keywords mapping
const CLOTHING_CATEGORIES = {
  'shirt': 'Shirts', 'tshirt': 'T-Shirts', 't-shirt': 'T-Shirts', 'blouse': 'Shirts',
  'hoodie': 'Hoodies', 'sweatshirt': 'Hoodies', 'sweater': 'Sweaters', 'pullover': 'Sweaters',
  'jacket': 'Jackets', 'coat': 'Coats', 'blazer': 'Jackets', 'vest': 'Jackets',
  'jeans': 'Jeans', 'pants': 'Pants', 'trousers': 'Pants', 'shorts': 'Shorts',
  'shoes': 'Shoes', 'sneakers': 'Sneakers', 'boots': 'Boots', 'sandals': 'Shoes',
  'hat': 'Accessories', 'cap': 'Accessories', 'belt': 'Accessories', 'watch': 'Accessories'
}

// Color keywords mapping
const COLOR_KEYWORDS = {
  'black': 'Black', 'white': 'White', 'gray': 'Gray', 'grey': 'Gray',
  'red': 'Red', 'blue': 'Blue', 'green': 'Green', 'yellow': 'Yellow',
  'orange': 'Orange', 'purple': 'Purple', 'pink': 'Pink', 'brown': 'Brown',
  'navy': 'Navy Blue', 'maroon': 'Maroon', 'olive': 'Olive Green',
  'beige': 'Beige', 'tan': 'Tan', 'khaki': 'Khaki', 'cream': 'Cream'
}

const CLOTHING_BRANDS = [
  'Nike', 'Adidas', 'Puma', 'Under Armour', 'Levi\'s', 'Calvin Klein', 
  'Tommy Hilfiger', 'Ralph Lauren', 'Gap', 'Zara', 'H&M', 'Uniqlo'
]

async function analyzeWithGoogleVision(imageBase64: string) {
  const googleApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY')
  
  if (!googleApiKey) {
    throw new Error('Google Cloud API key not configured')
  }

  // Google Cloud Vision API request
  const visionRequest = {
    requests: [{
      image: { content: imageBase64 },
      features: [
        { type: 'TEXT_DETECTION', maxResults: 10 },
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
      ]
    }]
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visionRequest)
    }
  )

  if (!response.ok) {
    throw new Error(`Google Vision API error: ${response.status}`)
  }

  return await response.json()
}

function extractClothingInfo(visionResult: any) {
  const annotations = visionResult.responses[0]
  
  // Extract detected text for brand detection
  let detectedBrand = null
  if (annotations.textAnnotations) {
    const allText = annotations.textAnnotations[0]?.description?.toLowerCase() || ''
    for (const brand of CLOTHING_BRANDS) {
      if (allText.includes(brand.toLowerCase())) {
        detectedBrand = brand
        break
      }
    }
  }

  // Extract clothing category from labels and objects
  let detectedCategory = 'Other'
  let detectedColor = null
  let confidence = 0
  
  // Check object annotations
  if (annotations.localizedObjectAnnotations) {
    for (const obj of annotations.localizedObjectAnnotations) {
      const objName = obj.name.toLowerCase()
      for (const [keyword, category] of Object.entries(CLOTHING_CATEGORIES)) {
        if (objName.includes(keyword)) {
          if (obj.score > confidence) {
            detectedCategory = category
            confidence = obj.score
          }
        }
      }
    }
  }

  // Check label annotations for category and color
  if (annotations.labelAnnotations) {
    for (const label of annotations.labelAnnotations) {
      const labelName = label.description.toLowerCase()
      
      // Check for clothing category
      for (const [keyword, category] of Object.entries(CLOTHING_CATEGORIES)) {
        if (labelName.includes(keyword)) {
          if (label.score > confidence) {
            detectedCategory = category
            confidence = label.score
          }
        }
      }
      
      // Check for color
      for (const [keyword, color] of Object.entries(COLOR_KEYWORDS)) {
        if (labelName.includes(keyword)) {
          if (!detectedColor || label.score > 0.7) { // Only override if confident
            detectedColor = color
          }
        }
      }
    }
  }

  return {
    detectedCategory,
    detectedBrand,
    detectedColor,
    confidence: Math.round(confidence * 100) / 100,
    suggestedName: detectedBrand ? `${detectedBrand} ${detectedCategory}` : detectedCategory,
    rawData: annotations
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      throw new Error('No image data provided')
    }

    let analysis
    
    try {
      // Try Google Vision API first
      const visionResult = await analyzeWithGoogleVision(imageBase64)
      analysis = extractClothingInfo(visionResult)
    } catch (error) {
      console.log('Google Vision API failed, using fallback:', error.message)
      
      // Fallback to simple analysis
      analysis = {
        detectedCategory: 'T-Shirts',
        detectedBrand: null,
        detectedColor: null,
        confidence: 0.5,
        suggestedName: 'Clothing Item',
        fallback: true
      }
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in analyze-clothing function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to analyze clothing', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})