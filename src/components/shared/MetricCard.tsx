import { ReactNode } from 'react';

export type MetricVariant = 'profit' | 'roi' | 'irr' | 'timing' | 'warning';

interface MetricCardProps {
  variant: MetricVariant;
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
}

const variantStyles: Record<MetricVariant, { gradient: string; border: string; text: string }> = {
  profit: {
    gradient: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    text: 'text-green-600',
  },
  roi: {
    gradient: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
  },
  irr: {
    gradient: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
  },
  timing: {
    gradient: 'from-orange-50 to-amber-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
  },
  warning: {
    gradient: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
  },
};

export function MetricCard({ 
  variant, 
  icon, 
  label, 
  value, 
  sublabel,
  className = '' 
}: MetricCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <div 
      className={`
        bg-gradient-to-br ${styles.gradient} 
        rounded-xl p-3 sm:p-4 
        border ${styles.border}
        ${className}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={styles.text}>{icon}</span>
        <span className="text-xs sm:text-sm font-medium text-gray-600">
          {label}
        </span>
      </div>
      <div className={`text-xl sm:text-2xl font-bold ${styles.text}`}>
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-gray-500 mt-1">
          {sublabel}
        </div>
      )}
    </div>
  );
}

// Компактная версия для мобильных
interface MetricBadgeProps {
  variant: MetricVariant;
  label: string;
  value: string | number;
}

export function MetricBadge({ variant, label, value }: MetricBadgeProps) {
  const styles = variantStyles[variant];
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${styles.gradient} ${styles.border} border`}>
      <span className="text-xs text-gray-600">{label}:</span>
      <span className={`text-sm font-bold ${styles.text}`}>{value}</span>
    </div>
  );
}

export default MetricCard;
