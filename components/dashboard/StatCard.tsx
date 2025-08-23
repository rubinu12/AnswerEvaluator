import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  color: 'blue' | 'orange' | 'purple';
}

export default function StatCard({ label, value, Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  };
  
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex items-center gap-4 rounded-lg bg-slate-50/80 p-3">
      <div className={`rounded-full p-2 ${selectedColor.bg}`}>
        <Icon className={`h-5 w-5 ${selectedColor.text}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}