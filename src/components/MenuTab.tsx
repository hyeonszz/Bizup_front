import { useState, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Upload, RefreshCw, Search, Loader2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { menuApi, MenuItem } from '../lib/api';
import { toast } from 'sonner';
import { useDataLoader } from '../hooks/useDataLoader';

export function MenuTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // 데이터 로딩 (자동 갱신 30초마다)
  const { data: menus, loading, refresh } = useDataLoader(
    () => menuApi.getAll(searchQuery || undefined, selectedCategory || undefined),
    {
      autoRefresh: true,
      refreshInterval: 30000,
      onError: (error) => {
        console.error('메뉴 목록 로딩 오류:', error);
      },
    }
  );

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    if (!menus) return [];
    const uniqueCategories = new Set(menus.map((menu) => menu.category));
    return Array.from(uniqueCategories).sort();
  }, [menus]);

  // 필터링된 메뉴 목록
  const filteredMenus = useMemo(() => {
    if (!menus) return [];
    return menus.filter((menu) => {
      const matchesSearch = searchQuery === '' || 
        menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menu.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === '' || menu.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menus, searchQuery, selectedCategory]);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('CSV 또는 엑셀 파일만 업로드할 수 있어요.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // CSV 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('파일을 선택해 주세요.');
      return;
    }

    try {
      setUploading(true);
      const result = await menuApi.uploadCsv(selectedFile);
      
      if (result.success) {
        toast.success(
          `메뉴 등록 완료! 생성: ${result.items_created}개, 업데이트: ${result.items_updated}개`
        );
        setSelectedFile(null);
        // 파일 input 초기화
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // 데이터 새로고침
        refresh();
      } else {
        toast.error(result.message || '메뉴 등록에 실패했어요.');
        if (result.errors && result.errors.length > 0) {
          console.error('업로드 오류:', result.errors);
        }
      }
    } catch (error) {
      console.error('CSV 업로드 오류:', error);
      toast.error('파일 업로드 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setUploading(false);
    }
  };

  // 재고 상태에 따른 색상 반환
  const getStatusColor = (status: MenuItem['status']) => {
    switch (status) {
      case 'sufficient':
        return 'text-green-600 bg-green-50';
      case 'low':
        return 'text-orange-600 bg-orange-50';
      case 'out_of_stock':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 재고 상태 텍스트
  const getStatusText = (status: MenuItem['status']) => {
    switch (status) {
      case 'sufficient':
        return '충분';
      case 'low':
        return '부족';
      case 'out_of_stock':
        return '품절';
      default:
        return '알 수 없음';
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
      <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)' }}>
        <div className="flex items-center justify-between gap-4" style={{ marginBottom: '45px' }}>
          <div>
            <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>메뉴 관리</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={refresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 flex-1" style={{ minHeight: 'calc(100vh - 200px)', marginTop: '2px' }}>
          {/* CSV 업로드 섹션 */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '20px' }}>메뉴 등록</h3>
            <p className="mb-4" style={{ fontSize: '14px', color: '#4a5565' }}>메뉴를 CSV나 엑셀 파일로 업로드할 수 있어요</p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="file-upload" className="sr-only">파일 선택</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                    style={{ backgroundColor: '#f9fafb', textIndent: '3px' }}
                  />
                  <style>{`
                    #file-upload {
                      padding-left: calc(0.75rem + 8px) !important;
                    }
                    #file-upload::file-selector-button {
                      margin-left: -8px !important;
                      padding-right: 10px !important;
                    }
                  `}</style>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex items-center gap-2"
                  style={{ backgroundColor: '#3182f6', color: 'white' }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      메뉴 등록하기
                    </>
                  )}
                </Button>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600" style={{marginLeft: '8px'}}>
                  <FileText className="w-4 h-4" />
                  <span>선택된 파일: {selectedFile.name}</span>
                  <span className="text-gray-400">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                  <button
                    aria-label="파일 선택 해제"
                    onClick={() => {
                      setSelectedFile(null);
                      const input = document.getElementById('file-upload') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                    type="button"
                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                    style={{ marginLeft: '4px' }}
                  >
                    <svg fill="none" viewBox="0 0 20 20" className="w-4 h-4" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l8 8M6 14L14 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 검색 및 필터 섹션 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" style={{ left: '19px' }} />
                <Input
                  type="text"
                  placeholder="메뉴명 또는 카테고리로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border-gray-300 bg-white"
                  style={{ height: '50px', fontSize: '16px', paddingLeft: '50px' }}
                />
              </div>
              <div className="sm:w-48" style={{ position: 'relative' }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-[50px] px-4 rounded-lg border border-gray-300 bg-white text-gray-900"
                  style={{ fontSize: '16px', height: '50px', lineHeight: '48px', paddingTop: 0, paddingBottom: 0, paddingRight: '35px', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                  aria-label="카테고리 선택"
                >
                  <option value="" style={{ color: '#0a0a0a' }}>전체 카테고리</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {/* 커스텀 화살표 SVG */}
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth={2.2}
                  style={{ pointerEvents: 'none', position: 'absolute', right: 17, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18 }}
                  focusable="false"
                  aria-hidden="true"
                >
                  <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* 메뉴 리스트 테이블 */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
                <p className="text-gray-600 mt-2 text-[15px]">메뉴 목록을 불러오는 중이에요…</p>
              </div>
            ) : filteredMenus.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[15px] text-gray-400">
                  {searchQuery || selectedCategory ? '검색 결과가 없어요.' : '등록된 메뉴가 아직 없어요.'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100" style={{ height: '50px' }}>
                    <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                      메뉴명
                    </th>
                    <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                      카테고리
                    </th>
                    <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                      현재 재고
                    </th>
                    <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                      최소 재고
                    </th>
                    <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                      단위
                    </th>
                    <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                      가격
                    </th>
                    <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenus.map((menu) => (
                    <tr
                      key={menu.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center text-[15px] text-gray-900">{menu.name}</td>
                      <td className="px-6 py-4 text-center text-[15px] text-gray-600">{menu.category}</td>
                      <td className="px-6 py-4 text-center text-[15px] text-gray-900">{menu.quantity}</td>
                      <td className="px-6 py-4 text-center text-[15px] text-gray-600">{menu.min_quantity}</td>
                      <td className="px-6 py-4 text-center text-[15px] text-gray-600">{menu.unit}</td>
                      <td className="px-6 py-4 text-center text-[15px] text-gray-900">
                        ₩{menu.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[13px] ${getStatusColor(menu.status)}`}
                        >
                          {getStatusText(menu.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

