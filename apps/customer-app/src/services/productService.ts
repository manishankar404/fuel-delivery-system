import { supabase } from '../lib/supabase';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  service_description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  service_description: string | null;
  price: number | string;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    service_description: row.service_description,
    price: Number(row.price),
    category: row.category,
    image_url: row.image_url,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
        id,
        name,
        description,
        service_description,
        price,
        category,
        image_url,
        is_active,
        created_at
      `
    )
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })
    .returns<ProductRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

