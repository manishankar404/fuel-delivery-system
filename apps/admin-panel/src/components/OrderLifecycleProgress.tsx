import { getOrderLifecycleIndex, getOrderLifecycleSteps } from '../shared/orderStatus';

type Props = {
  status: unknown;
};

export default function OrderLifecycleProgress({ status }: Props) {
  const steps = getOrderLifecycleSteps();
  const activeIndex = getOrderLifecycleIndex(status);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
      {steps.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;

        const dotColor = isCompleted ? '#111827' : '#E5E7EB';
        const dotBorder = isActive ? '#111827' : '#D1D5DB';
        const dotBackground = isActive ? '#FFFFFF' : dotColor;

        return (
          <div key={step.key} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: dotBackground,
                  border: `${isActive ? 2 : 1}px solid ${dotBorder}`,
                }}
              />
              {index !== steps.length - 1 ? (
                <div
                  style={{
                    height: 2,
                    flex: 1,
                    background: isCompleted || isActive ? '#111827' : '#E5E7EB',
                    marginLeft: 6,
                    marginRight: 6,
                    borderRadius: 2,
                  }}
                />
              ) : null}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                fontWeight: 700,
                color: isActive ? '#111827' : '#6B7280',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

