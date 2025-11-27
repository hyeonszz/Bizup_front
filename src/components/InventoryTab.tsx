import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Search, Edit2, Loader2, Trash2 } from 'lucide-react';
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
    quantity: '',
    minQuantity: '',
    price: '',
  });

  const [editItem, setEditItem] = useState({
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    price: '',
  });

  // 재고 목록 로딩
  useEffect(() => {
    loadInventory();
    loadStats();
  }, []);

  // 검색어 변경 시 재고 목록 다시 로딩
  useEffect(() => {
    if (searchQuery !== undefined) {
      loadInventory();
    }
  }, [searchQuery]);

  // 다이얼로그 열림 시 폼 데이터 초기화
  useEffect(() => {
    if (!isDialogOpen) {
      setNewItem({ name: '', category: '', quantity: '', minQuantity: '', price: '' });
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (!isEditDialogOpen && editingItemId === null) {
      setEditItem({ name: '', category: '', quantity: '', minQuantity: '', price: '' });
    }
  }, [isEditDialogOpen, editingItemId]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll(searchQuery || undefined);
      setInventory(data);
    } catch (error) {
      console.error('재고 목록 로딩 오류:', error);
      toast.error('재고 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
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

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category) {
      toast.error('필수 정보를 입력하고 다시 시도해 주세요.');
      return;
    }

    try {
      setAdding(true);
      await inventoryApi.create({
        name: newItem.name,
        category: newItem.category,
        quantity: parseInt(newItem.quantity) || 0,
        unit: '',
        min_quantity: parseInt(newItem.minQuantity) || 0,
        price: parseInt(newItem.price) || 0,
      });
      toast.success('새 재고를 추가했어요.');
      setNewItem({ name: '', category: '', quantity: '', minQuantity: '', price: '' });
      setIsDialogOpen(false);
      loadInventory();
      loadStats();
    } catch (error) {
      console.error('재고 추가 오류:', error);
      toast.error('재고를 추가하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minQuantity: item.min_quantity.toString(),
      price: item.price.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId) return;
    if (!editItem.name || !editItem.category) {
      toast.error('필수 정보를 입력하고 다시 시도해 주세요.');
      return;
    }

    try {
      setEditing(true);
      await inventoryApi.update(editingItemId, {
        name: editItem.name,
        category: editItem.category,
        quantity: parseInt(editItem.quantity) || 0,
        min_quantity: parseInt(editItem.minQuantity) || 0,
        price: parseInt(editItem.price) || 0,
      });
      toast.success('재고 정보를 업데이트했어요.');
      setIsEditDialogOpen(false);
      setEditingItemId(null);
      setEditItem({ name: '', category: '', quantity: '', minQuantity: '', price: '' });
      loadInventory();
      loadStats();
    } catch (error) {
      console.error('재고 수정 오류:', error);
      toast.error('재고 정보를 수정하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('이 재고를 삭제할까요?')) {
      return;
    }

    try {
      await inventoryApi.delete(id);
      toast.success('재고를 삭제했어요.');
      loadInventory();
      loadStats();
    } catch (error) {
      console.error('재고 항목 삭제 오류:', error);
      toast.error('재고를 삭제하지 못했어요. 다시 시도해 주세요.');
    }
  };

  return (
    <div 
      className="-mx-6 -mt-6 -mb-6" 
      style={{ 
        backgroundColor: '#f3f5f7', 
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        minHeight: '100vh',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem'
      }}
    >
      <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)' }} >
        <div className="flex items-center justify-between gap-4" style={{ marginBottom: '45px' }}>
          <div>
            <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>재고 현황</h2>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center justify-center gap-3 text-white rounded-full transition-colors"
            style={{ backgroundColor: '#3182f6', fontSize: '18px', padding: '14px 28px', fontWeight: 600 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3182f6';
            }}
          >
            <Plus className="w-6 h-6" />
            재고 추가
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 flex-1" style={{ minHeight: 'calc(100vh - 200px)', marginTop: '2px' }} >
        {/* Search */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" strokeWidth={1.5} style={{ left: '19px' }} />
            <Input
              type="text"
              placeholder="상품명 또는 카테고리를 검색해 주세요."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border-gray-300 bg-white"
              style={{ height: '60px', fontSize: '20px', paddingLeft: '63px' }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 p-6 border-b border-gray-100">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">전체 재고</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {stats?.total_items ?? inventory.length}개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">부족 위험</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {stats?.low_stock_count ??
                inventory.filter(
                  (item) => item.quantity <= item.min_quantity && item.quantity > 0
                ).length}
              개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">품절 수</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {stats?.out_of_stock_count ??
                inventory.filter((item) => item.quantity === 0).length}
              개
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
              <p className="text-gray-600 mt-2 text-[15px]">재고 목록을 불러오는 중이에요…</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100" style={{ height: '50px' }}>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    상품명
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    카테고리
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    현재 수량
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    최소 수량
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    가격
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    상태
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    마지막 업데이트
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const isOutOfStock = item.quantity === 0;
                    const isLowStock = item.quantity > 0 && item.quantity < item.min_quantity;
                    let status = '정상';
                    let statusColor = 'text-green-600 bg-green-50';
                    if (isOutOfStock) {
                      status = '품절';
                      statusColor = 'text-red-600 bg-red-50';
                    } else if (isLowStock) {
                      status = '부족';
                      statusColor = 'text-orange-600 bg-orange-50';
                    }

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-[15px] text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-center text-[15px] text-gray-600">{item.category}</td>
                        <td className="px-6 py-4 text-center text-[15px] text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 text-center text-[15px] text-gray-600">{item.min_quantity}</td>
                        <td className="px-6 py-4 text-center text-[15px] text-gray-900">
                          ₩{item.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[13px] ${statusColor}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-[15px] text-gray-600">
                          {item.last_updated}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-[16px] h-[16px]" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-[16px] h-[16px]" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 text-center" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
                      <p className="text-[15px] text-gray-400">등록된 재고가 아직 없어요.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>

      {/* Add Inventory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-medium">재고 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[14px] text-gray-600">제품명</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="예: 노트북 스탠드"
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[14px] text-gray-600">카테고리</Label>
              <Input
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="예: 사무용품"
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-[14px] text-gray-600">현재 수량</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="0"
                  required
                  min="0"
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQuantity" className="text-[14px] text-gray-600">최소 수량</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={newItem.minQuantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minQuantity: e.target.value })
                  }
                  placeholder="0"
                  required
                  min="0"
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[14px] text-gray-600">가격 (₩)</Label>
              <Input
                id="price"
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="0"
                required
                min="0"
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 h-11 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-[15px]"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={adding}
                className="flex-1 h-11 px-4 bg-[#93C5FD] text-white rounded-lg hover:bg-[#7CB5FC] transition-colors text-[15px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    추가 중...
                  </>
                ) : (
                  '추가'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-medium">재고 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateItem} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editName" className="text-[14px] text-gray-600">제품명</Label>
              <Input
                id="editName"
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                placeholder="예: 노트북 스탠드"
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategory" className="text-[14px] text-gray-600">카테고리</Label>
              <Input
                id="editCategory"
                value={editItem.category}
                onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                placeholder="예: 사무용품"
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editQuantity" className="text-[14px] text-gray-600">현재 수량</Label>
                <Input
                  id="editQuantity"
                  type="number"
                  value={editItem.quantity}
                  onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
                  placeholder="0"
                  required
                  min="0"
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMinQuantity" className="text-[14px] text-gray-600">최소 수량</Label>
                <Input
                  id="editMinQuantity"
                  type="number"
                  value={editItem.minQuantity}
                  onChange={(e) =>
                    setEditItem({ ...editItem, minQuantity: e.target.value })
                  }
                  placeholder="0"
                  required
                  min="0"
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPrice" className="text-[14px] text-gray-600">가격 (₩)</Label>
              <Input
                id="editPrice"
                type="number"
                value={editItem.price}
                onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                placeholder="0"
                required
                min="0"
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 h-11 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-[15px]"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={editing}
                className="flex-1 h-11 px-4 bg-[#93C5FD] text-white rounded-lg hover:bg-[#7CB5FC] transition-colors text-[15px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    수정 중...
                  </>
                ) : (
                  '수정'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
