import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  description: string;
  icon: string;
}

const TEMPERATURE_RANGES = {
  very_cold: { min: -Infinity, max: 0 },
  cold: { min: 0, max: 10 },
  cool: { min: 10, max: 15 },
  mild: { min: 15, max: 20 },
  warm: { min: 20, max: 25 },
  hot: { min: 25, max: Infinity }
};

const WEATHER_CONDITION_MAP: Record<string, string[]> = {
  'clear sky': ['sunny'],
  'few clouds': ['sunny', 'cloudy'],
  'scattered clouds': ['cloudy'],
  'broken clouds': ['cloudy'],
  'overcast clouds': ['cloudy'],
  'light rain': ['rainy'],
  'moderate rain': ['rainy'],
  'heavy intensity rain': ['rainy'],
  'snow': ['snowy'],
  'light snow': ['snowy'],
  'heavy snow': ['snowy'],
  'mist': ['cloudy'],
  'fog': ['cloudy'],
  'haze': ['cloudy'],
  'thunderstorm': ['rainy', 'windy'],
  'drizzle': ['rainy']
};

export const useWeather = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTemperatureRange = (temp: number): string => {
    for (const [range, { min, max }] of Object.entries(TEMPERATURE_RANGES)) {
      if (temp >= min && temp < max) {
        return range;
      }
    }
    return 'mild';
  };

  const getWeatherConditions = (description: string): string[] => {
    const normalizedDesc = description.toLowerCase();
    for (const [key, conditions] of Object.entries(WEATHER_CONDITION_MAP)) {
      if (normalizedDesc.includes(key)) {
        return conditions;
      }
    }
    return ['sunny']; // default
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      // Using OpenWeatherMap API - user will need to add API key to Supabase secrets
      const API_KEY = 'demo_key'; // This will be replaced with actual key from secrets
      
      // For demo purposes, we'll simulate weather data
      // In production, this would call the actual API
      const mockCurrentWeather: WeatherData = {
        temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
        condition: 'clear sky',
        description: 'Clear sky',
        humidity: 65,
        windSpeed: 5.2,
        icon: '01d',
        location: 'Your Location'
      };

      const mockForecast: WeatherForecast[] = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temperature: {
          min: Math.floor(Math.random() * 15) + 5,
          max: Math.floor(Math.random() * 15) + 20
        },
        condition: ['clear sky', 'few clouds', 'scattered clouds', 'light rain'][Math.floor(Math.random() * 4)],
        description: 'Partly cloudy',
        icon: '02d'
      }));

      setCurrentWeather(mockCurrentWeather);
      setForecast(mockForecast);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Use default location (London) for demo
          fetchWeatherData(51.5074, -0.1278);
        }
      );
    } else {
      // Use default location for demo
      fetchWeatherData(51.5074, -0.1278);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    currentWeather,
    forecast,
    loading,
    error,
    refetch: getCurrentLocation,
    getTemperatureRange,
    getWeatherConditions
  };
};