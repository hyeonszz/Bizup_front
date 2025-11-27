import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Users, Plus, Edit, Trash2, Store as StoreIcon, Bell, Loader2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { employeeApi, storeApi, Employee, NotificationSettings } from '../lib/api';
import { toast } from 'sonner';
import { TabNavigation } from './TabNavigation';

interface SettingsTabProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function SettingsTab({ activeTab = 'settings', onTabChange }: SettingsTabProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    phone: '',
  });

  const [editEmployee, setEditEmployee] = useState({
    name: '',
    role: '',
    phone: '',
  });

  const [storeForm, setStoreForm] = useState({
    name: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEmployees(),
        loadStore(),
        loadNotifications(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('직원 목록 로딩 오류:', error);
      toast.error('직원 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const loadStore = async () => {
    try {
      const data = await storeApi.get();
      setStoreForm({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
      });
    } catch (error) {
      console.error('가게 정보 로딩 오류:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await storeApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('알림 설정 로딩 오류:', error);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.role || !newEmployee.phone) {
      toast.error('모든 항목을 입력해 주세요.');
      return;
    }

    try {
      setAdding(true);
      await employeeApi.create({
        name: newEmployee.name,
        role: newEmployee.role,
        phone: newEmployee.phone,
        join_date: new Date().toISOString().split('T')[0],
      });
      toast.success('직원을 추가했어요.');
      setNewEmployee({ name: '', role: '', phone: '' });
      setIsDialogOpen(false);
      loadEmployees();
    } catch (error) {
      console.error('직원 추가 오류:', error);
      toast.error('직원을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setEditEmployee({
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployeeId) return;
    if (!editEmployee.name || !editEmployee.role || !editEmployee.phone) {
      toast.error('모든 항목을 입력해 주세요.');
      return;
    }

    try {
      setEditing(true);
      await employeeApi.update(editingEmployeeId, {
        name: editEmployee.name,
        role: editEmployee.role,
        phone: editEmployee.phone,
      });
      toast.success('직원 정보를 업데이트했어요.');
      setIsEditDialogOpen(false);
      setEditingEmployeeId(null);
      setEditEmployee({ name: '', role: '', phone: '' });
      loadEmployees();
    } catch (error) {
      console.error('직원 수정 오류:', error);
      toast.error('직원 정보를 수정하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm('이 직원을 삭제할까요?')) {
      return;
    }

    try {
      await employeeApi.delete(id);
      toast.success('직원을 삭제했어요.');
      loadEmployees();
    } catch (error) {
      console.error('직원 삭제 오류:', error);
      toast.error('직원을 삭제하지 못했어요. 다시 시도해 주세요.');
    }
  };

  const handleSaveStore = async () => {
    try {
      setSaving(true);
      await storeApi.update(storeForm);
      toast.success('가게 정보를 저장했어요.');
      loadStore();
    } catch (error) {
      console.error('가게 정보 저장 오류:', error);
      toast.error('가게 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean) => {
    if (!notifications) return;

    const updated = { ...notifications, [key]: value };
    setNotifications(updated);

    try {
      await storeApi.updateNotifications({
        low_stock: updated.low_stock,
        out_of_stock: updated.out_of_stock,
        order_reminder: updated.order_reminder,
        daily_report: updated.daily_report,
      });
    } catch (error) {
      console.error('알림 설정 저장 오류:', error);
      toast.error('알림 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      loadNotifications(); // 원래 값으로 복구
    }
  };

  return (
    <div 
      id="settings-tab"
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
      {onTabChange && <TabNavigation activeTab={activeTab} onTabChange={onTabChange} tabId="settings-tab" />}
      <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)', paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '45px' }}>
          <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>설정</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 flex-1" style={{ minHeight: 'calc(100vh - 200px)', marginTop: '2px' }}>
          <div className="p-6">
      {/* Store Settings */}
      <div className="pb-6" style={{ marginLeft: '1.5px' }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <StoreIcon className="w-5 h-5" />
            가게 설정
          </h3>
          <p className="text-sm text-gray-600 mt-1">가게 정보를 업데이트하고 최신 상태로 유지해 보세요.</p>
        </div>
        {/* 파란 선 - 흰색 배경 양끝까지 */}
        <div 
          className="mb-6" 
          style={{ 
            height: '1px', 
            backgroundColor: '#c7d7ff',
            marginLeft: 'calc(-1.5rem - 1.5px)',
            marginRight: '-1.5rem',
            width: 'calc(100% + 3rem + 1.5px)'
          }}
        />
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-col gap-2">
            <Label htmlFor="storeName">가게 이름</Label>
            <Input
              id="storeName"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
              placeholder="가게 이름"
              style={{ backgroundColor: '#f9fafb' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="storeAddress">주소</Label>
            <Input
              id="storeAddress"
              value={storeForm.address}
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
              placeholder="주소"
              style={{ backgroundColor: '#f9fafb' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="storePhone">전화번호</Label>
            <Input
              id="storePhone"
              value={storeForm.phone}
              onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
              placeholder="전화번호"
              style={{ backgroundColor: '#f9fafb' }}
            />
          </div>
          <br></br>
          <Button
            onClick={handleSaveStore}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장하기'
            )}
          </Button>
        </div>
      </div>

      {/* Employee Management */}
      <div className="py-6" style={{ marginLeft: '1.5px' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              직원 관리
            </h3>
            <p className="text-sm text-gray-600 mt-1">직원 정보를 업데이트하고 연락처를 최신으로 유지해 주세요.</p>
          </div>
          <div className="flex-shrink-0" style={{ transform: 'translate(-5px, 6px)' }}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  직원 추가하기
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>새 직원 추가</DialogTitle>
                  <DialogDescription>새 직원 정보를 입력해 주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="empName">이름</Label>
                    <Input
                      id="empName"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      placeholder="이름 입력"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="empRole">직책</Label>
                    <Input
                      id="empRole"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                      placeholder="예: 매니저, 직원"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="empPhone">전화번호</Label>
                    <Input
                      id="empPhone"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      placeholder="010-1234-5678"
                    />
                  </div>
                  <br></br>
                  <Button
                    onClick={handleAddEmployee}
                    className="w-full"
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
            
            {/* Edit Employee Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>직원 정보 수정</DialogTitle>
                  <DialogDescription>직원 정보를 수정해 주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="editEmpName">이름</Label>
                    <Input
                      id="editEmpName"
                      value={editEmployee.name}
                      onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                      placeholder="이름 입력"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="editEmpRole">직책</Label>
                    <Input
                      id="editEmpRole"
                      value={editEmployee.role}
                      onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}
                      placeholder="예: 매니저, 직원"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="editEmpPhone">전화번호</Label>
                    <Input
                      id="editEmpPhone"
                      value={editEmployee.phone}
                      onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                      placeholder="010-1234-5678"
                    />
                  </div>
                  <br></br>
                  <Button
                    onClick={handleUpdateEmployee}
                    className="w-full"
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
        </div>
        {/* 파란 선 - 흰색 배경 양끝까지 */}
        <div 
          className="mb-6" 
          style={{ 
            height: '1px', 
            backgroundColor: '#c7d7ff',
            marginLeft: 'calc(-1.5rem - 1.5px)',
            marginRight: '-1.5rem',
            width: 'calc(100% + 3rem + 1.5px)'
          }}
        />
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="pl-6 text-center">이름</TableHead>
                <TableHead className="text-center">직책</TableHead>
                <TableHead className="text-center">전화번호</TableHead>
                <TableHead className="text-center">상태</TableHead>
                <TableHead className="text-center">입사일</TableHead>
                <TableHead className="text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-700" />
                    <p className="text-gray-600 mt-2">직원 목록을 불러오는 중이에요…</p>
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    등록된 직원이 아직 없어요.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50/50" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <TableCell className="pl-6 text-center">{employee.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-gray-300 text-gray-800">
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-center">{employee.phone}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={employee.status === 'active' ? 'secondary' : 'default'}>
                        {employee.status === 'active' ? '활동' : '휴직'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-center">{employee.join_date}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-700 hover:text-gray-800 hover:bg-gray-50"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="pt-6" style={{ marginLeft: '1.5px' }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 설정
          </h3>
          <p className="text-sm text-gray-600 mt-1">꼭 필요한 순간에만 알림을 받아 보세요.</p>
        </div>
        {/* 파란 선 - 흰색 배경 양끝까지 */}
        <div 
          className="mb-6" 
          style={{ 
            height: '1px', 
            backgroundColor: '#c7d7ff',
            marginLeft: 'calc(-1.5rem - 1.5px)',
            marginRight: '-1.5rem',
            width: 'calc(100% + 3rem + 1.5px)'
          }}
        />
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
            <p className="text-gray-600 mt-2">알림 설정을 불러오는 중이에요…</p>
          </div>
        ) : notifications ? (
          <div className="space-y-4 max-w-2xl" style={{ marginTop: '5px' }}>
            <div className="flex items-center justify-end pt-3 pb-3 gap-7">
              <div className="flex-1">
                <p className="text-gray-800">재고 부족 알림</p>
                <p className="text-gray-600 text-sm">재고가 최소 수량 아래로 내려가면 바로 알려드릴게요.</p>
              </div>
              <Switch
                checked={notifications.low_stock}
                onCheckedChange={(checked) => handleNotificationChange('low_stock', checked)}
              />
            </div>
            <Separator style={{ backgroundColor: '#e5e7eb' }} />
            <div className="flex items-center justify-end pt-3 pb-3 gap-7">
              <div className="flex-1">
                <p className="text-gray-800">품절 알림</p>
                <p className="text-gray-600 text-sm">상품이 품절되면 즉시 알려드릴게요.</p>
              </div>
              <Switch
                checked={notifications.out_of_stock}
                onCheckedChange={(checked) => handleNotificationChange('out_of_stock', checked)}
              />
            </div>
            <Separator style={{ backgroundColor: '#e5e7eb' }} />
            <div className="flex items-center justify-end pt-3 pb-3 gap-7">
              <div className="flex-1">
                <p className="text-gray-800">발주 알림</p>
                <p className="text-gray-600 text-sm">자동 발주 추천 시점이 되면 알려드릴게요.</p>
              </div>
              <Switch
                checked={notifications.order_reminder}
                onCheckedChange={(checked) => handleNotificationChange('order_reminder', checked)}
              />
            </div>
            <Separator style={{ backgroundColor: '#e5e7eb' }} />
            <div className="flex items-center justify-end pt-3 pb-3 gap-7">
              <div className="flex-1">
                <p className="text-gray-800">일일 리포트</p>
                <p className="text-gray-600 text-sm">매일 재고 현황 리포트를 보내드릴게요.</p>
              </div>
              <Switch
                checked={notifications.daily_report}
                onCheckedChange={(checked) => handleNotificationChange('daily_report', checked)}
              />
            </div>
          </div>
        ) : null}
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}
