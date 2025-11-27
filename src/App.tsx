import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Package, TrendingUp, AlertTriangle, Settings, Utensils } from 'lucide-react';
import { InventoryTab } from './components/InventoryTab';
import { OrderRecommendationTab } from './components/OrderRecommendationTab';
import { OutOfStockTab } from './components/OutOfStockTab';
import { SettingsTab } from './components/SettingsTab';
import { MenuTab } from './components/MenuTab';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <>
      <div className="min-h-screen bg-[#eff0f3]">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-gray-900 font-medium bold mb-2" style={{ fontSize: '35px' }}>Bizup 으로 가게 운영을 한 번에 챙겨요</h1>
            <p className="mb-6 font-black" style={{ fontSize: '25px', fontWeight: '600', color: '#646d7a' }}>재고부터 발주까지 가볍게 끝내보세요</p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="inline-flex items-center bg-[#f2f4f7] p-1.5 rounded-full h-auto" style={{ gap: '16px' }}>
              <TabsTrigger 
                value="inventory" 
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: activeTab === 'inventory' ? '#ffffff' : '#3182f6',
                  backgroundColor: activeTab === 'inventory' ? '#3182f6' : '#eff6ff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3182f6';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'inventory') {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.color = '#3182f6';
                  }
                }}
              >
                <Package className="w-5 h-5" />
                <span className="hidden sm:inline">재고 관리</span>
                <span className="sm:hidden">재고</span>
              </TabsTrigger>
              <TabsTrigger 
                value="menu" 
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: activeTab === 'menu' ? '#ffffff' : '#3182f6',
                  backgroundColor: activeTab === 'menu' ? '#3182f6' : '#eff6ff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3182f6';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'menu') {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.color = '#3182f6';
                  }
                }}
              >
                <Utensils className="w-5 h-5" />
                <span className="hidden sm:inline">메뉴 관리</span>
                <span className="sm:hidden">메뉴</span>
              </TabsTrigger>
              <TabsTrigger 
                value="order" 
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: activeTab === 'order' ? '#ffffff' : '#3182f6',
                  backgroundColor: activeTab === 'order' ? '#3182f6' : '#eff6ff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3182f6';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'order') {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.color = '#3182f6';
                  }
                }}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="hidden sm:inline">발주 추천</span>
                <span className="sm:hidden">발주</span>
              </TabsTrigger>
              <TabsTrigger 
                value="outofstock" 
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: activeTab === 'outofstock' ? '#ffffff' : '#3182f6',
                  backgroundColor: activeTab === 'outofstock' ? '#3182f6' : '#eff6ff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3182f6';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'outofstock') {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.color = '#3182f6';
                  }
                }}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="hidden sm:inline">품절 관리</span>
                <span className="sm:hidden">품절</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: activeTab === 'settings' ? '#ffffff' : '#3182f6',
                  backgroundColor: activeTab === 'settings' ? '#3182f6' : '#eff6ff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3182f6';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'settings') {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.color = '#3182f6';
                  }
                }}
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">설정</span>
                <span className="sm:hidden">설정</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 bg-[#eff0f3] rounded-3xl p-6">
              <TabsContent value="inventory" className="m-0">
                <InventoryTab />
              </TabsContent>
              <TabsContent value="menu" className="m-0">
                <MenuTab />
              </TabsContent>
              <TabsContent value="order" className="m-0">
                <OrderRecommendationTab />
              </TabsContent>
              <TabsContent value="outofstock" className="m-0">
                <OutOfStockTab />
              </TabsContent>
              <TabsContent value="settings" className="m-0">
                <SettingsTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </>
  );
}
