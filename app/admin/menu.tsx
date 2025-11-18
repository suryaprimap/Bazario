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

  if (loading && items.length === 0) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading menu…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 20 }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header + Add menu icon */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>
            Menu & Resipi
          </Text>
          <Text style={{ color: '#4b5563', marginTop: 2, fontSize: 12 }}>
            1) Pilih menu → 2) Pilih / tambah varian → 3) Ubah resipi.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowAddMenuForm((x) => !x)}
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
            ＋
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick summary */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 10,
        }}
      >
        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: '#111827',
            marginRight: 6,
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: '#f9fafb',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {totalMenus} menu
          </Text>
        </View>
        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: '#111827',
            marginRight: 6,
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: '#f9fafb',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {totalVariants} varian
          </Text>
        </View>
        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: '#111827',
            marginRight: 6,
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: '#f9fafb',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {uniqueRecipeIngredients} bahan
          </Text>
        </View>
      </View>

      {error && (
        <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
      )}

      {/* Add menu form (expandable) */}
      {showAddMenuForm && (
        <View
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#f3f4f6',
          }}
        >
          <Text
            style={{ fontWeight: '700', marginBottom: 4, fontSize: 15 }}
          >
            Tambah menu baharu
          </Text>
          <TextInput
            placeholder="Nama menu (cth: Nasi Lemak Ayam Goreng)"
            value={newItemName}
            onChangeText={setNewItemName}
            style={{
              borderWidth: 1,
              borderColor: '#d4d4d4',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 6,
              marginBottom: 6,
              backgroundColor: '#fff',
            }}
          />
          <TextInput
            placeholder="Kategori (cth: Makanan / Minuman)"
            value={newItemCategory}
            onChangeText={setNewItemCategory}
            style={{
              borderWidth: 1,
              borderColor: '#d4d4d4',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 6,
              marginBottom: 8,
              backgroundColor: '#fff',
            }}
          />
          <TouchableOpacity
            onPress={handleAddItem}
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: '#111827',
            }}
          >
            <Text
              style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}
            >
              Simpan menu
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 1: choose menu */}
      <Text
        style={{ fontWeight: '700', marginBottom: 4, fontSize: 15 }}
      >
        Langkah 1 — Pilih menu 📋
      </Text>
      {items.length === 0 ? (
        <Text style={{ color: '#6b7280', marginBottom: 16 }}>
          Tiada menu lagi. Tekan ikon ＋ di atas untuk menambah.
        </Text>
      ) : (
        <View style={{ marginBottom: 16 }}>
          {items.map((item) => {
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
                  } else {
                    setSelectedVariantId(null);
                  }
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginBottom: 6,
                  backgroundColor: active ? '#111827' : '#f9fafb',
                  borderWidth: active ? 0 : 1,
                  borderColor: '#e5e7eb',
                }}
              >
                <Text
                  style={{
                    fontWeight: '600',
                    color: active ? '#fff' : '#111827',
                  }}
                >
                  {item.name}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: active ? '#e5e7eb' : '#6b7280',
                      marginRight: 6,
                    }}
                  >
                    {item.category || 'Tiada kategori'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: active ? '#e5e7eb' : '#6b7280',
                      marginRight: 6,
                    }}
                  >
                    • {vCount} varian
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: active ? '#e5e7eb' : '#6b7280',
                    }}
                  >
                    • {ingCount} bahan resipi
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Step 2 & 3: variants + recipe for selected menu */}
      {selectedItem && (
        <View
          style={{
            marginBottom: 24,
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#f9fafb',
          }}
        >
          <Text style={{ fontWeight: '700', marginBottom: 2 }}>
            {selectedItem.name}
          </Text>
          <Text style={{ color: '#6b7280', marginBottom: 8, fontSize: 12 }}>
            Kategori: {selectedItem.category || 'Tiada'} ·{' '}
            {selectedItem.active ? 'Aktif' : 'Tidak aktif'}
          </Text>

          {/* Variants row */}
          <Text
            style={{ fontWeight: '600', fontSize: 13, marginBottom: 4 }}
          >
            Langkah 2 — Pilih atau tambah varian 🍱
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8 }}
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
                    paddingHorizontal: 12,
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
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: '#f97316',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#fff',
                  fontWeight: '600',
                }}
              >
                ＋ Varian
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Add variant form */}
          {showVariantForm && (
            <View
              style={{
                marginBottom: 12,
                padding: 8,
                borderRadius: 10,
                backgroundColor: '#f3f4f6',
              }}
            >
              <Text
                style={{ fontWeight: '600', marginBottom: 4, fontSize: 13 }}
              >
                Tambah varian baharu
              </Text>
              <TextInput
                placeholder="Nama varian (cth: Regular)"
                value={newVariantName}
                onChangeText={setNewVariantName}
                style={{
                  borderWidth: 1,
                  borderColor: '#d4d4d4',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  marginBottom: 6,
                  backgroundColor: '#fff',
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 6,
                }}
              >
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>
                    Harga
                  </Text>
                  <TextInput
                    placeholder="cth: 8.00"
                    value={newVariantPrice}
                    onChangeText={setNewVariantPrice}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: '#d4d4d4',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      backgroundColor: '#fff',
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>
                    Baseline sehari
                  </Text>
                  <TextInput
                    placeholder="cth: 40"
                    value={newVariantBaseline}
                    onChangeText={setNewVariantBaseline}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: '#d4d4d4',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      backgroundColor: '#fff',
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleAddVariant}
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: '#111827',
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  Simpan varian
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Recipes for selected variant */}
          <Text
            style={{ fontWeight: '600', fontSize: 13, marginBottom: 4 }}
          >
            Langkah 3 — Ubah resipi varian 🧪
          </Text>

          {!selectedVariant ? (
            <Text style={{ color: '#6b7280', fontSize: 12 }}>
              Pilih varian dahulu atau tambah varian baru.
            </Text>
          ) : (
            <>
              {/* Existing recipe list */}
              <View style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#4b5563',
                    marginBottom: 4,
                  }}
                >
                  Resipi: {selectedItem.name} — {selectedVariant.name}
                </Text>
                {recipesByVariant(selectedVariant.id).length === 0 ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      marginBottom: 4,
                    }}
                  >
                    Tiada bahan lagi. Tambah bahan di bawah.
                  </Text>
                ) : (
                  recipesByVariant(selectedVariant.id).map((r) => (
                    <View
                      key={r.ingredient_id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{ fontSize: 12, color: '#374151', flex: 1 }}
                      >
                        {r.ingredient_name || 'Bahan'} —{' '}
                        {r.qty_per_serving} {r.ingredient_unit || ''} /
                        hidangan
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            handleEditRecipeRow(
                              selectedVariant.id,
                              r.ingredient_id,
                              r.qty_per_serving
                            )
                          }
                          style={{ marginRight: 8 }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: '#1d4ed8',
                              fontWeight: '500',
                            }}
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            handleDeleteRecipeRow(
                              selectedVariant.id,
                              r.ingredient_id
                            )
                          }
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: '#b91c1c',
                              fontWeight: '500',
                            }}
                          >
                            Padam
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Recipe editor */}
              <View
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#f3f4f6',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    Tambah / kemas kini bahan
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setRecipeVariantId(selectedVariant.id);
                      setRecipeIngredientId('');
                      setRecipeQty('');
                      setShowIngredientPicker(false);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#1d4ed8',
                      }}
                    >
                      + Bahan baharu
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Ingredient picker */}
                <TouchableOpacity
                  onPress={() => {
                    setRecipeVariantId(selectedVariant.id);
                    setShowIngredientPicker((x) => !x);
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: '#d4d4d4',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    marginBottom: 4,
                    backgroundColor: '#fff',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#111827' }}>
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
                      borderColor: '#e5e7eb',
                      borderRadius: 8,
                      marginBottom: 4,
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
                            paddingHorizontal: 8,
                            paddingVertical: 6,
                            borderBottomWidth: 1,
                            borderColor: '#f3f4f6',
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

                {/* Qty per serving */}
                <View style={{ marginBottom: 6 }}>
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
                      borderColor: '#d4d4d4',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      backgroundColor: '#fff',
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <TouchableOpacity
                    onPress={handleSaveRecipe}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: '#111827',
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
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
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: '#e5e7eb',
                    }}
                  >
                    <Text
                      style={{
                        color: '#111827',
                        fontSize: 12,
                        fontWeight: '500',
                      }}
                    >
                      Batal
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      )}

      {loading && (
        <View style={{ marginTop: 8 }}>
          <ActivityIndicator />
        </View>
      )}
    </ScrollView>
  );
}