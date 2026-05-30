import { getOrderStatusBadgeMeta } from '../shared/orderStatus';

type Props = {
  status: unknown;
};

export default function OrderStatusBadge({ status }: Props) {
  const meta = getOrderStatusBadgeMeta(status);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        border: `1px solid ${meta.borderColor ?? meta.backgroundColor}`,
        background: meta.backgroundColor,
        color: meta.textColor,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '16px',
      }}
    >
      {meta.label}
    </span>
  );
}
