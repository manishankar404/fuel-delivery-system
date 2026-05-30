import OrderStatusBadge from '../OrderStatusBadge';
import OrderLifecycleProgress from '../OrderLifecycleProgress';

import { getOrderStatusBadgeMeta } from '../../shared/orderStatus';

import type { DeliveryAgentOption } from './OrderActions';
import OrderActions from './OrderActions';

export type OrderCardData = {
  id: string;
  customerId: string;
  customerEmail?: string | null;
  fuelTypeName?: string | null;
  quantityLiters: number;
  status: unknown;
  assignedDeliveryAgentId?: string | null;
};

type Props = {
  order: OrderCardData;
  deliveryAgents: DeliveryAgentOption[];
  isBusy: boolean;
  onApprove: (orderId: string, customerId: string) => void;
  onAssign: (orderId: string, agentId: string) => void;
};

export default function OrderCard({
  order,
  deliveryAgents,
  isBusy,
  onApprove,
  onAssign,
}: Props) {
  const statusMeta = getOrderStatusBadgeMeta(order.status);
  const isPending = statusMeta.status === 'pending';

  const assignedAgentName =
    order.assignedDeliveryAgentId && deliveryAgents.length > 0
      ? deliveryAgents.find((a) => a.id === order.assignedDeliveryAgentId)?.displayName
      : undefined;

  return (
    <article className="admOrderCard">
      <div className="admOrderTop">
        <div className="admOrderTitleBlock">
          <div className="admOrderTitleRow">
            <h3 className="admOrderTitle">{order.fuelTypeName ?? 'Fuel Order'}</h3>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="admOrderMetaRow">
            <div className="admOrderMetaItem">
              <span className="admMetaLabel">Customer</span>
              <span className="admMetaValue">{order.customerEmail ?? '—'}</span>
            </div>
            <div className="admOrderMetaItem">
              <span className="admMetaLabel">Quantity</span>
              <span className="admMetaValue">{order.quantityLiters} L</span>
            </div>
            <div className="admOrderMetaItem">
              <span className="admMetaLabel">Assigned</span>
              <span className="admMetaValue">{assignedAgentName ?? '—'}</span>
            </div>
          </div>
          <OrderLifecycleProgress status={order.status} />
        </div>
      </div>

      <div className="admOrderBottom">
        <OrderActions
          canApprove={isPending}
          isBusy={isBusy}
          deliveryAgents={deliveryAgents}
          onApprove={() => onApprove(order.id, order.customerId)}
          onAssign={(agentId) => onAssign(order.id, agentId)}
        />
        <div className="admOrderHint">
          {statusMeta.status === 'unknown'
            ? 'Unknown status value; badge is shown with a safe fallback.'
            : null}
        </div>
      </div>
    </article>
  );
}
