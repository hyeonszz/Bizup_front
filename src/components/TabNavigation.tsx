import { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, Settings, Utensils } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabId: string;
}

const tabs = [
  { id: 'inventory', label: '재고 관리', icon: Package },
  { id: 'menu', label: '메뉴 관리', icon: Utensils },
  { id: 'order', label: '발주 추천', icon: TrendingUp },
  { id: 'outofstock', label: '품절 관리', icon: AlertTriangle },
  { id: 'settings', label: '설정', icon: Settings },
];

export function TabNavigation({ activeTab, onTabChange, tabId }: TabNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const tabElement = document.getElementById(tabId);
      if (tabElement) {
        const rect = tabElement.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        
        // 회색 배경 영역이 뷰포트에 보이기 시작하면 표시
        // 회색 배경 div의 상단이 뷰포트 상단보다 아래에 있으면 표시
        // 또는 스크롤이 충분히 내려갔으면 표시 (흰색 배경 영역을 지나쳤는지 확인)
        const isInGrayArea = rect.top <= 100 || scrollY > 300;
        
        setIsVisible(isInGrayArea);
      }
    };

    // 스크롤 이벤트 리스너 추가 (throttle 적용)
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('resize', throttledHandleScroll, { passive: true });
    
    // 초기 상태 확인
    handleScroll();
    // 약간의 지연 후 다시 확인 (렌더링 완료 후)
    const timeoutId1 = setTimeout(handleScroll, 100);
    const timeoutId2 = setTimeout(handleScroll, 500);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', throttledHandleScroll);
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [tabId]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="flex items-center justify-center gap-3 py-3 px-6 sticky top-0 z-50"
      style={{
        backgroundColor: 'rgba(243, 245, 247, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'opacity 0.3s ease-in-out',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-medium"
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: isActive ? '#3182f6' : 'rgba(49, 130, 246, 0.6)',
              backgroundColor: isActive ? 'rgba(239, 246, 255, 0.8)' : 'transparent',
              opacity: isActive ? 1 : 0.7
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = 'rgba(239, 246, 255, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

