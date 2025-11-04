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

export function SettingsTab() {
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
      toast.error('직원 목록 로딩 오류가 발생했습니다.');
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
      toast.error('모든 항목을 입력해주세요.');
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
      toast.success('직원이 추가되었습니다.');
      setNewEmployee({ name: '', role: '', phone: '' });
      setIsDialogOpen(false);
      loadEmployees();
    } catch (error) {
      console.error('직원 추가 오류:', error);
      toast.error('직원 추가 중 오류가 발생했습니다.');
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
      toast.error('모든 항목을 입력해주세요.');
      return;
    }

    try {
      setEditing(true);
      await employeeApi.update(editingEmployeeId, {
        name: editEmployee.name,
        role: editEmployee.role,
        phone: editEmployee.phone,
      });
      toast.success('직원 정보가 수정되었습니다.');
      setIsEditDialogOpen(false);
      setEditingEmployeeId(null);
      setEditEmployee({ name: '', role: '', phone: '' });
      loadEmployees();
    } catch (error) {
      console.error('직원 수정 오류:', error);
      toast.error('직원 수정 중 오류가 발생했습니다.');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm('정말 이 직원을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await employeeApi.delete(id);
      toast.success('직원이 삭제되었습니다.');
      loadEmployees();
    } catch (error) {
      console.error('직원 삭제 오류:', error);
      toast.error('직원 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSaveStore = async () => {
    try {
      setSaving(true);
      await storeApi.update(storeForm);
      toast.success('가게 정보가 저장되었습니다.');
      loadStore();
    } catch (error) {
      console.error('가게 정보 저장 오류:', error);
      toast.error('가게 정보 저장 중 오류가 발생했습니다.');
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
      toast.error('알림 설정 저장 중 오류가 발생했습니다.');
      loadNotifications(); // 원래 값으로 복구
    }
  };

  return (
    <div className="space-y-6">
      {/* Store Settings */}
      <Card className="border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <StoreIcon className="w-5 h-5" />
            가게 설정
          </CardTitle>
          <CardDescription>기본 정보를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-col gap-2">
              <Label htmlFor="storeName">가게 이름</Label>
              <Input
                id="storeName"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                placeholder="가게 이름"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="storeAddress">주소</Label>
              <Input
                id="storeAddress"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                placeholder="주소"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="storePhone">전화번호</Label>
              <Input
                id="storePhone"
                value={storeForm.phone}
                onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                placeholder="전화번호"
              />
            </div>
            <br></br>
            <Button
              className="bg-gray-200 text-black border-none cursor-pointer transition-all duration-200 font-medium hover:bg-gray-300 disabled:bg-gray-200 disabled:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSaveStore}
              disabled={saving}
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
        </CardContent>
      </Card>

      {/* Employee Management */}
      <Card className="border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                직원 관리
              </CardTitle>
              <CardDescription>직원 정보를 관리하세요</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-200 text-black border-none cursor-pointer transition-all duration-200 font-medium hover:bg-gray-300 disabled:bg-gray-200 disabled:text-white disabled:opacity-60 disabled:cursor-not-allowed">
                  <Plus className="w-4 h-4 mr-2" />
                  직원 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>새 직원 추가</DialogTitle>
                  <DialogDescription>새로운 직원의 정보를 입력해주세요.</DialogDescription>
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
            
            {/* Edit Employee Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>직원 정보 수정</DialogTitle>
                  <DialogDescription>직원의 정보를 수정해주세요.</DialogDescription>
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
          <div className="border rounded-lg overflow-hidden">
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
                      <p className="text-gray-600 mt-2">로딩 중...</p>
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      직원이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50/50">
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
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 설정
          </CardTitle>
          <CardDescription>원하는 알림을 설정해주세요.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-700" />
              <p className="text-gray-600 mt-2">로딩 중...</p>
            </div>
          ) : notifications ? (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-end pt-3 pb-3 gap-7">
                <div className="flex-1">
                  <p className="text-gray-800">재고 부족 알림</p>
                  <p className="text-gray-600">재고가 최소 수량 아래로 내려가면 알림을 보내드립니다</p>
                </div>
                <Switch
                  checked={notifications.low_stock}
                  onCheckedChange={(checked) => handleNotificationChange('low_stock', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-end pt-3 pb-3 gap-7">
                <div className="flex-1">
                  <p className="text-gray-800">품절 알림</p>
                  <p className="text-gray-600">상품이 품절되면 즉시 알림을 보내드립니다</p>
                </div>
                <Switch
                  checked={notifications.out_of_stock}
                  onCheckedChange={(checked) => handleNotificationChange('out_of_stock', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-end pt-3 pb-3 gap-7">
                <div className="flex-1">
                  <p className="text-gray-800">발주 알림</p>
                  <p className="text-gray-600">자동 발주 추천 시점이 되면 알림을 보내드립니다</p>
                </div>
                <Switch
                  checked={notifications.order_reminder}
                  onCheckedChange={(checked) => handleNotificationChange('order_reminder', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-end pt-3 pb-3 gap-7">
                <div className="flex-1">
                  <p className="text-gray-800">일일 리포트</p>
                  <p className="text-gray-600">매일 재고 현황 리포트를 보내드립니다</p>
                </div>
                <Switch
                  checked={notifications.daily_report}
                  onCheckedChange={(checked) => handleNotificationChange('daily_report', checked)}
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
