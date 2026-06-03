import { useCallback, useEffect, useState } from 'react';
import { listAdmins, getProfile, updateProfile } from '../services/profileService';

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  is_active: boolean;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AdminUser | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await listAdmins();
      setAdmins(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load admin users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const handleEdit = async (admin: AdminUser) => {
    setEditingId(admin.id);
    const fullAdmin = await getProfile(admin.id);
    setEditForm(fullAdmin);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!editForm) return;

    try {
      setSaveError(null);
      await updateProfile(editForm.id, {
        full_name: editForm.full_name || undefined,
        phone_number: editForm.phone_number || undefined,
        email: editForm.email,
      });

      setAdmins((prev) =>
        prev.map((a) => (a.id === editForm.id ? editForm : a))
      );
      setEditingId(null);
      setEditForm(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ marginTop: 0 }}>Admin Users</h1>
          <p style={{ color: '#6B7280', marginTop: 6 }}>
            Manage administrator accounts and permissions.
          </p>
        </div>
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

      {errorMessage && (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
            marginBottom: 16,
          }}
        >
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: 12, color: '#6B7280' }}>Loading admins…</div>
      ) : admins.length === 0 ? (
        <div style={{ padding: 12, color: '#6B7280' }}>No admin users.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 14,
          }}
        >
          {admins.map((admin) => (
            <div
              key={admin.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                background: '#fff',
                padding: 14,
              }}
            >
              {editingId === admin.id && editForm ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      disabled
                      style={{
                        width: '100%',
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        backgroundColor: '#f3f4f6',
                        color: '#9ca3af',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone_number || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                      style={{
                        width: '100%',
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {saveError && (
                    <div style={{ color: '#991b1b', fontSize: 12, marginBottom: 8 }}>
                      {saveError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleSave}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#111827',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditForm(null);
                        setSaveError(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 2 }}>Full Name</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      {admin.full_name || '—'}
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 2 }}>Email</div>
                    <div style={{ fontSize: 13, color: '#111827', wordBreak: 'break-all' }}>
                      {admin.email}
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 2 }}>Phone</div>
                    <div style={{ fontSize: 14, color: '#111827' }}>
                      {admin.phone_number || '—'}
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 2 }}>Status</div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: admin.is_active ? '#d1fae5' : '#fee2e2',
                        color: admin.is_active ? '#065f46' : '#991b1b',
                      }}
                    >
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleEdit(admin)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      cursor: 'pointer',
                      fontWeight: 800,
                    }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
