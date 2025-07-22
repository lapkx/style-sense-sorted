// Color harmony and matching rules for outfit suggestions
export interface ColorRule {
  name: string;
  description: string;
  baseColors: string[];
  compatibleColors: string[];
  avoidColors?: string[];
  occasions?: string[];
  seasons?: string[];
}

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string[];
  accent?: string;
  neutrals: string[];
}

// Predefined color combinations and rules
export const COLOR_COMBINATIONS: ColorRule[] = [
  // Classic Combinations
  {
    name: "Monochromatic",
    description: "Different shades of the same color",
    baseColors: ["Black", "White", "Gray", "Navy Blue", "Brown"],
    compatibleColors: ["Black", "White", "Gray", "Navy Blue", "Brown"],
    occasions: ["Work", "Formal", "Casual"],
    seasons: ["Spring", "Summer", "Fall", "Winter", "All Year"]
  },
  {
    name: "Black & White Classic",
    description: "Timeless black and white combination",
    baseColors: ["Black", "White"],
    compatibleColors: ["Black", "White", "Gray"],
    occasions: ["Work", "Formal", "Party", "Date Night"],
    seasons: ["Spring", "Summer", "Fall", "Winter", "All Year"]
  },
  
  // Warm Combinations
  {
    name: "Earth Tones",
    description: "Natural, warm earth colors",
    baseColors: ["Brown", "Tan", "Beige", "Khaki"],
    compatibleColors: ["Brown", "Tan", "Beige", "Khaki", "Cream", "Orange", "Yellow"],
    avoidColors: ["Pink", "Purple"],
    occasions: ["Casual", "Work", "Travel"],
    seasons: ["Fall", "Winter", "All Year"]
  },
  {
    name: "Warm Sunset",
    description: "Warm colors inspired by sunset",
    baseColors: ["Orange", "Red", "Yellow"],
    compatibleColors: ["Orange", "Red", "Yellow", "Brown", "Cream", "Tan"],
    avoidColors: ["Blue", "Purple", "Pink"],
    occasions: ["Casual", "Party"],
    seasons: ["Summer", "Fall"]
  },

  // Cool Combinations
  {
    name: "Ocean Blues",
    description: "Cool blue and navy combinations",
    baseColors: ["Navy Blue", "Blue"],
    compatibleColors: ["Navy Blue", "Blue", "White", "Gray", "Black"],
    occasions: ["Work", "Formal", "Casual"],
    seasons: ["Spring", "Summer", "All Year"]
  },
  {
    name: "Cool Breeze",
    description: "Cool colors for fresh look",
    baseColors: ["Blue", "Green", "Purple"],
    compatibleColors: ["Blue", "Green", "Purple", "White", "Gray", "Black"],
    avoidColors: ["Orange", "Red", "Yellow"],
    occasions: ["Casual", "Work"],
    seasons: ["Spring", "Summer"]
  },

  // Seasonal Combinations
  {
    name: "Spring Fresh",
    description: "Light, fresh spring colors",
    baseColors: ["Green", "Pink", "Yellow"],
    compatibleColors: ["Green", "Pink", "Yellow", "White", "Cream", "Beige"],
    occasions: ["Casual", "Date Night", "Party"],
    seasons: ["Spring"]
  },
  {
    name: "Summer Bright",
    description: "Bright, energetic summer colors",
    baseColors: ["Yellow", "Orange", "Pink", "Blue"],
    compatibleColors: ["Yellow", "Orange", "Pink", "Blue", "White", "Cream"],
    occasions: ["Casual", "Party", "Travel"],
    seasons: ["Summer"]
  },
  {
    name: "Autumn Warmth",
    description: "Rich, warm autumn colors",
    baseColors: ["Brown", "Orange", "Red", "Yellow"],
    compatibleColors: ["Brown", "Orange", "Red", "Yellow", "Tan", "Cream", "Olive Green"],
    occasions: ["Casual", "Work"],
    seasons: ["Fall"]
  },
  {
    name: "Winter Elegance",
    description: "Deep, sophisticated winter colors",
    baseColors: ["Black", "Navy Blue", "Gray", "Maroon"],
    compatibleColors: ["Black", "Navy Blue", "Gray", "Maroon", "White", "Purple"],
    occasions: ["Work", "Formal", "Date Night"],
    seasons: ["Winter"]
  },

  // Special Occasion Combinations
  {
    name: "Business Professional",
    description: "Conservative colors for business",
    baseColors: ["Navy Blue", "Black", "Gray", "Brown"],
    compatibleColors: ["Navy Blue", "Black", "Gray", "Brown", "White", "Cream"],
    avoidColors: ["Pink", "Orange", "Yellow", "Purple"],
    occasions: ["Work", "Formal"],
    seasons: ["Spring", "Summer", "Fall", "Winter", "All Year"]
  },
  {
    name: "Date Night Romantic",
    description: "Romantic colors for date nights",
    baseColors: ["Black", "Red", "Navy Blue", "Maroon"],
    compatibleColors: ["Black", "Red", "Navy Blue", "Maroon", "White", "Pink"],
    occasions: ["Date Night", "Party", "Formal"],
    seasons: ["Spring", "Summer", "Fall", "Winter", "All Year"]
  },
  {
    name: "Gym Active",
    description: "Energetic colors for workouts",
    baseColors: ["Black", "Navy Blue", "Gray"],
    compatibleColors: ["Black", "Navy Blue", "Gray", "Blue", "Green", "Red", "Orange"],
    occasions: ["Gym"],
    seasons: ["Spring", "Summer", "Fall", "Winter", "All Year"]
  }
];

// Popular color palettes
export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "Classic Neutral",
    primary: "Black",
    secondary: ["White", "Gray"],
    neutrals: ["Beige", "Cream", "Tan"]
  },
  {
    name: "Navy Elegance",
    primary: "Navy Blue",
    secondary: ["White", "Gray"],
    accent: "Red",
    neutrals: ["Cream", "Tan"]
  },
  {
    name: "Earth Natural",
    primary: "Brown",
    secondary: ["Tan", "Beige"],
    accent: "Orange",
    neutrals: ["Cream", "Khaki"]
  },
  {
    name: "Modern Minimalist",
    primary: "Gray",
    secondary: ["Black", "White"],
    neutrals: ["Cream"]
  }
];

// Helper functions for color matching
export class ColorMatcher {
  /**
   * Get compatible colors for a given base color
   */
  static getCompatibleColors(baseColor: string, occasion?: string, season?: string): string[] {
    const matchingRules = COLOR_COMBINATIONS.filter(rule => {
      const hasBaseColor = rule.baseColors.some(color => 
        color.toLowerCase().includes(baseColor.toLowerCase()) ||
        baseColor.toLowerCase().includes(color.toLowerCase())
      );
      
      const matchesOccasion = !occasion || !rule.occasions || 
        rule.occasions.some(o => o.toLowerCase() === occasion.toLowerCase());
      
      const matchesSeason = !season || !rule.seasons || 
        rule.seasons.some(s => s.toLowerCase() === season.toLowerCase()) ||
        rule.seasons.includes("All Year");
      
      return hasBaseColor && matchesOccasion && matchesSeason;
    });

    const compatibleColors = new Set<string>();
    matchingRules.forEach(rule => {
      rule.compatibleColors.forEach(color => compatibleColors.add(color));
    });

    return Array.from(compatibleColors);
  }

  /**
   * Get colors to avoid with a base color
   */
  static getColorsToAvoid(baseColor: string): string[] {
    const matchingRules = COLOR_COMBINATIONS.filter(rule =>
      rule.baseColors.some(color => 
        color.toLowerCase().includes(baseColor.toLowerCase()) ||
        baseColor.toLowerCase().includes(color.toLowerCase())
      )
    );

    const colorsToAvoid = new Set<string>();
    matchingRules.forEach(rule => {
      if (rule.avoidColors) {
        rule.avoidColors.forEach(color => colorsToAvoid.add(color));
      }
    });

    return Array.from(colorsToAvoid);
  }

  /**
   * Check if two colors work well together
   */
  static areColorsCompatible(color1: string, color2: string, occasion?: string): boolean {
    const compatibleColors = this.getCompatibleColors(color1, occasion);
    const colorsToAvoid = this.getColorsToAvoid(color1);
    
    // Check if color2 is in compatible list
    const isCompatible = compatibleColors.some(color => 
      color.toLowerCase().includes(color2.toLowerCase()) ||
      color2.toLowerCase().includes(color.toLowerCase())
    );
    
    // Check if color2 should be avoided
    const shouldAvoid = colorsToAvoid.some(color => 
      color.toLowerCase().includes(color2.toLowerCase()) ||
      color2.toLowerCase().includes(color.toLowerCase())
    );
    
    return isCompatible && !shouldAvoid;
  }

  /**
   * Get the best color palette for given occasion and season
   */
  static getBestPalette(occasion?: string, season?: string): ColorPalette | null {
    // Simple logic - can be enhanced based on specific requirements
    if (occasion?.toLowerCase() === 'work' || occasion?.toLowerCase() === 'formal') {
      return COLOR_PALETTES[1]; // Navy Elegance
    }
    
    if (season?.toLowerCase() === 'fall' || season?.toLowerCase() === 'winter') {
      return COLOR_PALETTES[2]; // Earth Natural
    }
    
    return COLOR_PALETTES[0]; // Classic Neutral as default
  }

  /**
   * Score an outfit based on color harmony (0-100)
   */
  static scoreOutfitColors(colors: string[], occasion?: string, season?: string): number {
    if (colors.length < 2) return 100; // Single color is always fine

    let totalScore = 0;
    let comparisons = 0;

    // Check each color pair
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        if (this.areColorsCompatible(colors[i], colors[j], occasion)) {
          totalScore += 100;
        } else {
          totalScore += 30; // Partial points for not terrible combinations
        }
        comparisons++;
      }
    }

    return comparisons > 0 ? Math.round(totalScore / comparisons) : 100;
  }
}

export default ColorMatcher;