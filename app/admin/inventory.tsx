// app/(admin)/inventory.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

type InventoryRow = {
  id: string;
  name: string;
  unit: string;
  available: number;
  expiredQty: number;
  soonestExpiryDays: number | null;
  soonestExpiryDate: string | null;
  status: 'ok' | 'empty' | 'expired' | 'expiring';
};

// Mock context function
interface TodayContext {
  dateISO: string;
}

const getTodayContext = async (): Promise<TodayContext> => {
  const today = new Date();
  const dateISO = today.toISOString().split('T')[0];
  return { dateISO };
};

// Same formatter as dashboard/stock
function formatQty(qty: number, unit: string): string {
  const q = Math.ceil(qty);
  if (unit === 'g' && q >= 1000) {
    return `${(q / 1000).toFixed(1)} kg (~${q} g)`;
  }
  if (unit === 'ml' && q >= 1000) {
    return `${(q / 1000).toFixed(1)} L (~${q} ml)`;
  }
  return `${q} ${unit}`;
}

export default function InventoryScreen() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<TodayContext | null>(null);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔹 Use the same planning date as Dashboard (Demo Mode aware)
      const context = await getTodayContext();
      setCtx(context);

      const refDate = new Date(context.dateISO); // date-only from context
      const dayStart = new Date(
        `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(refDate.getDate()).padStart(2, '0')}`
      );
      const msDay = 1000 * 60 * 60 * 24;

      const [ingRes, batchRes] = await Promise.all([
        supabase
          .from('ingredients')
          .select('id, name, unit, active')
          .order('name', { ascending: true }),
        supabase
          .from('ingredient_batches')
          .select('ingredient_id, qty_remaining, expiry_date, received_at')
          .order('received_at', { ascending: true }),
      ]);

      if (ingRes.error) throw ingRes.error;
      if (batchRes.error) throw batchRes.error;

      const ingredients = ingRes.data ?? [];
      const batches = batchRes.data ?? [];

      // Aggregate per ingredient based on planning date
      const agg: Record<
        string,
        {
          available: number;
          expiredQty: number;
          soonestExpiryDays: number | null;
          soonestExpiryDate: string | null;
        }
      > = {};

      for (const b of batches as any[]) {
        const ingId = b.ingredient_id as string;
        const qty = Number(b.qty_remaining ?? 0);

        if (!agg[ingId]) {
          agg[ingId] = {
            available: 0,
            expiredQty: 0,
            soonestExpiryDays: null,
            soonestExpiryDate: null,
          };
        }

        if (!b.expiry_date) {
          // No expiry: treat as available
          agg[ingId].available += qty;
          continue;
        }

        const expDate = new Date(b.expiry_date as string);
        const diff = expDate.getTime() - dayStart.getTime();
        const diffDays = Math.floor(diff / msDay); // 🔹 demo-date-based

        if (diffDays < -3) {
            continue;
        } else if (diffDays < 0) {
          // expired relative to planning date
          agg[ingId].expiredQty += qty;
        } else {
          // not expired → available
          agg[ingId].available += qty;

          if (
            agg[ingId].soonestExpiryDays === null ||
            diffDays < (agg[ingId].soonestExpiryDays as number)
          ) {
            agg[ingId].soonestExpiryDays = diffDays;
            agg[ingId].soonestExpiryDate = String(b.expiry_date);
          }
        }
      }

      const rows: InventoryRow[] = (ingredients as any[]).map((ing) => {
        const info = agg[ing.id] ?? {
          available: 0,
          expiredQty: 0,
          soonestExpiryDays: null,
          soonestExpiryDate: null,
        };

        let status: InventoryRow['status'] = 'ok';
        if (info.available <= 0 && info.expiredQty <= 0) {
          status = 'empty';
        } else if (info.expiredQty > 0) {
          status = 'expired';
        } else if (
          info.soonestExpiryDays !== null &&
          info.soonestExpiryDays >= 0 &&
          info.soonestExpiryDays <= 3
        ) {
          status = 'expiring';
        }

        return {
          id: ing.id as string,
          name: ing.name as string,
          unit: ing.unit as string,
          available: info.available,
          expiredQty: info.expiredQty,
          soonestExpiryDays: info.soonestExpiryDays,
          soonestExpiryDate: info.soonestExpiryDate,
          status,
        };
      });

      setRows(rows);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Error loading inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) await loadInventory();
      })();
      return () => {
        active = false;
      };
    }, [loadInventory])
  );

  if (loading || !ctx) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading inventory…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 20 }}
      contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
    >
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
        Inventory
      </Text>
      <Text style={{ color: '#555', marginBottom: 4 }}>
        Laporan stok untuk tarikh:{' '}
        <Text style={{ fontWeight: '600' }}>{ctx.dateISO}</Text>
      </Text>

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {rows.map((row) => {
        let statusText = 'OK';
        let statusColor = '#16a34a';

        if (row.status === 'empty') {
          statusText = 'Habis';
          statusColor = '#b91c1c';
        } else if (row.status === 'expired') {
          statusText = 'Ada stok luput';
          statusColor = '#b91c1c';
        } else if (row.status === 'expiring') {
          statusText = 'Hampir luput';
          statusColor = '#b45309';
        }

        return (
          <View
            key={row.id}
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: '#eee',
            }}
          >
            {/* Name + status chip */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: '600', fontSize: 16 }}>
                {row.name}
              </Text>
              <View
                style={{
                  paddingVertical: 2,
                  paddingHorizontal: 8,
                  borderRadius: 999,
                  backgroundColor: '#f3f4f6',
                }}
              >
                <Text style={{ color: statusColor, fontSize: 12 }}>
                  {statusText}
                </Text>
              </View>
            </View>

            {/* Available / expired */}
            <Text>
              Stok tersedia:{' '}
              <Text style={{ fontWeight: '600' }}>
                {formatQty(row.available, row.unit)}
              </Text>
            </Text>
            {row.expiredQty > 0 && (
              <Text style={{ color: '#b91c1c' }}>
                Stok luput:{' '}
                <Text style={{ fontWeight: '600' }}>
                  {formatQty(row.expiredQty, row.unit)}
                </Text>
              </Text>
            )}

            {/* Expiry info */}
            {row.soonestExpiryDays !== null && row.soonestExpiryDate && (
              <Text style={{ color: '#555' }}>
                Batch terawal luput:{' '}
                <Text style={{ fontWeight: '600' }}>
                  {row.soonestExpiryDate} (
                  {row.soonestExpiryDays === 0
                    ? 'luput hari ini'
                    : `dalam ${row.soonestExpiryDays} hari`}
                  )
                </Text>
              </Text>
            )}
          </View>
        );
      })}

      {rows.length === 0 && (
        <Text style={{ color: '#666', marginTop: 16 }}>
          Tiada bahan lagi. Tambah bahan melalui backend atau nanti kita buat
          form tambah stok.
        </Text>
      )}
    </ScrollView>
  );
}