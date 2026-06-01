import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useCallback, useEffect, useMemo, useState } from 'react';

import BottomTabBar from '../../navigation/BottomTabBar';
import EmptyState from '../../components/EmptyState';
import { getActiveProducts, type Product } from '../../services/productService';
import { supabase } from '../../lib/supabase';

function groupByCategory(products: Product[]) {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.category || 'general';
    map.set(key, [...(map.get(key) ?? []), p]);
  }
  return [...map.entries()];
}

type Row =
  | { type: 'category'; key: string; title: string }
  | { type: 'product'; key: string; product: Product };

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getActiveProducts();
      setProducts(data);
    } catch (error) {
      console.log(error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const channel = supabase
      .channel('customer-products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          void load();
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await load();
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  const rows: Row[] = useMemo(() => {
    const grouped = groupByCategory(products);
    const result: Row[] = [];
    for (const [category, items] of grouped) {
      result.push({
        type: 'category',
        key: `cat:${category}`,
        title: category,
      });
      for (const p of items) {
        result.push({
          type: 'product',
          key: p.id,
          product: p,
        });
      }
    }
    return result;
  }, [products]);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.subtitle}>Catalog is managed by the admin panel.</Text>

        <FlatList
          data={rows}
          keyExtractor={(item) => item.key}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={rows.length === 0 ? styles.emptyContainer : undefined}
          renderItem={({ item }) => {
            if (item.type === 'category') {
              return <Text style={styles.category}>{item.title.toUpperCase()}</Text>;
            }

            const p = item.product;

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.price}>₹{p.price}</Text>
                </View>

                {p.description ? (
                  <Text style={styles.desc}>{p.description}</Text>
                ) : null}

                {p.service_description ? (
                  <Text style={styles.service}>Service: {p.service_description}</Text>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            isLoading ? (
              <EmptyState title="Loading products…" description="Fetching the latest catalog." />
            ) : (
              <EmptyState title="No products available" description="Check back later." />
            )
          }
        />
      </View>

      <BottomTabBar active="Products" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  category: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '900',
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  price: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  desc: {
    marginTop: 8,
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  service: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

