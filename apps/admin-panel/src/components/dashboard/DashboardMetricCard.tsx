type Props = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function DashboardMetricCard({ label, value, hint }: Props) {
  return (
    <div className="admMetricCard">
      <div className="admMetricLabel">{label}</div>
      <div className="admMetricValue">{value}</div>
      {hint ? <div className="admMetricHint">{hint}</div> : null}
    </div>
  );
}

