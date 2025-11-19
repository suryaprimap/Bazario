// app/(admin)/sales.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import {
  AdminScreen,
  AdminCard,
  SectionHeading,
} from '../../components/admin/AdminUI';

type PaymentMethod = 'cash' | 'duitnowqr'; // follow SQL enum

type VariantRow = {
  id: string;
  itemName: string;
  variantName: string;
  price: number;
};

type CartEntry = {
  variantId: string;
  qty: number;
  price: number;
  itemName: string;
  variantName: string;
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

export default function SalesScreen() {
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [ctx, setCtx] = useState<TodayContext | null>(null);

  const screenSubtitle = ctx
    ? `Catat jualan untuk ${ctx.dateISO}`
    : 'Catat jualan harian anda';

  const loadData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);

        const [context, res] = await Promise.all([
            getTodayContext(),
            supabase
                .from('menu_variants')
                .select(
                    `
                    id,
                    name,
                    price,
                    menu_items (
                        name
                    )
                `
                )   
                .order('id', { ascending: true }),
        ]);

        setCtx(context);

        if (res.error) throw res.error;

        const list: VariantRow[] = (res.data ?? []).map((row: any) => ({
            id: row.id as string,
            itemName: row.menu_items?.name ?? 'Item',
            variantName: row.name as string,
            price: Number(row.price ?? 0),
        }));

        setVariants(list);
    } catch (e: any) {
        console.error(e);
        setError(e.message ?? 'Error loading menu items');
    } finally {
        setLoading(false);
    }
  }, []);


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

  const changeQty = (variant: VariantRow, delta: number) => {
    setCart((prev) => {
      const existing = prev[variant.id];
      const currentQty = existing?.qty ?? 0;
      const newQty = currentQty + delta;
      const next = { ...prev };

      if (newQty <= 0) {
        delete next[variant.id];
      } else {
        next[variant.id] = {
          variantId: variant.id,
          qty: newQty,
          price: variant.price,
          itemName: variant.itemName,
          variantName: variant.variantName,
        };
      }

      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    setInfo(null);
    setError(null);
  };

  const saveSale = async () => {
    try {
        setSaving(true);
        setError(null);
        setInfo(null);

        const items = Object.values(cart);
        if (items.length === 0) {
            setError('Tiada item dalam jualan. Tambah kuantiti dahulu.');
            return;
        }

        let context = ctx;
        if (!context) {
            context = await getTodayContext();
            setCtx(context);
        }
        const businessDateISO = context.dateISO; // "YYYY-MM-DD"

        // 1) Get session (we need user_id)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            throw new Error('Sila log masuk sebelum merekod jualan.');
        }

        const userId = session.user.id;

        // 2) Calculate gross amount
        const grossAmount = items.reduce(
            (sum: number, item: CartEntry) => sum + item.qty * item.price,
            0
        );

        // 3) Insert sale header row
        const { data: saleInsert, error: saleError } = await supabase
            .from('sales')
            .insert({
                user_id: userId,
                sold_at: `${businessDateISO}T00:00:00Z`,
                payment_method: paymentMethod, // 'cash' | 'duitnowqr'
                gross_amount: grossAmount,
            })
            .select('id')
            .single();

        if (saleError) throw saleError;
        const saleId = saleInsert.id as string;

        // 4) Insert sale_items rows
        const itemRows = items.map((item) => ({
            sale_id: saleId,
            variant_id: item.variantId,
            qty: item.qty,
            unit_price: item.price,
            line_total: item.qty * item.price,
        }));

        const { error: itemsError } = await supabase
            .from('sale_items')
            .insert(itemRows);

        if (itemsError) throw itemsError;

        const { error: consumeError } = await supabase.rpc(
            'consume_stock_for_sale',
            { p_sale_id: saleId }
        );

        if (consumeError) {
            console.error('consume_stock_for_sale error', consumeError);
            // Sale is already saved, so we show a warning, not a full failure
            setInfo(
                'Jualan disimpan, tetapi stok tidak berjaya dikemaskini secara automatik.'
            );
        } else {
            setInfo('Jualan berjaya direkod & stok dikemaskini.');
        }
        setCart({});
    } catch (e: any) {
        console.error(e);
        setError(e.message ?? 'Ralat semasa menyimpan jualan');
    } finally {
        setSaving(false);
    }
  };  


  // Compute summary
  const cartItems = Object.values(cart);
  const totalQty = cartItems.reduce((sum: number, item: CartEntry) => sum + item.qty, 0);
  const totalAmount = cartItems.reduce(
    (sum: number, item: CartEntry) => sum + item.qty * item.price,
    0
  );

  if (loading || !ctx) {
    return (
      <AdminScreen title="Jualan" subtitle="Memuatkan data POS">
        <AdminCard style={{ alignItems: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading menu & tarikh jualan.</Text>
        </AdminCard>
      </AdminScreen>
    );
  }

  const summaryCard = (
    <AdminCard style={{ paddingBottom: 12 }}>
      <SectionHeading label="Ringkasan pesanan" />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text>
          Item:{' '}
          <Text style={{ fontWeight: '600' }}>{totalQty}</Text>
        </Text>
        <Text>
          Jumlah:{' '}
          <Text style={{ fontWeight: '700' }}>
            RM {totalAmount.toFixed(2)}
          </Text>
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={clearCart}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#d4d4d4',
            alignItems: 'center',
          }}
          disabled={saving}
        >
          <Text style={{ fontWeight: '500' }}>Kosongkan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={saveSale}
          disabled={saving || totalQty === 0}
          style={{
            flex: 2,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: saving || totalQty === 0 ? '#9ca3af' : '#111827',
            alignItems: 'center',
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700' }}>Simpan jualan</Text>
          )}
        </TouchableOpacity>
      </View>
    </AdminCard>
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminScreen
        title="Jualan"
        subtitle={screenSubtitle}
        contentPaddingBottom={220}
      >
        {error && (
          <AdminCard style={{ backgroundColor: '#fef2f2', borderColor: '#fee2e2' }}>
            <Text style={{ color: '#b91c1c', fontWeight: '600' }}>{error}</Text>
          </AdminCard>
        )}
        {info && (
          <AdminCard style={{ backgroundColor: '#ecfdf3', borderColor: '#d1fae5' }}>
            <Text style={{ color: '#065f46', fontWeight: '600' }}>{info}</Text>
          </AdminCard>
        )}

        <AdminCard>
          <SectionHeading label="Kaedah bayaran" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {(['cash', 'duitnowqr'] as PaymentMethod[]).map((pm) => {
              const active = paymentMethod === pm;
              return (
                <TouchableOpacity
                  key={pm}
                  onPress={() => setPaymentMethod(pm)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: active ? 0 : 1,
                    borderColor: '#d1d5db',
                    backgroundColor: active ? '#0f172a' : '#fff',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: active ? '#fff' : '#0f172a',
                      fontWeight: '600',
                    }}
                  >
                    {pm === 'cash' ? 'Tunai' : 'DuitNow QR'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </AdminCard>

        <AdminCard>
          <SectionHeading label="Pilih item" />
          <View style={{ gap: 12 }}>
            {variants.map((v) => {
              const entry = cart[v.id];
              const qty = entry?.qty ?? 0;
              const lineTotal = qty * v.price;

              return (
                <View
                  key={v.id}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: '#fff',
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ fontWeight: '600' }}>
                        {v.itemName} - {v.variantName}
                      </Text>
                      <Text style={{ color: '#6b7280', fontSize: 12 }}>
                        RM {v.price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#6b7280', fontSize: 12 }}>Qty: {qty}</Text>
                      <Text style={{ fontWeight: '600' }}>
                        RM {lineTotal.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => changeQty(v, -1)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: '#d4d4d4',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>-</Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        minWidth: 28,
                        textAlign: 'center',
                        fontWeight: '600',
                      }}
                    >
                      {qty}
                    </Text>
                    <TouchableOpacity
                      onPress={() => changeQty(v, 1)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: '#111827',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 18, color: '#fff' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </AdminCard>
      </AdminScreen>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: 'transparent',
        }}
      >
        {summaryCard}
      </View>
    </View>
  );
}
