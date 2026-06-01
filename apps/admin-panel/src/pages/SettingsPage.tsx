import { useEffect, useMemo, useState } from 'react';

import type { DiscountType, PlatformSettings } from '../services/platformSettingsService';
import { getPlatformSettings, updatePlatformSettings } from '../services/platformSettingsService';

function numberOr(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    delivery_charge: '0',
    min_liters: '1',
    max_liters: '500',
    discount_enabled: false,
    discount_type: 'percentage' as DiscountType,
    discount_value: '0',
    credit_per_liter: '0',
  });

  useEffect(() => {
    let isActive = true;

    (async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getPlatformSettings();
        if (!isActive) return;

        setSettings(data);
        setForm({
          delivery_charge: String(data.delivery_charge),
          min_liters: String(data.min_liters),
          max_liters: String(data.max_liters),
          discount_enabled: data.discount_enabled,
          discount_type: data.discount_type,
          discount_value: String(data.discount_value),
          credit_per_liter: String(data.credit_per_liter),
        });
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load settings');
      }

      if (!isActive) return;
      setIsLoading(false);
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const validation = useMemo(() => {
    const minLiters = numberOr(form.min_liters, 0);
    const maxLiters = numberOr(form.max_liters, 0);
    const discountValue = numberOr(form.discount_value, 0);
    const creditPerLiter = numberOr(form.credit_per_liter, 0);

    if (minLiters <= 0) return 'Minimum liters must be > 0.';
    if (maxLiters <= 0) return 'Maximum liters must be > 0.';
    if (maxLiters < minLiters) return 'Maximum liters must be >= minimum liters.';
    if (discountValue < 0) return 'Discount value must be >= 0.';
    if (form.discount_type === 'percentage' && discountValue > 100) return 'Percentage discount cannot exceed 100.';
    if (creditPerLiter < 0) return 'Credit per liter must be >= 0.';

    return null;
  }, [form]);

  const onSave = async () => {
    if (validation) return;

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const updated = await updatePlatformSettings({
        delivery_charge: numberOr(form.delivery_charge, 0),
        min_liters: numberOr(form.min_liters, 1),
        max_liters: numberOr(form.max_liters, 500),
        discount_enabled: Boolean(form.discount_enabled),
        discount_type: form.discount_type,
        discount_value: numberOr(form.discount_value, 0),
        credit_per_liter: numberOr(form.credit_per_liter, 0),
      });

      setSettings(updated);
      setSuccessMessage('Saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: 28 }}>Loading settings…</div>;
  }

  return (
    <div style={{ padding: 28, maxWidth: 920 }}>
      <h1 style={{ marginTop: 0 }}>Platform Settings</h1>
      <p style={{ color: '#6B7280', marginTop: 6 }}>
        Configure pricing rules used by the customer app (delivery charge, min/max liters, discounts, credits).
      </p>

      {errorMessage ? (
        <div style={{ padding: 12, borderRadius: 12, border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b' }}>
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div style={{ padding: 12, borderRadius: 12, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534' }}>
          {successMessage}
        </div>
      ) : null}

      {validation ? (
        <div style={{ marginTop: 10, padding: 12, borderRadius: 12, border: '1px solid #fde68a', background: '#fffbeb', color: '#92400e' }}>
          {validation}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 16 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Delivery Pricing</h3>

          <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280' }}>Delivery charge (₹)</label>
          <input
            value={form.delivery_charge}
            onChange={(e) => setForm((p) => ({ ...p, delivery_charge: e.target.value }))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280' }}>Min liters</label>
              <input
                value={form.min_liters}
                onChange={(e) => setForm((p) => ({ ...p, min_liters: e.target.value }))}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280' }}>Max liters</label>
              <input
                value={form.max_liters}
                onChange={(e) => setForm((p) => ({ ...p, max_liters: e.target.value }))}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
              />
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Discounts & Credits</h3>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
            <input
              type="checkbox"
              checked={form.discount_enabled}
              onChange={(e) => setForm((p) => ({ ...p, discount_enabled: e.target.checked }))}
            />
            Enable discounts
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280' }}>Discount type</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((p) => ({ ...p, discount_type: e.target.value as DiscountType }))}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
                disabled={!form.discount_enabled}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280' }}>Discount value</label>
              <input
                value={form.discount_value}
                onChange={(e) => setForm((p) => ({ ...p, discount_value: e.target.value }))}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
                disabled={!form.discount_enabled}
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280' }}>
              Credit reward per liter (₹)
            </label>
            <input
              value={form.credit_per_liter}
              onChange={(e) => setForm((p) => ({ ...p, credit_per_liter: e.target.value }))}
              style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ color: '#6B7280', fontSize: 12 }}>
          Last updated: {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : '—'}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={Boolean(validation) || isSaving}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #111827',
            background: '#111827',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          {isSaving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
