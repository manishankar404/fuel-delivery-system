import { supabase } from '../lib/supabase';

export type DiscountType = 'percentage' | 'flat';

export type PlatformSettings = {
  delivery_charge: number;
  min_liters: number;
  max_liters: number;
  discount_enabled: boolean;
  discount_type: DiscountType;
  discount_value: number;
  credit_per_liter: number;
  updated_at?: string;
};

type PlatformSettingsRow = PlatformSettings & { id: number };

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select(
      `
        id,
        delivery_charge,
        min_liters,
        max_liters,
        discount_enabled,
        discount_type,
        discount_value,
        credit_per_liter,
        updated_at
      `
    )
    .eq('id', 1)
    .single<PlatformSettingsRow>();

  if (error) throw error;

  return {
    delivery_charge: Number(data.delivery_charge),
    min_liters: Number(data.min_liters),
    max_liters: Number(data.max_liters),
    discount_enabled: Boolean(data.discount_enabled),
    discount_type: data.discount_type,
    discount_value: Number(data.discount_value),
    credit_per_liter: Number(data.credit_per_liter),
    updated_at: data.updated_at,
  };
}

export async function updatePlatformSettings(
  patch: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from('platform_settings')
    .update(patch)
    .eq('id', 1)
    .select(
      `
        id,
        delivery_charge,
        min_liters,
        max_liters,
        discount_enabled,
        discount_type,
        discount_value,
        credit_per_liter,
        updated_at
      `
    )
    .single<PlatformSettingsRow>();

  if (error) throw error;

  return {
    delivery_charge: Number(data.delivery_charge),
    min_liters: Number(data.min_liters),
    max_liters: Number(data.max_liters),
    discount_enabled: Boolean(data.discount_enabled),
    discount_type: data.discount_type,
    discount_value: Number(data.discount_value),
    credit_per_liter: Number(data.credit_per_liter),
    updated_at: data.updated_at,
  };
}

