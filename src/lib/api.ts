
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async postFile<T>(endpoint: string, file: File): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  price: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface InventoryItemCreate {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  price: number;
}

export interface InventoryItemUpdate {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  min_quantity?: number;
  price?: number;
}

export interface InventoryStats {
  total_items: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export const inventoryApi = {
  getAll: (search?: string) => api.get<InventoryItem[]>(`/inventory`, { search: search || '' }),
  getStats: () => api.get<InventoryStats>('/inventory/stats'),
  getById: (id: number) => api.get<InventoryItem>(`/inventory/${id}`),
  create: (data: InventoryItemCreate) => api.post<InventoryItem>('/inventory', data),
  update: (id: number, data: InventoryItemUpdate) => api.put<InventoryItem>(`/inventory/${id}`, data),
  delete: (id: number) => api.delete(`/inventory/${id}`),
};

export interface OrderRecommendation {
  id: number;
  name: string;
  current_stock: number;
  min_stock: number;
  avg_daily: number;
  recommended_qty: number;
  unit: string;
  priority: 'high' | 'medium' | 'low';
  estimated_cost: number;
  days_until_out_of_stock: number;
}

export interface OrderItemCreate {
  inventory_item_id: number;
  quantity: number;
  priority: 'high' | 'medium' | 'low';
}

export interface OrderCreate {
  items: OrderItemCreate[];
}

export interface OrderResponse {
  id: number;
  status: string;
  total_cost: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total_price: number;
    priority: string;
  }>;
  created_at: string;
  updated_at: string;
}

export const orderApi = {
  getRecommendations: () => api.get<OrderRecommendation[]>('/orders/recommendations'),
  create: (data: OrderCreate) => api.post<OrderResponse>('/orders', data),
};

export interface OutOfStockItem {
  id: number;
  name: string;
  category: string;
  days_out_of_stock: number;
  last_stock: number;
  unit: string;
  estimated_loss: number;
  status: 'critical' | 'warning' | 'recent';
}

export const outOfStockApi = {
  getAll: () => api.get<OutOfStockItem[]>('/out-of-stock'),
  restock: (itemId: number, quantity: number) => {
    // 쿼리 파라미터로 quantity 전달 (body 없음)
    return api.post<{ message: string; item: InventoryItem }>(`/out-of-stock/${itemId}/restock?quantity=${quantity}`);
  },
};

export interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
  status: 'active' | 'inactive';
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  name: string;
  role: string;
  phone: string;
  join_date: string;
}

export interface EmployeeUpdate {
  name?: string;
  role?: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export const employeeApi = {
  getAll: () => api.get<Employee[]>('/employees'),
  getById: (id: number) => api.get<Employee>(`/employees/${id}`),
  create: (data: EmployeeCreate) => api.post<Employee>('/employees', data),
  update: (id: number, data: EmployeeUpdate) => api.put<Employee>(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

export interface Store {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreUpdate {
  name?: string;
  address?: string;
  phone?: string;
}

export interface NotificationSettings {
  id: number;
  low_stock: boolean;
  out_of_stock: boolean;
  order_reminder: boolean;
  daily_report: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettingsUpdate {
  low_stock?: boolean;
  out_of_stock?: boolean;
  order_reminder?: boolean;
  daily_report?: boolean;
}

export const storeApi = {
  get: () => api.get<Store>('/store'),
  update: (data: StoreUpdate) => api.put<Store>('/store', data),
  getNotifications: () => api.get<NotificationSettings>('/store/notifications'),
  updateNotifications: (data: NotificationSettingsUpdate) => 
    api.put<NotificationSettings>('/store/notifications', data),
};

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  price: number;
  status: 'sufficient' | 'low' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}

export interface MenuUploadResponse {
  success: boolean;
  message: string;
  items_created: number;
  items_updated: number;
  errors?: string[];
}

export const menuApi = {
  getAll: (search?: string, category?: string) => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    return api.get<MenuItem[]>('/menus', params);
  },
  uploadCsv: (file: File) => api.postFile<MenuUploadResponse>('/menus/upload', file),
};

