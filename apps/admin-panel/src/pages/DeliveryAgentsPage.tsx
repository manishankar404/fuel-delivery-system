import { useCallback, useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
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

  const getAgentName = (agent: DeliveryAgent) => {
    return agent.profiles?.[0]?.full_name || agent.profiles?.[0]?.email || agent.vehicle_number || agent.id;
  };

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
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
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
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
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
