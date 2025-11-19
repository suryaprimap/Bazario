// app/(admin)/inventory.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal,
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

type BatchSummary = {
  id: string | null;
  qtyRemaining: number;
  expiryDate: string | null;
  receivedAt: string | null;
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

function dateOnly(value: string | null | undefined): string {
  if (!value) return '';
  return value.split('T')[0];
}

export default function InventoryScreen() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<TodayContext | null>(null);
  const [latestBatchByIngredient, setLatestBatchByIngredient] = useState<
    Record<string, BatchSummary>
  >({});
  const [formVisible, setFormVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InventoryRow | null>(null);
  const [formQty, setFormQty] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formReceived, setFormReceived] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');
  const [ingredientError, setIngredientError] = useState<string | null>(null);
  const [ingredientSaving, setIngredientSaving] = useState(false);

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
          .select('id, ingredient_id, qty_remaining, expiry_date, received_at')
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
      const latestMap: Record<string, BatchSummary> = {};

      for (const b of batches as any[]) {
        const ingId = b.ingredient_id as string;
        const qty = Number(b.qty_remaining ?? 0);

        latestMap[ingId] = {
          id: b.id ? String(b.id) : null,
          qtyRemaining: qty,
          expiryDate: b.expiry_date ? String(b.expiry_date) : null,
          receivedAt: b.received_at ? String(b.received_at) : null,
        };

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
      setLatestBatchByIngredient(latestMap);

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

  const closeForm = () => {
    setFormVisible(false);
    setSelectedRow(null);
    setFormQty('');
    setFormExpiry('');
    setFormReceived('');
    setFormError(null);
  };

  const openForm = (row: InventoryRow) => {
    const defaultDate = ctx?.dateISO ?? new Date().toISOString().split('T')[0];
    setSelectedRow(row);
    setFormVisible(true);
    setFormError(null);
    setFormQty('');
    setFormExpiry('');
    setFormReceived(defaultDate);
  };

  const handleSubmitForm = async () => {
    if (!selectedRow) return;
    const qtyValue = Number(formQty);

    if (!Number.isFinite(qtyValue) || qtyValue < 0) {
      setFormError('Masukkan kuantiti yang sah (>= 0).');
      return;
    }

    const normalizedExpiry = formExpiry.trim()
      ? formExpiry.trim()
      : null;
    const normalizedReceived = formReceived.trim()
      ? formReceived.trim()
      : ctx?.dateISO ?? new Date().toISOString().split('T')[0];

    setSaving(true);
    setFormError(null);

    try {
      const { error: insertError } = await supabase
        .from('ingredient_batches')
        .insert({
          ingredient_id: selectedRow.id,
          qty_remaining: qtyValue,
          expiry_date: normalizedExpiry,
          received_at: normalizedReceived,
        });

      if (insertError) throw insertError;

      await loadInventory();
      closeForm();
    } catch (err: any) {
      setFormError(err?.message ?? 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const openIngredientModal = () => {
    setIngredientModalVisible(true);
    setNewIngredientName('');
    setNewIngredientUnit('');
    setIngredientError(null);
  };

  const closeIngredientModal = () => {
    setIngredientModalVisible(false);
    setNewIngredientName('');
    setNewIngredientUnit('');
    setIngredientError(null);
  };

  const handleSaveIngredient = async () => {
    const name = newIngredientName.trim();
    const unit = newIngredientUnit.trim();

    if (!name || !unit) {
      setIngredientError('Nama dan unit bahan diperlukan.');
      return;
    }

    setIngredientSaving(true);
    setIngredientError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const payload: Record<string, any> = {
        name,
        unit,
        active: true,
      };
      if (user?.id) {
        payload.user_id = user.id;
      }

      const { error: insertError } = await supabase
        .from('ingredients')
        .insert(payload);

      if (insertError) throw insertError;

      closeIngredientModal();
      await loadInventory();
    } catch (err: any) {
      setIngredientError(err?.message ?? 'Gagal menambah bahan.');
    } finally {
      setIngredientSaving(false);
    }
  };

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
    <>
      <ScrollView
        style={{ flex: 1, padding: 20 }}
        contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>Inventory</Text>
            <Text style={{ color: '#555', marginTop: 2 }}>
              Laporan stok untuk tarikh:{' '}
              <Text style={{ fontWeight: '600' }}>{ctx.dateISO}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={openIngredientModal}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: '#111827',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: '700',
                marginTop: -1,
              }}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

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
        const latestBatch = latestBatchByIngredient[row.id];

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
            {latestBatch && (
              <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                Batch terakhir diterima:{' '}
                <Text style={{ fontWeight: '600' }}>
                  {latestBatch.receivedAt
                    ? dateOnly(latestBatch.receivedAt)
                    : 'tiada rekod'}
                </Text>
                {latestBatch.expiryDate
                  ? ` | Luput ${dateOnly(latestBatch.expiryDate)}`
                  : ''}
              </Text>
            )}
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#1d4ed8',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
                onPress={() => openForm(row)}
              >
                <Text
                  style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}
                >
                  Tambah stok
                </Text>
              </TouchableOpacity>
            </View>
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
      <Modal
        visible={ingredientModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeIngredientModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Tambah bahan baru
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Nama bahan</Text>
            <TextInput
              value={newIngredientName}
              onChangeText={setNewIngredientName}
              placeholder="cth: Beras"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            />
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              Unit (cth: kg, g, ml)
            </Text>
            <TextInput
              value={newIngredientUnit}
              onChangeText={setNewIngredientUnit}
              placeholder="kg"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            />
            {ingredientError && (
              <Text style={{ color: '#b91c1c', marginBottom: 12 }}>
                {ingredientError}
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity
                onPress={closeIngredientModal}
                disabled={ingredientSaving}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>
                  Batal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveIngredient}
                disabled={ingredientSaving}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: ingredientSaving ? '#9ca3af' : '#16a34a',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {ingredientSaving ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent
        onRequestClose={closeForm}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
              Tambah stok baru
            </Text>
            {selectedRow && (
              <Text style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
                {selectedRow.name}
              </Text>
            )}
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              Kuantiti ({selectedRow?.unit ?? ''})
            </Text>
            <TextInput
              value={formQty}
              onChangeText={setFormQty}
              keyboardType="numeric"
              placeholder="cth: 500"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            />
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              Tarikh diterima (YYYY-MM-DD)
            </Text>
            <TextInput
              value={formReceived}
              onChangeText={setFormReceived}
              placeholder="2025-01-01"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            />
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              Tarikh luput (pilihan)
            </Text>
            <TextInput
              value={formExpiry}
              onChangeText={setFormExpiry}
              placeholder="2025-02-15"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            />
            {formError && (
              <Text style={{ color: '#b91c1c', marginBottom: 12 }}>
                {formError}
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity
                onPress={closeForm}
                disabled={saving}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitForm}
                disabled={saving}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: saving ? '#9ca3af' : '#16a34a',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
