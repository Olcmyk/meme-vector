'use client';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <p className="text-xl text-gray-600">{message}</p>
    </div>
  );
}
