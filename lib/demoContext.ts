// src/lib/demoContext.ts
import { supabase } from './supabase';

export type WeatherKey = 'clear' | 'rain' | 'hot';
export type DowKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type TodayContext = {
  date: Date;
  dateISO: string;
  dowKey: DowKey;
  weather: WeatherKey;
  isPublicHoliday: boolean;
  hasLocalEvent: boolean;
  localEventLabel?: string;
};

function toDowKey(d: Date): DowKey {
  const map: DowKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[d.getDay()];
}

export async function getTodayContext(): Promise<TodayContext> {
  // 1) Try to read demo_context
  const { data: demoRow } = await supabase
    .from('demo_context')
    .select('*')
    .single();

  let baseDate = new Date();
  let weather: WeatherKey = 'clear';
  let isPublicHoliday = false;
  let hasLocalEvent = false;
  let localEventLabel: string | undefined;

  const msNow = new Date();

  // DEMO MODE: full override from demo_context
  if (demoRow && demoRow.enabled && demoRow.demo_date) {
    baseDate = new Date(demoRow.demo_date as string);
    if (demoRow.weather) weather = demoRow.weather as WeatherKey;
    isPublicHoliday = !!demoRow.is_public_holiday;
    if (demoRow.local_event_label) {
      hasLocalEvent = true;
      localEventLabel = demoRow.local_event_label as string;
    }
  } else {
    // REAL MODE: use today + events table
    baseDate = new Date(
      `${msNow.getFullYear()}-${String(msNow.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(msNow.getDate()).padStart(2, '0')}`
    );
    const dateISO = baseDate.toISOString().slice(0, 10);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('type, label')
      .eq('on_date', dateISO);

    if (!eventsError && events && events.length > 0) {
      if (events.some((e: any) => e.type === 'public_holiday')) {
        isPublicHoliday = true;
      }
      const localEv = events.find((e: any) => e.type === 'local_event');
      if (localEv) {
        hasLocalEvent = true;
        localEventLabel = localEv.label ?? undefined;
      }
    }
  }

  const dateISO = baseDate.toISOString().slice(0, 10);
  const dowKey = toDowKey(baseDate);

  return {
    date: baseDate,
    dateISO,
    dowKey,
    weather,
    isPublicHoliday,
    hasLocalEvent,
    localEventLabel,
  };
}