import { useMemo, useState } from 'react';

export type DeliveryAgentOption = {
  id: string;
  displayName: string;
};

type Props = {
  canApprove: boolean;
  isBusy: boolean;
  deliveryAgents: DeliveryAgentOption[];
  onApprove: () => void;
  onAssign: (agentId: string) => void;
};

export default function OrderActions({
  canApprove,
  isBusy,
  deliveryAgents,
  onApprove,
  onAssign,
}: Props) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const hasAgents = deliveryAgents.length > 0;

  const canAssign = useMemo(() => {
    return !isBusy && hasAgents && selectedAgentId.length > 0;
  }, [hasAgents, isBusy, selectedAgentId]);

  return (
    <div className="admOrderActions">
      <button
        className="admBtn admBtnPrimary"
        type="button"
        onClick={onApprove}
        disabled={!canApprove || isBusy}
        title={!canApprove ? 'Only pending orders can be approved' : undefined}
      >
        Approve
      </button>

      <div className="admAssignGroup">
        <select
          className="admSelect"
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          disabled={!hasAgents || isBusy}
          aria-label="Select delivery agent"
        >
          <option value="">{hasAgents ? 'Assign to…' : 'No agents available'}</option>
          {deliveryAgents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.displayName}
            </option>
          ))}
        </select>

        <button
          className="admBtn"
          type="button"
          onClick={() => onAssign(selectedAgentId)}
          disabled={!canAssign}
        >
          Assign
        </button>
      </div>
    </div>
  );
}
