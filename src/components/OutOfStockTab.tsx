import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertTriangle, Clock, Package, RotateCcw, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { outOfStockApi, OutOfStockItem } from '../lib/api';
import { toast } from 'sonner';

export function OutOfStockTab() {
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
      toast.error('품절 상품 목록 로딩 오류가 발생했습니다.');
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
      toast.success('재입고 완료');
      loadOutOfStockItems();
    } catch (error) {
      console.error('재입고 오류:', error);
      toast.error('재입고 오류가 발생했습니다.');
    } finally {
      setRestocking(null);
    }
  };

  const totalLoss = outOfStockItems.reduce((sum, item) => sum + item.estimated_loss, 0);

  return (
    <div className="space-y-6">
      <Card className="border-red-100 shadow-md">
        <CardHeader className="bg-white border-b border-gray-300 pt-6 pb-6">
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            품절 상품 관리          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">품절 상품을 관리하는 페이지입니다.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {outOfStockItems.length > 0 ? (
            <>
              <Alert className="mb-6 border-red-200 bg-red-50 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-red-700">
                  품절 개수 {outOfStockItems.length}개가 있습니다. 품절 상품을 재입고하세요.
                </AlertDescription>
              </Alert>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <p className="text-gray-600 mb-1">품절 개수</p>
                  <p className="text-red-700">{outOfStockItems.length}개</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 mb-1">평균 품절 기간</p>
                  <p className="text-orange-700">
                    {outOfStockItems.length > 0 
                      ? Math.round(outOfStockItems.reduce((sum, item) => sum + item.days_out_of_stock, 0) / outOfStockItems.length)
                      : 0}일
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 mb-1">예상 손실</p>
                  <p className="text-gray-700">{totalLoss.toLocaleString()}원</p>
                </div>
              </div>

              {/* Out of Stock Table */}
              <div className="border rounded-lg overflow-hidden mb-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-50 hover:bg-red-50">
                      <TableHead className="pl-6 text-center">상품명</TableHead>
                      <TableHead className="text-center">카테고리</TableHead>
                      <TableHead className="text-center">품절 기간</TableHead>
                      <TableHead className="text-center">마지막 재고</TableHead>
                      <TableHead className="text-center">예상 손실</TableHead>
                      <TableHead className="text-center">상태</TableHead>
                      <TableHead className="text-center">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
                          <p className="text-gray-600 mt-2">품절 상품 목록 로딩 중...</p>
                        </TableCell>
                      </TableRow>
                    ) : outOfStockItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          품절 상품이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      outOfStockItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-red-50/50">
                          <TableCell className="pl-6 text-center">{item.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="border-gray-300 text-gray-800">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2 text-red-600">
                              <Clock className="w-4 h-4" />
                              {item.days_out_of_stock}일
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 text-center">
                            {item.last_stock} {item.unit}
                          </TableCell>
                          <TableCell className="text-red-600 text-center">
                            -{item.estimated_loss.toLocaleString()}원
                          </TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              className="bg-red-50 text-red-600 border-none cursor-pointer transition-all duration-200 font-medium hover:bg-red-200"
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 text-xs">품절 상품이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prevention Tips */}
      <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            품절 방지 권장 사항
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
          <span className="text-gray-700">•</span>
              <span>최소 재고량을 미리 설정하여 품절을 예방하세요.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-700">•</span>
              <span>판매 패턴을 분석하여 인기 상품을 재고에 보관하세요.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-700">•</span>
              <span>정기적인 상품은 미리 발주하는 방식이 효율적입니다.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-700">•</span>
              <span>계절상품이나 이벤트 상품은 미리 발주 계획을 세우세요.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
