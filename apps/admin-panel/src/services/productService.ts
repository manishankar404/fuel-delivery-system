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

export async function getAllProducts(): Promise<Product[]> {
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
    .order('created_at', { ascending: false })
    .returns<ProductRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createProduct(input: {
  name: string;
  description?: string | null;
  service_description?: string | null;
  price: number;
  category: string;
  image_url?: string | null;
  is_active: boolean;
}): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      description: input.description ?? null,
      service_description: input.service_description ?? null,
      price: input.price,
      category: input.category,
      image_url: input.image_url ?? null,
      is_active: input.is_active,
    })
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
    .single<ProductRow>();

  if (error) throw error;
  return mapRow(data);
}

export async function updateProduct(
  productId: string,
  patch: Partial<{
    name: string;
    description: string | null;
    service_description: string | null;
    price: number;
    category: string;
    image_url: string | null;
    is_active: boolean;
  }>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', productId)
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
    .single<ProductRow>();

  if (error) throw error;
  return mapRow(data);
}

