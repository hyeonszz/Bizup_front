import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ShoppingCart, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { orderApi, OrderRecommendation } from '../lib/api';
import { toast } from 'sonner';
import { TabNavigation } from './TabNavigation';

interface OrderRecommendationTabProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function OrderRecommendationTab({ activeTab = 'order', onTabChange }: OrderRecommendationTabProps) {
  const [recommendations, setRecommendations] = useState<OrderRecommendation[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('발주 추천 목록 로딩 오류:', error);
      toast.error('발주 추천을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = recommendations
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.estimated_cost, 0);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge variant="default">보통</Badge>;
      case 'low':
        return <Badge variant="secondary">낮음</Badge>;
      default:
        return null;
    }
  };

  const toggleItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOrderAll = async () => {
    if (selectedItems.length === 0) return;

    try {
      setOrdering(true);
      const items = recommendations
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({
          inventory_item_id: item.id,
          quantity: item.recommended_qty,
          priority: item.priority,
        }));

      await orderApi.create({ items });
      toast.success(`${selectedItems.length}개의 상품을 발주했어요.`);
      setSelectedItems([]);
      loadRecommendations();
    } catch (error) {
      console.error('발주 오류:', error);
      toast.error('발주를 진행하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div 
      id="order-tab"
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
      {onTabChange && <TabNavigation activeTab={activeTab} onTabChange={onTabChange} tabId="order-tab" />}
      <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)', paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '45px' }}>
          <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>발주 추천</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 flex-1" style={{ minHeight: 'calc(100vh - 200px)', marginTop: '2px' }}>
        {/* Description */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-gray-600 flex items-center gap-2" style={{ fontSize: '17px', marginLeft: '2px' }}>
            <AlertCircle className="w-4 h-4 text-[#3182F6]" />
            AI가 최근 판매 흐름을 분석하고 필요한 발주를 알려드려요.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 p-6 border-b border-gray-100">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">긴급 발주</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {recommendations.filter(r => r.priority === 'high').length}개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">보통 발주</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {recommendations.filter(r => r.priority === 'medium').length}개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">선택한 상품</p>
            <p className="text-[20px] text-gray-900 font-medium">{selectedItems.length}개</p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">예상 비용</p>
            <p className="text-[20px] text-gray-900 font-medium">{totalCost.toLocaleString()}원</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
              <p className="text-gray-600 mt-2 text-[15px]">발주 추천을 불러오는 중이에요…</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f9fafb]" style={{ height: '50px' }}>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] bg-[#f9fafb]">상품명</th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] bg-[#f9fafb]">현재 재고</th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] bg-[#f9fafb]">평균 사용</th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] bg-[#f9fafb]">추천 발주</th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] bg-[#f9fafb]">예상 비용</th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] bg-[#f9fafb]">우선순위</th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] bg-[#f9fafb]">예상 소진</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.length > 0 ? (
                  recommendations.map((item) => {
                    const daysLeft = item.days_until_out_of_stock;
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                          selectedItems.includes(item.id) ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <td className="px-6 py-6 text-center text-[15px] text-gray-900 bg-[#f9fafb]">{item.name}</td>
                        <td className="px-6 py-6 text-center text-[15px] text-gray-900 bg-[#f9fafb]">
                          {item.current_stock} {item.unit}
                        </td>
                        <td className="px-6 py-6 text-center text-[15px] text-gray-600 bg-[#f9fafb]">
                          {item.avg_daily} {item.unit}/일
                        </td>
                        <td className="px-6 py-6 text-center text-[15px] text-gray-900 bg-[#f9fafb]">
                          {item.recommended_qty} {item.unit}
                        </td>
                        <td className="px-6 py-6 text-center text-[15px] text-gray-900 bg-[#f9fafb]">
                          {item.estimated_cost.toLocaleString()}원
                        </td>
                        <td className="px-6 py-6 text-center bg-[#f9fafb]">
                          {getPriorityBadge(item.priority)}
                        </td>
                        <td className="px-6 py-6 text-center text-[15px] text-gray-600 bg-[#f9fafb]">
                          <span className={daysLeft <= 2 ? 'text-red-600' : 'text-gray-600'}>
                            약 {daysLeft}일
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 text-center" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
                      <p className="text-[15px] text-gray-400">지금은 추천할 발주가 없어요.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end p-6 border-t border-gray-100" style={{ gap: '16px' }}>
          <Button
            variant="outline"
            onClick={() => setSelectedItems([])}
            disabled={selectedItems.length === 0}
            className="h-14"
            style={{ fontSize: '18px', paddingLeft: '48.5px', paddingRight: '48.5px' }}
          >
            선택 초기화
          </Button>
          <Button
            onClick={handleOrderAll}
            disabled={selectedItems.length === 0 || ordering}
            className="h-14"
            style={{ fontSize: '18px', paddingLeft: '48.5px', paddingRight: '48.5px' }}
          >
            {ordering ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                발주 중...
              </>
            ) : (
              <>
                <ShoppingCart className="w-6 h-6 mr-2" />
                발주 진행 ({selectedItems.length}개)
              </>
            )}
          </Button>
        </div>

        {/* Tips Card */}
        <div className="p-6">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                발주 팁
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-gray-700">•</span>
                  <span>추천 상품 중 2~3개만 골라 발주하면 재고 부담을 줄일 수 있어요.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-700">•</span>
                  <span>계절성과 판매 이력을 참고해 인기 상품을 먼저 발주해 보세요.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
