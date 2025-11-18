// src/lib/stock.ts
import { supabase } from './supabase';
import type { TodayContext } from './demoContext';

export type StockAlertType = 'low_stock' | 'expiring_soon' | 'expired';
export type StockAlertSeverity = 'info' | 'warn' | 'critical';

export type StockAlert = {
  id: string;
  type: StockAlertType;
  ingredientId: string;
  ingredientName: string;
  message: string;
  severity: StockAlertSeverity;
};

type StockInfo = {
  available: number; // only NON-expired qty
  expiredQty: number; // expired but not too old
  expiringSoonMinDays: number | null;
  expiredReceivedDates: string[];
  hasExpiredYesterday: boolean; // at least one batch expired exactly 1 day ago
};

// Format quantity to something human-friendly
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

export async function computeStockAlerts(
  multiplier: number,
  ctx: TodayContext
): Promise<StockAlert[]> {
  // Use planning date from Demo Context (same as Dashboard & Inventory)
  const refDate = new Date(ctx.dateISO);
  const dayStart = new Date(
    `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(refDate.getDate()).padStart(2, '0')}`
  );
  const msDay = 1000 * 60 * 60 * 24;

  // 1) Load data
  const [ingRes, batchRes, recipeRes, variantRes] = await Promise.all([
    supabase
      .from('ingredients')
      .select('id, name, unit, low_stock_days_override'),
    supabase
      .from('ingredient_batches')
      .select('ingredient_id, qty_remaining, expiry_date, received_at'),
    supabase
      .from('recipe_items')
      .select('variant_id, ingredient_id, qty_per_serving'),
    supabase.from('menu_variants').select('id, baseline_daily'),
  ]);

  if (ingRes.error) throw ingRes.error;
  if (batchRes.error) throw batchRes.error;
  if (recipeRes.error) throw recipeRes.error;
  if (variantRes.error) throw variantRes.error;

  const ingredients = ingRes.data ?? [];
  const batches = batchRes.data ?? [];
  const recipes = recipeRes.data ?? [];
  const variants = variantRes.data ?? [];

  // 2) Today servings per variant = baseline * multiplier
  const variantServings: Record<string, number> = {};
  for (const v of variants as any[]) {
    const base = typeof v.baseline_daily === 'number' ? v.baseline_daily : 0;
    variantServings[v.id as string] = base * multiplier;
  }

  // 3) Forecasted ingredient usage (per day)
  const usageMap: Record<string, number> = {};
  for (const r of recipes as any[]) {
    const varId = r.variant_id as string;
    const ingId = r.ingredient_id as string;
    const perServing = Number(r.qty_per_serving ?? 0);
    const servings = variantServings[varId] ?? 0;
    if (servings <= 0 || perServing <= 0) continue;

    const add = servings * perServing;
    usageMap[ingId] = (usageMap[ingId] ?? 0) + add;
  }

  // 4) Build stock info per ingredient
  const stockMap: Record<string, StockInfo> = {};

  for (const b of batches as any[]) {
    const ingId = b.ingredient_id as string;
    const qty = Number(b.qty_remaining ?? 0);

    if (!stockMap[ingId]) {
      stockMap[ingId] = {
        available: 0,
        expiredQty: 0,
        expiringSoonMinDays: null,
        expiredReceivedDates: [],
        hasExpiredYesterday: false,
      };
    }

    const info = stockMap[ingId];

    // No expiry date → always available
    if (!b.expiry_date) {
      info.available += qty;
      continue;
    }

    const expDate = new Date(b.expiry_date as string);
    const diff = expDate.getTime() - dayStart.getTime();
    const diffDays = Math.floor(diff / msDay); // relative to planning date

    // 🔹 If expired more than 3 days ago → assume already dibuang, ignore
    if (diffDays < -3) {
      continue;
    }

    if (diffDays < 0) {
      // 🔸 Expired 1–3 days ago
      info.expiredQty += qty;
      if (b.received_at) {
        info.expiredReceivedDates.push(String(b.received_at));
      }
      // Only show alert when diffDays == -1 → "day after expired"
      if (diffDays === -1) {
        info.hasExpiredYesterday = true;
      }
    } else {
      // 🔸 Not expired → counts as available
      info.available += qty;

      // Track earliest non-expired batch that will expire soon
      if (diffDays <= 3) {
        if (
          info.expiringSoonMinDays === null ||
          diffDays < (info.expiringSoonMinDays as number)
        ) {
          info.expiringSoonMinDays = diffDays;
        }
      }
    }
  }

  // 5) Build alerts
  const alerts: StockAlert[] = [];

  for (const ing of ingredients as any[]) {
    const ingId = ing.id as string;
    const ingName = ing.name as string;
    const unit = ing.unit as string;
    const info = stockMap[ingId] ?? {
      available: 0,
      expiredQty: 0,
      expiringSoonMinDays: null,
      expiredReceivedDates: [],
      hasExpiredYesterday: false,
    };
    const usage = usageMap[ingId] ?? 0;

    // ---- Low stock: not enough for today’s forecast ----
    if (usage > 0) {
      const coverageFloat = info.available / usage;
      const coverageDays = Math.floor(coverageFloat); // 🔹 rounded DOWN
      const shortage = usage - info.available;

      if (shortage > 0) {
        const qtyText = formatQty(shortage, unit);
        alerts.push({
          id: `low_${ingId}`,
          type: 'low_stock',
          ingredientId: ingId,
          ingredientName: ingName,
          severity: 'critical',
          message:
            `${ingName}: stok tak cukup untuk ramalan hari ini. ` +
            `Tambah kira-kira ${qtyText} sebelum buka gerai.`,
        });
      }
      // if coverageDays >= 1 → no low_stock alert (cukup untuk 1 hari)
    }

    // ---- Expiring soon (0–3 days from planning date) ----
    if (
      info.expiringSoonMinDays !== null &&
      info.expiringSoonMinDays >= 0 &&
      info.expiringSoonMinDays <= 3
    ) {
      const d = info.expiringSoonMinDays;
      const text =
        d === 0
          ? 'akan luput hari ini.'
          : `akan luput dalam ${d} hari.`;

      alerts.push({
        id: `soon_${ingId}`,
        type: 'expiring_soon',
        ingredientId: ingId,
        ingredientName: ingName,
        severity: 'warn',
        message: `${ingName}: sebahagian stok ${text}`,
      });
    }

    // ---- Expired alert: ONLY the day after expiry ----
    if (info.expiredQty > 0 && info.hasExpiredYesterday) {
      const qtyText = formatQty(info.expiredQty, unit);
      const uniqueDates = Array.from(
        new Set(info.expiredReceivedDates.map((d) => String(d)))
      );

      let detail: string;
      if (uniqueDates.length === 1) {
        detail = `batch diterima pada ${uniqueDates[0]}`;
      } else if (uniqueDates.length > 1) {
        detail = `beberapa batch lama (${uniqueDates[0]} dan lain-lain)`;
      } else {
        detail = 'beberapa batch lama';
      }

      alerts.push({
        id: `expired_${ingId}`,
        type: 'expired',
        ingredientId: ingId,
        ingredientName: ingName,
        severity: 'critical',
        message:
          `${ingName}: ada ${qtyText} stok yang sudah luput semalam (${detail}). ` +
          `Tolong asing & buang — stok luput tidak dikira sebagai stok tersedia.`,
      });
    }
  }

  // 6) Sort: critical > warn > info, then by name
  const severityOrder: Record<StockAlertSeverity, number> = {
    critical: 0,
    warn: 1,
    info: 2,
  };

  alerts.sort((a, b) => {
    const s = severityOrder[a.severity] - severityOrder[b.severity];
    if (s !== 0) return s;
    return a.ingredientName.localeCompare(b.ingredientName);
  });

  return alerts;
}