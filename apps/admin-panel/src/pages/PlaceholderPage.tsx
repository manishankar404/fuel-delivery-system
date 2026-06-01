type Props = {
  title: string;
  description?: string;
};

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p style={{ color: '#6B7280', maxWidth: 720 }}>
        {description ?? 'Coming soon.'}
      </p>
    </div>
  );
}

