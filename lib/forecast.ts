// src/lib/forecast.ts
import { supabase } from './supabase';
import type { DowKey, WeatherKey, TodayContext } from './demoContext';

export type HolidayKey = 'public_holiday' | 'ramadan' | 'local_event';

export type ForecastSettings = {
  dow: Record<DowKey, number>;
  weather: Record<WeatherKey, number>;
  holiday: Record<HolidayKey, number>;
};

const defaultSettings: ForecastSettings = {
  dow: {
    mon: 0.90,
    tue: 0.95,
    wed: 1.00,
    thu: 1.05,
    fri: 1.15,
    sat: 1.20,
    sun: 1.10,
  },
  weather: {
    clear: 1.00,
    rain: 0.85,
    hot: 0.95,
  },
    // Ramadan won’t be used unless you add events of that type
  holiday: {
    public_holiday: 1.20,
    ramadan: 1.40,
    local_event: 1.15,
  },
};

export async function fetchForecastSettings(): Promise<ForecastSettings> {
  const { data, error } = await supabase
    .from('forecast_settings')
    .select('dow_multipliers, weather_multipliers, holiday_multipliers')
    .single();

  if (error || !data) {
    console.warn('Using default forecast settings:', error?.message);
    return defaultSettings;
  }

  // Ensure numbers (Supabase returns JSON)
  const castObj = <T extends Record<string, any>>(obj: any, fallback: T): T => {
    if (!obj) return fallback;
    const res: any = { ...fallback };
    for (const key of Object.keys(fallback)) {
      const v = obj[key];
      res[key] = typeof v === 'number' ? v : parseFloat(String(v ?? fallback[key]));
    }
    return res;
  };

  return {
    dow: castObj<DowKeyMap>(data.dow_multipliers, defaultSettings.dow),
    weather: castObj<WeatherMap>(data.weather_multipliers, defaultSettings.weather),
    holiday: castObj<HolidayMap>(data.holiday_multipliers, defaultSettings.holiday),
  } as ForecastSettings;
}

// Helper type aliases
type DowKeyMap = Record<DowKey, number>;
type WeatherMap = Record<WeatherKey, number>;
type HolidayMap = Record<HolidayKey, number>;

export function computeCombinedMultiplier(
  settings: ForecastSettings,
  ctx: TodayContext
): number {
  const dowMul = settings.dow[ctx.dowKey] ?? 1;
  const weatherMul = settings.weather[ctx.weather] ?? 1;

  let holidayKey: HolidayKey | null = null;
  if (ctx.isPublicHoliday) holidayKey = 'public_holiday';
  else if (ctx.hasLocalEvent) holidayKey = 'local_event';
  // Ramadan would come from a specific event later

  const holidayMul = holidayKey ? (settings.holiday[holidayKey] ?? 1) : 1;

  return dowMul * weatherMul * holidayMul;
}