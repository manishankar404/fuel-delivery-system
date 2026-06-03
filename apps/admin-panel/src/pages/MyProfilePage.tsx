import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile, updateProfile } from '../services/profileService';

interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  created_at?: string;
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<AdminProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('Not authenticated');
          return;
        }

        const profileData = await getProfile(user.id);
        setProfile(profileData);
        setFormData(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setMessage(null);

      if (!profile || !formData) return;

      const updated = await updateProfile(profile.id, {
        full_name: formData.full_name ?? undefined,
        phone_number: formData.phone_number ?? undefined,
        email: formData.email,
      });

      setProfile(updated);
      setFormData(updated);
      setEditing(false);
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 28 }}>
        <h1>My Profile</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: 28 }}>
        <h1>My Profile</h1>
        <p style={{ color: '#991b1b' }}>{error || 'Profile not found'}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 28, maxWidth: 600 }}>
      <h1 style={{ marginTop: 0 }}>My Profile</h1>
      <p style={{ color: '#6B7280', marginTop: 6 }}>View and manage your admin profile information.</p>

      {error && (
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
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid #bbf7d0',
            background: '#f0fdf4',
            color: '#166534',
            marginBottom: 16,
          }}
        >
          {message}
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', padding: 14 }}>
        {editing ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData?.full_name || ''}
                onChange={(e) => formData && setFormData({ ...formData, full_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>
                Email
              </label>
              <input
                type="email"
                value={formData?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: 10,
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>
                Phone
              </label>
              <input
                type="tel"
                value={formData?.phone_number || ''}
                onChange={(e) => formData && setFormData({ ...formData, phone_number: e.target.value })}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#111827',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(profile);
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>Full Name</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{profile.full_name || '—'}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{profile.email}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>Phone</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{profile.phone_number || '—'}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>Role</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{profile.role}</div>
            </div>

            <button
              onClick={() => setEditing(true)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #d1d5db',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}
