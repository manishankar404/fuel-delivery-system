import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export default function DashboardHeader({ title, subtitle, right }: Props) {
  return (
    <header className="admDashHeader">
      <div>
        <h1 className="admDashTitle">{title}</h1>
        {subtitle ? <p className="admDashSubtitle">{subtitle}</p> : null}
      </div>
      {right ? <div className="admDashHeaderRight">{right}</div> : null}
    </header>
  );
}
