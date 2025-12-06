/**
 * Skeleton компоненты для loading states
 */

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton для MetricsGrid (4 карточки метрик)
 */
export const MetricsGridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);

/**
 * Compact Skeleton для sticky header
 */
export const MetricsGridSkeletonCompact = () => (
  <div className="flex gap-3 overflow-x-auto pb-2">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border whitespace-nowrap">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton для списка сохранённых объектов
 */
export const PropertyListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="rounded-xl border p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton для графика (WaterfallChart / SensitivityChart)
 */
export const ChartSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-8 w-24" />
    </div>
    <Skeleton className="h-[250px] sm:h-[320px] md:h-[400px] w-full rounded-lg" />
  </div>
);

/**
 * Skeleton для формы ввода (DealParamsForm)
 */
export const FormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    {[...Array(4)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full" />
      </div>
    ))}
    <Skeleton className="h-11 w-full" />
  </div>
);

/**
 * Skeleton для таблицы (EarlySaleTable)
 */
export const TableSkeleton = () => (
  <div className="space-y-2">
    <div className="flex gap-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-10 flex-1" />
      ))}
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-2">
        {[...Array(5)].map((_, j) => (
          <Skeleton key={j} className="h-12 flex-1" />
        ))}
      </div>
    ))}
  </div>
);
