import { useState, useEffect, useCallback } from 'react';

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
      // Using OpenWeatherMap API - Make sure to set VITE_OPENWEATHERMAP_API_KEY in your Supabase project's secrets
      const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
      if (!apiKey) {
        throw new Error("OpenWeatherMap API key not found. Please set VITE_OPENWEATHERMAP_API_KEY in your Supabase project's secrets.");
      }

      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const data = await response.json();

      if (response.ok) {
        const weatherData: WeatherData = {
          temperature: data.main.temp,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          icon: data.weather[0].icon,
          location: data.name
        };
        setCurrentWeather(weatherData);

        // Fetch forecast data
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();

        if (forecastResponse.ok) {
          const dailyForecast: WeatherForecast[] = forecastData.list.map((item: { dt: number; temp: { min: number; max: number; }; weather: { main: string; description: string; icon: string; }[]; }) => ({
            date: new Date(item.dt * 1000).toISOString().split('T')[0],
            temperature: {
              min: item.temp.min,
              max: item.temp.max
            },
            condition: item.weather[0].main,
            description: item.weather[0].description,
            icon: item.weather[0].icon
          }));
          setForecast(dailyForecast);
        } else {
          throw new Error(forecastData.message);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = useCallback(() => {
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
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

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