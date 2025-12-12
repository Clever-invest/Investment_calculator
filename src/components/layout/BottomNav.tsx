/**
 * Mobile Bottom Navigation Bar
 * Показывается только на мобильных устройствах (md:hidden)
 */

import { Calculator, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptic } from '@/utils/haptic'
import type { TabId } from '@/stores/uiStore'

interface NavItem {
  id: TabId
  icon: React.ReactNode
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'formula', icon: <Calculator className="w-5 h-5" />, label: 'Расчёт' },
  { id: 'early', icon: <MoreHorizontal className="w-5 h-5" />, label: 'Скидки' },
]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-sm border-t md:hidden z-50 pb-safe">
      <div className="flex justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              haptic.light()
              onTabChange(item.id)
            }}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] min-h-[44px] transition-colors relative",
              activeTab === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={item.label}
            aria-selected={activeTab === item.id}
            role="tab"
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
