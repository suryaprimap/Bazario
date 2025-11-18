// app/(admin)/index.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

// ----- Types -----
type IngredientNeed = {
  ingredientName: string;
  unit: string;
  qtyNeeded: number;
};

type VariantForecast = {
  id: string;
  itemName: string;
  variantName: string;
  price: number;
  baseline: number;
  forecast: number;
  ingredientsNeeded: IngredientNeed[];
};

// Mock forecast functions - replace with your actual implementation
interface TodayContext {
  dateISO: string;
  weather: 'clear' | 'rain' | 'hot';
  isPublicHoliday: boolean;
  hasLocalEvent: boolean;
  localEventLabel: string | null;
}

const getTodayContext = async (): Promise<TodayContext> => {
  const today = new Date();
  const dateISO = today.toISOString().split('T')[0];
  return {
    dateISO,
    weather: 'clear',
    isPublicHoliday: false,
    hasLocalEvent: false,
    localEventLabel: null,
  };
};

const fetchForecastSettings = async () => {
  return {
    baseMultiplier: 1.0,
    weekendMultiplier: 1.3,
    holidayMultiplier: 1.5,
    weatherMultipliers: {
      clear: 1.1,
      rain: 0.7,
      hot: 0.9,
    },
  };
};

const computeCombinedMultiplier = (settings: any, context: TodayContext) => {
  let multiplier = settings.baseMultiplier;
  
  // Weekend multiplier
  const day = new Date(context.dateISO).getDay();
  if (day === 0 || day === 6) { // Sunday or Saturday
    multiplier *= settings.weekendMultiplier;
  }
  
  // Weather multiplier
  multiplier *= settings.weatherMultipliers[context.weather] || 1.0;
  
  // Holiday multiplier
  if (context.isPublicHoliday) {
    multiplier *= settings.holidayMultiplier;
  }
  
  return multiplier;
};

// Mock stock alerts function
const computeStockAlerts = async (multiplier: number, context: TodayContext) => {
  return [
    {
      id: '1',
      type: 'low_stock' as const,
      severity: 'warn' as const,
      ingredientName: 'Telur',
      message: 'Stok telur rendah (2/20) - pesan sekarang?'
    }
  ];
};

// Reuse same human-friendly quantity formatting as stock.ts
function formatQty(qty: number, unit: string): string {
  const q = Math.ceil(qty); // round up for safety
  if (unit === 'g' && q >= 1000) {
    return `${(q / 1000).toFixed(1)} kg (~${q} g)`;
  }
  if (unit === 'ml' && q >= 1000) {
    return `${(q / 1000).toFixed(1)} L (~${q} ml)`;
  }
  return `${q} ${unit}`;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [ctx, setCtx] = useState<TodayContext | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [variants, setVariants] = useState<VariantForecast[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) Context + forecast settings
      const [context, forecastSettings] = await Promise.all([
        getTodayContext(),
        fetchForecastSettings(),
      ]);

      const combinedMultiplier = computeCombinedMultiplier(
        forecastSettings,
        context
      );

      // 2) Fetch variants with recipes + ingredients AND compute stock alerts
      const [variantsRes, stockAlerts] = await Promise.all([
        supabase
          .from('menu_variants')
          .select(
            `
            id,
            name,
            price,
            baseline_daily,
            menu_items (
              name
            ),
            recipe_items (
              qty_per_serving,
              ingredients (
                name,
                unit
              )
            )
          `
          ),
        computeStockAlerts(combinedMultiplier, context),
      ]);

      if (variantsRes.error) throw variantsRes.error;

      const data = (variantsRes.data ?? []) as any[];

      const variantList: VariantForecast[] = data.map((row) => {
        const baseline = typeof row.baseline_daily === 'number'
          ? row.baseline_daily
          : 0;
        const forecast = Math.round(baseline * combinedMultiplier);

        // Build ingredient requirements for this variant
        const ingredientsNeeded: IngredientNeed[] = (row.recipe_items ?? [])
          .map((ri: any) => {
            const ing = ri.ingredients;
            if (!ing) return null;
            const perServing = Number(ri.qty_per_serving ?? 0);
            if (perServing <= 0 || forecast <= 0) return null;

            const qtyNeeded = perServing * forecast;
            return {
              ingredientName: ing.name as string,
              unit: ing.unit as string,
              qtyNeeded,
            };
          })
          .filter(Boolean) as IngredientNeed[];

        return {
          id: row.id as string,
          itemName: row.menu_items?.name ?? 'Item',
          variantName: row.name,
          price: row.price ?? 0,
          baseline,
          forecast,
          ingredientsNeeded,
        };
      });

      setCtx(context);
      setSettings(forecastSettings);
      setMultiplier(combinedMultiplier);
      setVariants(variantList);
      setAlerts(stockAlerts);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-run when Dashboard tab is focused (e.g. after changing settings)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) await loadData();
      })();
      return () => {
        active = false;
      };
    }, [loadData])
  );

  if (loading || !ctx || !settings) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading briefing & forecast…</Text>
      </View>
    );
  }

  const totalForecast = variants.reduce((sum, v) => sum + v.forecast, 0);

  const dateLabel = ctx.dateISO;
  const weatherLabel =
    ctx.weather === 'clear'
      ? 'Cerah'
      : ctx.weather === 'rain'
      ? 'Hujan'
      : 'Panas';

  return (
    <ScrollView
      style={{ flex: 1, padding: 20 }}
      contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
    >
      {/* Header row */}
        <View
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}
        >
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Dashboard</Text>
        {/* Settings navigation will be added later */}
        </View>

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {/* 06:00 Briefing card */}
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: '#f3f4f6',
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Ringkasan 06:00 — {dateLabel}
        </Text>
        <Text>
          Cuaca: <Text style={{ fontWeight: '600' }}>{weatherLabel}</Text>
        </Text>
        {ctx.isPublicHoliday && (
          <Text>
            Hari ini <Text style={{ fontWeight: '600' }}>cuti umum</Text>.
          </Text>
        )}
        {ctx.hasLocalEvent && ctx.localEventLabel && (
          <Text>
            Acara:{' '}
            <Text style={{ fontWeight: '600' }}>{ctx.localEventLabel}</Text>
          </Text>
        )}

        <Text style={{ marginTop: 4 }}>
          Faktor permintaan hari ini ≈{' '}
          <Text style={{ fontWeight: '700' }}>{multiplier.toFixed(2)}x</Text>{' '}
          daripada hari biasa.
        </Text>
        <Text>
          Jangkaan jumlah jualan:{' '}
          <Text style={{ fontWeight: '700' }}>{totalForecast} hidangan</Text>.
        </Text>
      </View>

      {/* Smart stock alerts */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Smart stock alerts
        </Text>

        {alerts.length === 0 ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: '#ecfdf3',
            }}
          >
            <Text style={{ color: '#166534' }}>
              Tiada amaran stok untuk hari ini. Semua ok 👍
            </Text>
          </View>
        ) : (
          alerts.map((a) => {
            const label =
              a.type === 'low_stock'
                ? 'Stok tak cukup'
                : a.type === 'expired'
                ? 'Luput'
                : 'Hampir luput';

            const color =
              a.severity === 'critical'
                ? '#b91c1c'
                : a.severity === 'warn'
                ? '#b45309'
                : '#374151';

            return (
              <View
                key={a.id}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderColor: '#eee',
                }}
              >
                <Text style={{ fontWeight: '700', color: color }}>
                  {label} — {a.ingredientName}
                </Text>
                <Text>{a.message}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Forecast per item + ingredient requirements */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Jangkaan mengikut menu
        </Text>
        {variants.map((v) => (
          <View
            key={v.id}
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: '#eee',
            }}
          >
            <Text style={{ fontWeight: '600' }}>
              {v.itemName} — {v.variantName}
            </Text>
            <Text>
              Baseline: {v.baseline.toFixed(0)} → Jangkaan:{' '}
              <Text style={{ fontWeight: '700' }}>{v.forecast}</Text> hidangan
            </Text>
            <Text style={{ color: '#666' }}>
              Harga: RM {v.price.toFixed(2)}
            </Text>

            {v.ingredientsNeeded.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <Text style={{ fontWeight: '500' }}>Bahan diperlukan:</Text>
                {v.ingredientsNeeded.map((ing, idx) => (
                  <Text key={`${v.id}_${ing.ingredientName}_${idx}`} style={{ color: '#555' }}>
                    • {ing.ingredientName}: {formatQty(ing.qtyNeeded, ing.unit)}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}