interface StatCardProps {
  title: string;
  value: string | number;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 py-3 border-r border-b even:border-r-0 last:border-b-0 last:-border-r-0">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
