import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeatherData } from '@/hooks/useWeather';
import { Cloud, Sun, CloudRain, Snowflake, Wind } from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
  className?: string;
}

const getWeatherIcon = (condition: string) => {
  const normalized = condition.toLowerCase();
  
  if (normalized.includes('rain') || normalized.includes('drizzle')) {
    return <CloudRain className="h-6 w-6 text-blue-500" />;
  }
  if (normalized.includes('snow')) {
    return <Snowflake className="h-6 w-6 text-blue-200" />;
  }
  if (normalized.includes('cloud')) {
    return <Cloud className="h-6 w-6 text-gray-500" />;
  }
  if (normalized.includes('wind')) {
    return <Wind className="h-6 w-6 text-gray-600" />;
  }
  return <Sun className="h-6 w-6 text-yellow-500" />;
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, className }) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <p className="text-2xl font-bold">{Math.round(weather.temperature)}°C</p>
              <p className="text-sm text-muted-foreground">{weather.description}</p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Humidity: {weather.humidity}%</p>
            <p>Wind: {weather.windSpeed} m/s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};