import { useCallback, useEffect, useState } from 'react';
import { getDeliveryAgents } from '../services/deliveryAgentService';

type DeliveryAgentProfile = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
};

type DeliveryAgent = {
  id: string;
  profile_id: string;
  vehicle_number: string;
  is_available: boolean;
  profiles: DeliveryAgentProfile | DeliveryAgentProfile[];
};

export default function DeliveryAgentsPage() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getDeliveryAgents();
      setAgents((data ?? []) as DeliveryAgent[]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load delivery agents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const getProfileData = (profiles: DeliveryAgentProfile | DeliveryAgentProfile[]) => {
    if (Array.isArray(profiles)) {
      return profiles[0] || null;
    }
    return profiles;
  };

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
      <h1 style={{ marginTop: 0 }}>Delivery Agents</h1>
      <p style={{ color: '#6B7280', marginTop: 6 }}>
        Active delivery agents and their vehicle assignments.
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

      <div
        style={{
          marginTop: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          background: '#fff',
          padding: 14,
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Agent List</h3>
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
          <div style={{ padding: 12, color: '#6B7280' }}>Loading…</div>
        ) : agents.length === 0 ? (
          <div style={{ padding: 12, color: '#6B7280' }}>No delivery agents.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>Name</th>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>Phone</th>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>Vehicle</th>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
                const profile = getProfileData(agent.profiles);
                return (
                  <tr key={agent.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 12 }}>{profile?.full_name ?? '—'}</td>
                    <td style={{ padding: 12 }}>{profile?.email ?? '—'}</td>
                    <td style={{ padding: 12 }}>{profile?.phone_number ?? '—'}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{agent.vehicle_number}</td>
                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: agent.is_available ? '#d1fae5' : '#fee2e2',
                          color: agent.is_available ? '#065f46' : '#991b1b',
                        }}
                      >
                        {agent.is_available ? 'Available' : 'Busy'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
