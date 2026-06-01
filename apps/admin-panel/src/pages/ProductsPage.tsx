import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Product } from '../services/productService';
import { createProduct, getAllProducts, updateProduct } from '../services/productService';

function numberOr(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

type FormState = {
  id?: string;
  name: string;
  description: string;
  service_description: string;
  price: string;
  category: string;
  image_url: string;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  service_description: '',
  price: '0',
  category: 'general',
  image_url: '',
  is_active: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const validation = useMemo(() => {
    if (!form.name.trim()) return 'Name is required.';
    const price = numberOr(form.price, -1);
    if (price < 0) return 'Price must be >= 0.';
    if (!form.category.trim()) return 'Category is required.';
    return null;
  }, [form.category, form.name, form.price]);

  const onEdit = (product: Product) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setForm({
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      service_description: product.service_description ?? '',
      price: String(product.price),
      category: product.category,
      image_url: product.image_url ?? '',
      is_active: product.is_active,
    });
  };

  const onReset = () => {
    setForm(EMPTY_FORM);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const onSave = async () => {
    if (validation) return;

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() ? form.description.trim() : null,
        service_description: form.service_description.trim()
          ? form.service_description.trim()
          : null,
        price: numberOr(form.price, 0),
        category: form.category.trim(),
        image_url: form.image_url.trim() ? form.image_url.trim() : null,
        is_active: Boolean(form.is_active),
      };

      if (form.id) {
        await updateProduct(form.id, payload);
        setSuccessMessage('Updated product.');
      } else {
        await createProduct(payload);
        setSuccessMessage('Created product.');
      }

      onReset();
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const onToggleActive = async (product: Product) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      await updateProduct(product.id, { is_active: !product.is_active });
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update product');
    }
  };

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
      <h1 style={{ marginTop: 0 }}>Products</h1>
      <p style={{ color: '#6B7280', marginTop: 6 }}>
        Manage the product catalog shown in the customer app. Disable products to hide them without deleting.
      </p>

      {errorMessage ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid #bbf7d0',
            background: '#f0fdf4',
            color: '#166534',
          }}
        >
          {successMessage}
        </div>
      ) : null}

      {validation ? (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            border: '1px solid #fde68a',
            background: '#fffbeb',
            color: '#92400e',
          }}
        >
          {validation}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px minmax(0, 1fr)',
          gap: 14,
          marginTop: 16,
        }}
      >
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>{form.id ? 'Edit product' : 'Create product'}</h3>

          <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280' }}>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
          />

          <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280', marginTop: 12 }}>
            Category
          </label>
          <input
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
          />

          <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280', marginTop: 12 }}>
            Price (₹)
          </label>
          <input
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
          />

          <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280', marginTop: 12 }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6, minHeight: 80 }}
          />

          <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280', marginTop: 12 }}>
            Service description
          </label>
          <textarea
            value={form.service_description}
            onChange={(e) => setForm((p) => ({ ...p, service_description: e.target.value }))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6, minHeight: 80 }}
          />

          <label style={{ display: 'block', fontWeight: 800, fontSize: 12, color: '#6B7280', marginTop: 12 }}>
            Image URL (optional)
          </label>
          <input
            value={form.image_url}
            onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginTop: 6 }}
          />
          {form.image_url.trim() ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280' }}>Preview</div>
              <img
                src={form.image_url.trim()}
                alt="Product preview"
                style={{
                  marginTop: 6,
                  width: '100%',
                  maxWidth: 420,
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 14,
                  border: '1px solid #e5e7eb',
                  background: '#f3f4f6',
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
            </div>
          ) : null}

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, marginTop: 12 }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            />
            Active
          </label>

          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onSave}
              disabled={Boolean(validation) || isSaving}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #111827',
                background: '#111827',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              {isSaving ? 'Saving…' : form.id ? 'Save Changes' : 'Create Product'}
            </button>

            <button
              type="button"
              onClick={onReset}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #d1d5db',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Catalog</h3>
            <button
              type="button"
              onClick={() => void load()}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #d1d5db',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: 12, color: '#6B7280' }}>Loading products…</div>
          ) : products.length === 0 ? (
            <div style={{ padding: 12, color: '#6B7280' }}>No products.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    padding: 12,
                    background: product.is_active ? '#ffffff' : '#f9fafb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            objectFit: 'cover',
                            border: '1px solid #e5e7eb',
                            background: '#f3f4f6',
                            flex: '0 0 auto',
                          }}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            border: '1px solid #e5e7eb',
                            background: '#f3f4f6',
                            flex: '0 0 auto',
                          }}
                        />
                      )}

                      <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </div>
                      <div style={{ marginTop: 4, color: '#6B7280', fontSize: 12 }}>
                        {product.category} • ₹{product.price}
                      </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: '1px solid #d1d5db',
                          background: '#fff',
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onToggleActive(product)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: `1px solid ${product.is_active ? '#fecaca' : '#bbf7d0'}`,
                          background: product.is_active ? '#fef2f2' : '#f0fdf4',
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: 12,
                          color: product.is_active ? '#991b1b' : '#166534',
                        }}
                      >
                        {product.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>

                  {product.description ? (
                    <div style={{ marginTop: 10, fontSize: 12, color: '#111827' }}>
                      {product.description}
                    </div>
                  ) : null}

                  {product.service_description ? (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                      Service: {product.service_description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
