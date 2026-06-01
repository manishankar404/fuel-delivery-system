import type { PlatformSettings } from './platformSettingsService';

export type PricingBreakdown = {
  liters: number;
  unitPrice: number;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  total: number;
  creditsEarned: number;
};

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculatePricingBreakdown(params: {
  liters: number;
  unitPrice: number;
  settings: PlatformSettings;
}): PricingBreakdown {
  const { liters, unitPrice, settings } = params;
  const subtotal = liters * unitPrice;

  const deliveryCharge = settings.delivery_charge;

  const discountAmount = (() => {
    if (!settings.discount_enabled) return 0;
    if (settings.discount_value <= 0) return 0;

    if (settings.discount_type === 'percentage') {
      return (subtotal * settings.discount_value) / 100;
    }

    return settings.discount_value;
  })();

  const total = Math.max(0, subtotal + deliveryCharge - discountAmount);
  const creditsEarned = liters * settings.credit_per_liter;

  return {
    liters,
    unitPrice,
    subtotal: round2(subtotal),
    deliveryCharge: round2(deliveryCharge),
    discountAmount: round2(discountAmount),
    total: round2(total),
    creditsEarned: round2(creditsEarned),
  };
}

