import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Plus, Search, Edit, Package, Loader2, Trash2 } from 'lucide-react';
import { inventoryApi, InventoryItem, InventoryStats } from '../lib/api';
import { toast } from 'sonner';

export function InventoryTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    price: 0,
  });

  const [editItem, setEditItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    price: 0,
  });

  // 재고 목록 로딩
  useEffect(() => {
    loadInventory();
    loadStats();
  }, [searchQuery]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll(searchQuery || undefined);
      setInventory(data);
    } catch (error) {
      console.error('재고 목록 로딩 오류:', error);
      toast.error('재고 목록 로딩 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await inventoryApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('재고 통계 로딩 오류:', error);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return { text: '품절', variant: 'destructive' as const };
    if (quantity <= minQuantity) return { text: '부족', variant: 'default' as const };
    return { text: '정상', variant: 'secondary' as const };
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.unit) {
      toast.error('재고 추가 필수 정보가 누락되었습니다.');
      return;
    }

    try {
      setAdding(true);
      await inventoryApi.create({
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        unit: newItem.unit,
        min_quantity: newItem.minQuantity,
        price: newItem.price,
      });
      toast.success('재고 추가 성공');
      setNewItem({ name: '', category: '', quantity: 0, unit: '', minQuantity: 0, price: 0 });
      setIsDialogOpen(false);
      loadInventory();
      loadStats();
    } catch (error) {
      console.error('재고 추가 오류:', error);
      toast.error('재고 추가 오류가 발생했습니다.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minQuantity: item.min_quantity,
      price: item.price,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItemId) return;
    if (!editItem.name || !editItem.category || !editItem.unit) {
      toast.error('재고 수정 필수 정보가 누락되었습니다.');
      return;
    }

    try {
      setEditing(true);
      await inventoryApi.update(editingItemId, {
        name: editItem.name,
        category: editItem.category,
        quantity: editItem.quantity,
        unit: editItem.unit,
        min_quantity: editItem.minQuantity,
        price: editItem.price,
      });
      toast.success('재고 정보가 수정되었습니다.');
      setIsEditDialogOpen(false);
      setEditingItemId(null);
      setEditItem({ name: '', category: '', quantity: 0, unit: '', minQuantity: 0, price: 0 });
      loadInventory();
      loadStats();
    } catch (error) {
      console.error('재고 수정 오류:', error);
      toast.error('재고 수정 중 오류가 발생했습니다.');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('정말 이 재고 항목을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await inventoryApi.delete(id);
      toast.success('재고 항목이 삭제되었습니다.');
      loadInventory();
      loadStats();
    } catch (error) {
      console.error('재고 항목 삭제 오류:', error);
      toast.error('재고 항목 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800 flex items-center mb-6">
                <Package className="w-5 h-5" />
                재고 관리
              </CardTitle>              
              <CardDescription className="text-gray-600 text-sm">재고 관리를 위한 페이지입니다.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-200 text-black border-none cursor-pointer transition-all duration-200 font-medium hover:bg-gray-300 disabled:bg-gray-200 disabled:text-white disabled:opacity-60 disabled:cursor-not-allowed">
                  <Plus className="w-4 h-4 mr-2" />
                  재고 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>새 재고 추가</DialogTitle>
                  <DialogDescription>새로운 상품의 재고 정보를 입력해주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">상품명</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="상품명 입력"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="category">카테고리</Label>
                    <Input
                      id="category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="예: 식품, 음료"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="quantity">현재 수량</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="unit">단위</Label>
                      <Input
                        id="unit"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        placeholder="예: 개, kg, L"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="minQuantity">최소 수량</Label>
                      <Input
                        id="minQuantity"
                        type="number"
                        value={newItem.minQuantity}
                        onChange={(e) => setNewItem({ ...newItem, minQuantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="price">가격 (원)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <br></br>
                  <Button 
                    onClick={handleAddItem} 
                    className="w-full bg-gray-200 text-black border-none cursor-pointer transition-all duration-200 font-medium hover:bg-gray-300 disabled:bg-gray-200 disabled:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={adding}
                  >
                    {adding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        추가 중...
                      </>
                    ) : (
                      '추가하기'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Edit Inventory Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>재고 정보 수정</DialogTitle>
                  <DialogDescription>재고 정보를 수정해주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="editName">상품명</Label>
                    <Input
                      id="editName"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      placeholder="상품명 입력"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="editCategory">카테고리</Label>
                    <Input
                      id="editCategory"
                      value={editItem.category}
                      onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                      placeholder="예: 식품, 음료"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="editQuantity">현재 수량</Label>
                      <Input
                        id="editQuantity"
                        type="number"
                        value={editItem.quantity}
                        onChange={(e) => setEditItem({ ...editItem, quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="editUnit">단위</Label>
                      <Input
                        id="editUnit"
                        value={editItem.unit}
                        onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                        placeholder="예: 개, kg, L"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="editMinQuantity">최소 수량</Label>
                      <Input
                        id="editMinQuantity"
                        type="number"
                        value={editItem.minQuantity}
                        onChange={(e) => setEditItem({ ...editItem, minQuantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="editPrice">가격 (원)</Label>
                      <Input
                        id="editPrice"
                        type="number"
                        value={editItem.price}
                        onChange={(e) => setEditItem({ ...editItem, price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpdateItem} 
                    className="w-full bg-gray-200 text-black border-none cursor-pointer transition-all duration-200 font-medium hover:bg-gray-300 disabled:bg-gray-200 disabled:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={editing}
                  >
                    {editing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        수정 중...
                      </>
                    ) : (
                      '수정하기'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="상품명 또는 카테고리를 검색해주세요."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-600 mb-1">전체 개수</p>
              <p className="text-gray-800">{stats?.total_items ?? inventory.length}개</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <p className="text-gray-600 mb-1">재고 부족</p>
              <p className="text-yellow-700">
                {stats?.low_stock_count ?? inventory.filter(item => item.quantity <= item.min_quantity && item.quantity > 0).length}개
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <p className="text-gray-600 mb-1">품절</p>
              <p className="text-red-700">
                {stats?.out_of_stock_count ?? inventory.filter(item => item.quantity === 0).length}개
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="pl-6 text-center">상품명</TableHead>
                  <TableHead className="text-center">카테고리</TableHead>
                  <TableHead className="text-center">현재 수량</TableHead>
                  <TableHead className="text-center">최소 수량</TableHead>
                  <TableHead className="text-center">가격</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead className="text-center">마지막 업데이트</TableHead>
                  <TableHead className="text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-700" />
                      <p className="text-gray-600 mt-2">재고 목록 로딩 중...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      재고 항목이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(item.quantity, item.min_quantity);
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50/50">
                        <TableCell className="pl-6 text-center">{item.name}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-gray-300 text-gray-800">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-gray-600 text-center">
                          {item.min_quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-center">{item.price.toLocaleString()}원</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={status.variant}
                            className={
                              status.text === '정상' ? 'bg-green-200 text-green-800 border-none' :
                              status.text === '부족' ? 'bg-yellow-100 text-yellow-600 border-none' :
                              'bg-red-200 text-red-600 border-none'
                            }
                          >
                            {status.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 text-center">{item.last_updated}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-700 hover:text-gray-800 hover:bg-gray-50"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
