// app/(admin)/menu.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import {
  AdminScreen,
  AdminCard,
  SectionHeading,
} from '../../components/admin/AdminUI';

type Ingredient = {
  id: string;
  name: string;
  unit: 'g' | 'ml' | 'pcs' | string;
};

type MenuItem = {
  id: string;
  name: string;
  category: string | null;
  active: boolean;
};

type MenuVariant = {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  baseline_daily: number;
  sku: string | null;
};

type RecipeRow = {
  variant_id: string;
  ingredient_id: string;
  qty_per_serving: number;
  ingredient_name?: string;
  ingredient_unit?: string;
};

export default function MenuScreen() {
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [variants, setVariants] = useState<MenuVariant[]>([]);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Add menu form (show/hide + fields)
  const [showAddMenuForm, setShowAddMenuForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  // Add variant form (show/hide + fields)
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantBaseline, setNewVariantBaseline] = useState('');

  // Recipe editor (for active variant)
  const [recipeVariantId, setRecipeVariantId] = useState<string | null>(null);
  const [recipeIngredientId, setRecipeIngredientId] = useState<string>('');
  const [recipeQty, setRecipeQty] = useState('');
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) Current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Tidak dapat mengenal pasti pengguna.');

      const userId = user.id;

      // 2) Ingredients
      const { data: ingRows, error: ingError } = await supabase
        .from('ingredients')
        .select('id, name, unit')
        .eq('user_id', userId)
        .order('name');

      if (ingError) throw ingError;

      const ingredientsMapped: Ingredient[] = (ingRows ?? []).map((r: any) => ({
        id: r.id as string,
        name: r.name as string,
        unit: r.unit as string,
      }));
      setIngredients(ingredientsMapped);

      // 3) Menu items
      const { data: itemRows, error: itemError } = await supabase
        .from('menu_items')
        .select('id, name, category, active')
        .eq('user_id', userId)
        .order('name');

      if (itemError) throw itemError;

      const itemsMapped: MenuItem[] = (itemRows ?? []).map((r: any) => ({
        id: r.id as string,
        name: r.name as string,
        category: r.category ?? null,
        active: r.active ?? true,
      }));
      setItems(itemsMapped);

      // 4) Variants
      let variantsMapped: MenuVariant[] = [];
      let recipesMapped: RecipeRow[] = [];

      if (itemsMapped.length > 0) {
        const itemIds = itemsMapped.map((m) => m.id);

        const { data: variantRows, error: variantError } = await supabase
          .from('menu_variants')
          .select('id, menu_item_id, name, price, baseline_daily, sku')
          .in('menu_item_id', itemIds);

        if (variantError) throw variantError;

        variantsMapped = (variantRows ?? []).map((r: any) => ({
          id: r.id as string,
          menu_item_id: r.menu_item_id as string,
          name: r.name as string,
          price: Number(r.price ?? 0),
          baseline_daily: Number(r.baseline_daily ?? 0),
          sku: r.sku ?? null,
        }));
        setVariants(variantsMapped);

        if (variantsMapped.length > 0) {
          const variantIds = variantsMapped.map((v) => v.id);
          const { data: recipeRows, error: recipeError } = await supabase
            .from('recipe_items')
            .select('variant_id, ingredient_id, qty_per_serving')
            .in('variant_id', variantIds);

          if (recipeError) throw recipeError;

          const ingMap = new Map<string, Ingredient>();
          ingredientsMapped.forEach((ing) => ingMap.set(ing.id, ing));

          recipesMapped = (recipeRows ?? []).map((r: any) => {
            const ing = ingMap.get(r.ingredient_id as string);
            return {
              variant_id: r.variant_id as string,
              ingredient_id: r.ingredient_id as string,
              qty_per_serving: Number(r.qty_per_serving ?? 0),
              ingredient_name: ing?.name,
              ingredient_unit: ing?.unit,
            };
          });
          setRecipes(recipesMapped);
        } else {
          setRecipes([]);
        }
      } else {
        setVariants([]);
        setRecipes([]);
      }

      // 5) Auto-select menu & variant if none chosen
      if (!selectedItemId && itemsMapped.length > 0) {
        const firstItemId = itemsMapped[0].id;
        setSelectedItemId(firstItemId);

        const firstItemVariants = variantsMapped.filter(
          (v) => v.menu_item_id === firstItemId
        );
        if (!selectedVariantId && firstItemVariants.length > 0) {
          setSelectedVariantId(firstItemVariants[0].id);
        }
      } else if (selectedItemId) {
        const selectedItemVariants = variantsMapped.filter(
          (v) => v.menu_item_id === selectedItemId
        );
        if (selectedItemVariants.length > 0) {
          const stillValid = selectedItemVariants.some(
            (v) => v.id === selectedVariantId
          );
          if (!stillValid) {
            setSelectedVariantId(selectedItemVariants[0].id);
          }
        } else {
          setSelectedVariantId(null);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Ralat semasa memuatkan menu.');
      setItems([]);
      setVariants([]);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedItemId, selectedVariantId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) {
          await loadData();
        }
      })();
      return () => {
        active = false;
      };
    }, [loadData])
  );

  // Helpers
  const variantsByItem = (itemId: string) =>
    variants.filter((v) => v.menu_item_id === itemId);

  const recipesByVariant = (variantId: string) =>
    recipes.filter((r) => r.variant_id === variantId);

  const ingredientCountForItem = (itemId: string) => {
    const vIds = variantsByItem(itemId).map((v) => v.id);
    const used = new Set(
      recipes
        .filter((r) => vIds.includes(r.variant_id))
        .map((r) => r.ingredient_id)
    );
    return used.size;
  };

  const selectedItem =
    items.find((m) => m.id === selectedItemId) ?? null;
  const selectedVariant =
    selectedVariantId &&
    variants.find((v) => v.id === selectedVariantId) || null;

  const totalMenus = items.length;
  const totalVariants = variants.length;
  const uniqueRecipeIngredients = new Set(
    recipes.map((r) => r.ingredient_id)
  ).size;

  // Handlers
  const handleAddItem = async () => {
    try {
      setError(null);
      const name = newItemName.trim();
      if (!name) {
        setError('Sila isi nama menu.');
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Pengguna tidak sah.');

      const { error: insError } = await supabase.from('menu_items').insert({
        user_id: user.id,
        name,
        category: newItemCategory.trim() || null,
      });
      if (insError) throw insError;

      setNewItemName('');
      setNewItemCategory('');
      setShowAddMenuForm(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Ralat semasa menambah menu.');
    }
  };

  const handleAddVariant = async () => {
    try {
      setError(null);
      if (!selectedItemId) {
        setError('Sila pilih menu dahulu.');
        return;
      }
      const vName = newVariantName.trim();
      if (!vName) {
        setError('Sila isi nama varian.');
        return;
      }

      const price = Number(newVariantPrice);
      const baseline = Number(newVariantBaseline || '20');
      if (!Number.isFinite(price) || price <= 0) {
        setError('Harga tidak sah.');
        return;
      }

      const { data, error: insError } = await supabase
        .from('menu_variants')
        .insert({
          menu_item_id: selectedItemId,
          name: vName,
          price,
          baseline_daily: baseline,
        })
        .select('id')
        .single();

      if (insError) throw insError;

      setNewVariantName('');
      setNewVariantPrice('');
      setNewVariantBaseline('');
      setShowVariantForm(false);

      if (data?.id) {
        setSelectedVariantId(data.id as string);
        setRecipeVariantId(data.id as string);
      }

      await loadData();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Ralat semasa menambah varian.');
    }
  };

  const handleSaveRecipe = async () => {
    try {
      setError(null);
      if (!recipeVariantId) {
        setError('Varian tidak dipilih.');
        return;
      }
      if (!recipeIngredientId) {
        setError('Sila pilih bahan.');
        return;
      }
      const qty = Number(recipeQty);
      if (!Number.isFinite(qty) || qty <= 0) {
        setError('Kuantiti per hidangan tidak sah.');
        return;
      }

      const { error: upsertError } = await supabase
        .from('recipe_items')
        .upsert(
          {
            variant_id: recipeVariantId,
            ingredient_id: recipeIngredientId,
            qty_per_serving: qty,
          },
          { onConflict: 'variant_id,ingredient_id' }
        );

      if (upsertError) throw upsertError;

      setRecipeIngredientId('');
      setRecipeQty('');
      setRecipeVariantId(null);
      setShowIngredientPicker(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Ralat semasa menyimpan resipi.');
    }
  };

  const handleEditRecipeRow = (
    variantId: string,
    ingredientId: string,
    qty: number
  ) => {
    setSelectedVariantId(variantId);
    setRecipeVariantId(variantId);
    setRecipeIngredientId(ingredientId);
    setRecipeQty(String(qty));
    setShowIngredientPicker(false);
  };

  const handleDeleteRecipeRow = async (
    variantId: string,
    ingredientId: string
  ) => {
    try {
      setError(null);
      const { error: delError } = await supabase
        .from('recipe_items')
        .delete()
        .match({ variant_id: variantId, ingredient_id: ingredientId });
      if (delError) throw delError;

      if (
        recipeVariantId === variantId &&
        recipeIngredientId === ingredientId
      ) {
        setRecipeVariantId(null);
        setRecipeIngredientId('');
        setRecipeQty('');
      }

      await loadData();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Ralat semasa memadam bahan.');
    }
  };

  const screenSubtitle =
    '1) Pilih menu · 2) Pilih / tambah varian · 3) Ubah resipi.';
  const headerAction = (
    <TouchableOpacity
      onPress={() => setShowAddMenuForm((x) => !x)}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: '#fff',
          fontSize: 22,
          fontWeight: '600',
          marginTop: -2,
        }}
      >
        +
      </Text>
    </TouchableOpacity>
  );

  if (loading && items.length === 0) {
    return (
      <AdminScreen
        title="Menu & Resipi"
        subtitle={screenSubtitle}
        actions={headerAction}
      >
        <AdminCard style={{ alignItems: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading menu…</Text>
        </AdminCard>
      </AdminScreen>
    );
  }

  return (
    <AdminScreen
      title="Menu & Resipi"
      subtitle={screenSubtitle}
      actions={headerAction}
      contentPaddingBottom={160}
    >
      {error && (
        <AdminCard
          style={{
            backgroundColor: '#fef2f2',
            borderColor: '#fee2e2',
          }}
        >
          <Text style={{ color: '#b91c1c', fontWeight: '600' }}>{error}</Text>
        </AdminCard>
      )}

      <AdminCard>
        <SectionHeading label="Ringkasan" />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {[{
            label: 'Menu aktif',
            value: totalMenus,
          },
          {
            label: 'Jumlah varian',
            value: totalVariants,
          },
          {
            label: 'Bahan unik digunakan',
            value: uniqueRecipeIngredients,
          }].map((stat) => (
            <View
              key={stat.label}
              style={{
                flexGrow: 1,
                minWidth: 120,
                padding: 12,
                borderRadius: 12,
                backgroundColor: '#f5f7fb',
              }}
            >
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {stat.label}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a' }}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </AdminCard>

      {showAddMenuForm && (
        <AdminCard>
          <SectionHeading label="Tambah menu baru" />
          <TextInput
            placeholder="Nama menu"
            value={newItemName}
            onChangeText={setNewItemName}
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 8,
              backgroundColor: '#fff',
            }}
          />
          <TextInput
            placeholder="Kategori (optional)"
            value={newItemCategory}
            onChangeText={setNewItemCategory}
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
              backgroundColor: '#fff',
            }}
          />
          <TouchableOpacity
            onPress={handleAddItem}
            style={{
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: '#111827',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Simpan menu</Text>
          </TouchableOpacity>
        </AdminCard>
      )}

      <AdminCard>
        <SectionHeading label="Langkah 1 · Pilih menu" />
        {items.length === 0 ? (
          <Text style={{ color: '#6b7280' }}>
            Tiada menu lagi. Tekan ikon + di atas untuk menambah.
          </Text>
        ) : (
          items.map((item) => {
            const active = item.id === selectedItemId;
            const vCount = variantsByItem(item.id).length;
            const ingCount = ingredientCountForItem(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setSelectedItemId(item.id);
                  const vs = variantsByItem(item.id);
                  if (vs.length > 0) {
                    setSelectedVariantId(vs[0].id);
                    setRecipeVariantId(null);
                    setRecipeIngredientId('');
                    setRecipeQty('');
                  }
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: '#f1f5f9',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: active ? '700' : '500',
                        color: active ? '#0f172a' : '#475467',
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                      {item.category || 'Tanpa kategori'} ·{' '}
                      {item.active ? 'Aktif' : 'Tidak aktif'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                      {vCount} varian
                    </Text>
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                      {ingCount} bahan
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </AdminCard>

      {selectedItem && (
        <AdminCard>
          <SectionHeading label="Langkah 2 & 3 · Varian & Resipi" />
          <Text style={{ fontWeight: '700', marginBottom: 2 }}>{selectedItem.name}</Text>
          <Text style={{ color: '#94a3b8', marginBottom: 10 }}>
            Kategori: {selectedItem.category || 'Tiada'} ·{' '}
            {selectedItem.active ? 'Aktif' : 'Tidak aktif'}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {variantsByItem(selectedItem.id).map((v) => {
              const active = v.id === selectedVariantId;
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => {
                    setSelectedVariantId(v.id);
                    setRecipeVariantId(null);
                    setRecipeIngredientId('');
                    setRecipeQty('');
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: active ? '#111827' : '#e5e7eb',
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: active ? '#fff' : '#111827',
                      fontWeight: active ? '600' : '500',
                    }}
                  >
                    {v.name} · RM {v.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setShowVariantForm((x) => !x)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: '#f97316',
              }}
            >
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                + Varian
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {showVariantForm && (
            <View
              style={{
                marginBottom: 12,
                padding: 10,
                borderRadius: 12,
                backgroundColor: '#f3f4f6',
              }}
            >
              <Text style={{ fontWeight: '600', marginBottom: 6 }}>Tambah varian baharu</Text>
              <TextInput
                placeholder="Nama varian (cth: Regular)"
                value={newVariantName}
                onChangeText={setNewVariantName}
                style={{
                  borderWidth: 1,
                  borderColor: '#d4d4d4',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  marginBottom: 8,
                  backgroundColor: '#fff',
                }}
              />
              <View style={{ flexDirection: 'row', marginBottom: 8, gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>Harga (RM)</Text>
                  <TextInput
                    placeholder="cth: 12.90"
                    value={newVariantPrice}
                    onChangeText={setNewVariantPrice}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: '#d4d4d4',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: '#fff',
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>
                    Baseline harian
                  </Text>
                  <TextInput
                    placeholder="cth: 30"
                    value={newVariantBaseline}
                    onChangeText={setNewVariantBaseline}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: '#d4d4d4',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: '#fff',
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleAddVariant}
                style={{
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: '#111827',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Simpan varian</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedVariant && (
            <>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                }}
              >
                <Text style={{ fontWeight: '600', marginBottom: 8 }}>
                  Bahan untuk {selectedVariant.name}
                </Text>
                {recipesByVariant(selectedVariant.id).length === 0 ? (
                  <Text style={{ color: '#94a3b8' }}>
                    Belum ada bahan untuk varian ini.
                  </Text>
                ) : (
                  recipesByVariant(selectedVariant.id).map((r) => (
                    <View
                      key={`${r.variant_id}_${r.ingredient_id}`}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderColor: '#f1f5f9',
                      }}
                    >
                      <View>
                        <Text style={{ fontWeight: '500' }}>
                          {r.ingredient_name} ({r.ingredient_unit})
                        </Text>
                        <Text style={{ color: '#94a3b8' }}>
                          {r.qty_per_serving} per hidangan
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() =>
                            handleEditRecipeRow(
                              r.variant_id,
                              r.ingredient_id,
                              r.qty_per_serving
                            )
                          }
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                          }}
                        >
                          <Text style={{ fontSize: 12 }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            handleDeleteRecipeRow(
                              r.variant_id,
                              r.ingredient_id
                            )
                          }
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 10,
                            backgroundColor: '#fee2e2',
                          }}
                        >
                          <Text style={{ fontSize: 12, color: '#b91c1c' }}>
                            Buang
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View
                style={{
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: '#f8fafc',
                }}
              >
                <Text style={{ fontWeight: '600', marginBottom: 6 }}>
                  Tambah / edit bahan resipi
                </Text>

                <TouchableOpacity
                  onPress={() => setShowIngredientPicker((x) => !x)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 6,
                    backgroundColor: '#fff',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>
                    {recipeIngredientId
                      ? (() => {
                          const ing = ingredients.find(
                            (i) => i.id === recipeIngredientId
                          );
                          return ing
                            ? `${ing.name} (${ing.unit})`
                            : 'Pilih bahan';
                        })()
                      : 'Pilih bahan'}
                  </Text>
                </TouchableOpacity>

                {showIngredientPicker && (
                  <View
                    style={{
                      maxHeight: 150,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      borderRadius: 10,
                      marginBottom: 6,
                      backgroundColor: '#fff',
                    }}
                  >
                    <ScrollView>
                      {ingredients.map((ing) => (
                        <TouchableOpacity
                          key={ing.id}
                          onPress={() => {
                            setRecipeIngredientId(ing.id);
                            setShowIngredientPicker(false);
                          }}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderBottomWidth: 1,
                            borderColor: '#f1f5f9',
                          }}
                        >
                          <Text style={{ fontSize: 12 }}>
                            {ing.name} ({ing.unit})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>
                    Kuantiti per hidangan
                  </Text>
                  <TextInput
                    placeholder="cth: 120"
                    value={recipeQty}
                    onChangeText={setRecipeQty}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: '#fff',
                    }}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={handleSaveRecipe}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: '#111827',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                      Simpan resipi
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setRecipeVariantId(null);
                      setRecipeIngredientId('');
                      setRecipeQty('');
                      setShowIngredientPicker(false);
                    }}
                    style={{
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      backgroundColor: '#fff',
                      minWidth: 100,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#0f172a', fontWeight: '500' }}>
                      Batal
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </AdminCard>
      )}

      {loading && (
        <AdminCard style={{ alignItems: 'center' }}>
          <ActivityIndicator />
        </AdminCard>
      )}
    </AdminScreen>
  );
}

