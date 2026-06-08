import { useCallback, useEffect, useState } from 'react';
<<<<<<< HEAD
import { listDeliveryAgents, getAgentStats } from '../services/profileService';

interface DeliveryAgent {
  id: string;
  vehicle_number: string;
  is_available: boolean;
  profiles?: Array<{
    id: string;
    full_name: string | null;
    email: string;
    phone_number: string | null;
  }>;
}

interface AgentStats {
  [agentId: string]: {
    total_deliveries: number;
    completed_deliveries: number;
  };
}

export default function DeliveryAgentsPage() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [stats, setStats] = useState<AgentStats>({});
=======
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
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
<<<<<<< HEAD
      const data = await listDeliveryAgents();
      setAgents(data);

      const statsData: AgentStats = {};
      for (const agent of data) {
        try {
          const agentStats = await getAgentStats(agent.id);
          statsData[agent.id] = agentStats;
        } catch (err) {
          console.log(`Failed to load stats for agent ${agent.id}:`, err);
        }
      }
      setStats(statsData);
=======
      const data = await getDeliveryAgents();
      setAgents((data ?? []) as DeliveryAgent[]);
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
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

<<<<<<< HEAD
  const getAgentName = (agent: DeliveryAgent) => {
    return agent.profiles?.[0]?.full_name || agent.profiles?.[0]?.email || agent.vehicle_number || agent.id;
=======
  const getProfileData = (profiles: DeliveryAgentProfile | DeliveryAgentProfile[]) => {
    if (Array.isArray(profiles)) {
      return profiles[0] || null;
    }
    return profiles;
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
  };

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
<<<<<<< HEAD
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ marginTop: 0 }}>Delivery Agents</h1>
          <p style={{ color: '#6B7280', marginTop: 6 }}>
            Manage delivery agent accounts, vehicle information, and delivery performance.
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
=======
      <h1 style={{ marginTop: 0 }}>Delivery Agents</h1>
      <p style={{ color: '#6B7280', marginTop: 6 }}>
        Active delivery agents and their vehicle assignments.
      </p>

      {errorMessage ? (
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
<<<<<<< HEAD
            marginBottom: 16,
=======
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
          }}
        >
          {errorMessage}
        </div>
<<<<<<< HEAD
      )}

      {isLoading ? (
        <div style={{ padding: 12, color: '#6B7280' }}>Loading agents…</div>
      ) : agents.length === 0 ? (
        <div style={{ padding: 12, color: '#6B7280' }}>No delivery agents.</div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 800, color: '#6B7280' }}>Name</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 800, color: '#6B7280' }}>Vehicle</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 800, color: '#6B7280' }}>Email</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 800, color: '#6B7280' }}>Phone</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 800, color: '#6B7280' }}>Availability</th>
                <th style={{ padding: 12, textAlign: 'right', fontWeight: 800, color: '#6B7280' }}>Total Deliveries</th>
                <th style={{ padding: 12, textAlign: 'right', fontWeight: 800, color: '#6B7280' }}>Completed</th>
=======
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
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
<<<<<<< HEAD
                const agentStats = stats[agent.id] || { total_deliveries: 0, completed_deliveries: 0 };
                const profile = agent.profiles?.[0];
                return (
                  <tr key={agent.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 12, fontWeight: 600, color: '#111827' }}>
                      {getAgentName(agent)}
                    </td>
                    <td style={{ padding: 12, color: '#111827', fontWeight: 600 }}>
                      {agent.vehicle_number || '—'}
                    </td>
                    <td style={{ padding: 12, color: '#111827', fontSize: 13, wordBreak: 'break-all' }}>
                      {profile?.email || '—'}
                    </td>
                    <td style={{ padding: 12, color: '#111827' }}>
                      {profile?.phone_number || '—'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
=======
                const profile = getProfileData(agent.profiles);
                return (
                  <tr key={agent.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 12 }}>{profile?.full_name ?? '—'}</td>
                    <td style={{ padding: 12 }}>{profile?.email ?? '—'}</td>
                    <td style={{ padding: 12 }}>{profile?.phone_number ?? '—'}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{agent.vehicle_number}</td>
                    <td style={{ padding: 12 }}>
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
<<<<<<< HEAD
                          backgroundColor: agent.is_available ? '#d1fae5' : '#fee2e2',
                          color: agent.is_available ? '#065f46' : '#991b1b',
                        }}
                      >
                        {agent.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', color: '#111827' }}>
                      {agentStats.total_deliveries}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                      {agentStats.completed_deliveries}
                    </td>
=======
                          background: agent.is_available ? '#d1fae5' : '#fee2e2',
                          color: agent.is_available ? '#065f46' : '#991b1b',
                        }}
                      >
                        {agent.is_available ? 'Available' : 'Busy'}
                      </span>
                    </td>
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
                  </tr>
                );
              })}
            </tbody>
          </table>
<<<<<<< HEAD
        </div>
      )}
=======
        )}
      </div>
>>>>>>> d641c1ea25d72072f838a28e01cb154f371b0e0c
    </div>
  );
}
