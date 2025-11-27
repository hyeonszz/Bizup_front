import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { outOfStockApi, OutOfStockItem } from '../lib/api';
import { toast } from 'sonner';
import { TabNavigation } from './TabNavigation';

interface OutOfStockTabProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function OutOfStockTab({ activeTab = 'outofstock', onTabChange }: OutOfStockTabProps) {
  const [outOfStockItems, setOutOfStockItems] = useState<OutOfStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState<number | null>(null);

  useEffect(() => {
    loadOutOfStockItems();
  }, []);

  const loadOutOfStockItems = async () => {
    try {
      setLoading(true);
      const data = await outOfStockApi.getAll();
      setOutOfStockItems(data);
    } catch (error) {
      console.error('품절 상품 목록 로딩 오류:', error);
      toast.error('품절 상품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">급한</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">중요</Badge>;
      case 'recent':
        return <Badge variant="secondary">최근</Badge>;
      default:
        return null;
    }
  };

  const handleRestock = async (id: number) => {
    try {
      setRestocking(id);
      // 재입고 완료 처리
      const quantity = 50; // 재고 수량 추가
      await outOfStockApi.restock(id, quantity);
      toast.success('재입고를 완료했어요.');
      loadOutOfStockItems();
    } catch (error) {
      console.error('재입고 오류:', error);
      toast.error('재입고를 진행하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setRestocking(null);
    }
  };

  const totalLoss = outOfStockItems.reduce((sum, item) => sum + item.estimated_loss, 0);

  return (
    <div 
      id="outofstock-tab"
      className="-mx-6 -mt-6 -mb-6" 
      style={{ 
        backgroundColor: '#f3f5f7', 
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        minHeight: '100vh',
        paddingTop: '0',
        paddingBottom: '1.5rem'
      }}
    >
      {onTabChange && <TabNavigation activeTab={activeTab} onTabChange={onTabChange} tabId="outofstock-tab" />}
      <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)', paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '45px' }}>
          <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>품절 현황</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col" style={{ minHeight: 'calc(100vh - 200px)', marginTop: '2px' }}>
        {/* Description */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-gray-600 flex items-center gap-2" style={{ fontSize: '17px', marginLeft: '2px' }}>
            <AlertCircle className="w-4 h-4 text-[#3182F6]" />
            품절된 상품을 빠르게 채워 고객 이탈을 줄여 보세요.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 p-6 border-b border-gray-100">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">품절 상품</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {outOfStockItems.length}개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">평균 품절 기간</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {outOfStockItems.length > 0 
                ? Math.round(outOfStockItems.reduce((sum, item) => sum + item.days_out_of_stock, 0) / outOfStockItems.length)
                : 0}일
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">예상 손실</p>
            <p className="text-[20px] text-gray-900 font-medium">{totalLoss.toLocaleString()}원</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
              <p className="text-gray-600 mt-2 text-[15px]">품절 상품을 불러오는 중이에요…</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f9fafb]" style={{ height: '50px' }}>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px] bg-[#f9fafb]">
                    상품명
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px] bg-[#f9fafb]">
                    카테고리
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px] bg-[#f9fafb]">
                    품절 기간
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px] bg-[#f9fafb]">
                    마지막 재고
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px] bg-[#f9fafb]">
                    예상 손실
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px] bg-[#f9fafb]">
                    상태
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px] bg-[#f9fafb]">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {outOfStockItems.length > 0 ? (
                  outOfStockItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-6 text-center text-[15px] text-gray-900 bg-[#f9fafb]">{item.name}</td>
                      <td className="px-6 py-6 text-center text-[15px] text-gray-600 bg-[#f9fafb]">{item.category}</td>
                      <td className="px-6 py-6 text-center text-[15px] text-gray-600 bg-[#f9fafb]">
                        <div className="flex items-center justify-center gap-2 text-gray-800">
                          <Clock className="w-4 h-4" />
                          {item.days_out_of_stock}일
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center text-[15px] text-gray-600 bg-[#f9fafb]">
                        {item.last_stock} {item.unit}
                      </td>
                      <td className="px-6 py-6 text-center text-[15px] text-gray-900 bg-[#f9fafb]">
                        -{item.estimated_loss.toLocaleString()}원
                      </td>
                      <td className="px-6 py-6 text-center bg-[#f9fafb]">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-6 text-center bg-[#f9fafb]">
                        <Button
                          size="sm"
                          className="bg-[#F0F7FF] text-[#0B5ED7] border-none transition-all duration-200 font-medium hover:bg-[#E0EDFF]"
                          onClick={() => handleRestock(item.id)}
                          disabled={restocking === item.id}
                        >
                          {restocking === item.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              재입고 중...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3 mr-1" />
                              재입고 진행
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 text-center" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
                      <p className="text-[15px] text-gray-400">품절된 상품이 없어요. 지금 상태를 그대로 유지해 볼까요?</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
