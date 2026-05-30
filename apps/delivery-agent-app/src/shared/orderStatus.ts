export const ORDER_STATUSES = [
  'pending',
  'approved',
  'assigned',
  'out_for_delivery',
  'delivered',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderStatusBadgeMeta = {
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
};

export const ORDER_LIFECYCLE_STAGES = [
  'pending',
  'approved',
  'assigned',
  'out_for_delivery',
  'delivered',
] as const;

export type OrderLifecycleStage = (typeof ORDER_LIFECYCLE_STAGES)[number];

export type OrderLifecycleStep = {
  key: OrderLifecycleStage;
  label: string;
};

const ORDER_LIFECYCLE_LABELS: Record<OrderLifecycleStage, string> = {
  pending: 'Pending',
  approved: 'Approved',
  assigned: 'Assigned',
  out_for_delivery: 'Out',
  delivered: 'Done',
};

export function getOrderLifecycleSteps(): OrderLifecycleStep[] {
  return ORDER_LIFECYCLE_STAGES.map((key) => ({
    key,
    label: ORDER_LIFECYCLE_LABELS[key],
  }));
}

export function getOrderLifecycleIndex(status: unknown): number {
  if (!isOrderStatus(status)) {
    return 0;
  }

  const index = ORDER_LIFECYCLE_STAGES.indexOf(status);
  return index === -1 ? 0 : index;
}

const META_BY_STATUS: Record<OrderStatus, OrderStatusBadgeMeta> = {
  pending: {
    label: 'Pending',
    backgroundColor: '#F3F4F6',
    textColor: '#B45309',
    borderColor: '#F59E0B',
  },
  approved: {
    label: 'Approved',
    backgroundColor: '#DBEAFE',
    textColor: '#1D4ED8',
  },
  assigned: {
    label: 'Assigned',
    backgroundColor: '#EDE9FE',
    textColor: '#6D28D9',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    backgroundColor: '#FFEDD5',
    textColor: '#C2410C',
  },
  delivered: {
    label: 'Delivered',
    backgroundColor: '#DCFCE7',
    textColor: '#15803D',
  },
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === 'string' &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

export function getOrderStatusBadgeMeta(
  status: unknown
): OrderStatusBadgeMeta & { status: OrderStatus | 'unknown' } {
  if (isOrderStatus(status)) {
    return { status, ...META_BY_STATUS[status] };
  }

  return {
    status: 'unknown',
    label: 'Unknown',
    backgroundColor: '#E5E7EB',
    textColor: '#374151',
  };
}
