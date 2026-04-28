import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, Order, AppSettings, ToastMessage, OrderStatus, TabId } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Торт Медовик',
    price: 4500,
    imageUrl: 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
  },
  {
    id: 'p2',
    name: 'Аромасвечи',
    price: 1800,
    imageUrl: 'https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
  },
  {
    id: 'p3',
    name: 'Браслет ручной работы',
    price: 2200,
    imageUrl: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1',
    orderNumber: 'ЧК-0001',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    items: [
      { productId: 'p1', productName: 'Торт Медовик', price: 4500, quantity: 1 },
      { productId: 'p2', productName: 'Аромасвечи', price: 1800, quantity: 2 },
    ],
    total: 8100,
    status: 'paid',
  },
  {
    id: 'o2',
    orderNumber: 'ЧК-0002',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    items: [
      { productId: 'p3', productName: 'Браслет ручной работы', price: 2200, quantity: 1 },
    ],
    total: 2200,
    status: 'new',
  },
];

const INITIAL_SETTINGS: AppSettings = {
  shopName: 'Мастерская "Уют"',
  phone: '+7 (701) 234-56-78',
  taxId: '850101300234',
  autoReceipts: true,
};

interface AppContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  products: Product[];
  orders: Order[];
  settings: AppSettings;
  toast: ToastMessage | null;
  addProduct: (product: Omit<Product, 'id' | 'active'>) => void;
  editProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  toggleProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  showToast: (message: string, type?: ToastMessage['type']) => void;
  simulatePurchase: () => void;
  orderCounter: number;
}

const AppContext = createContext<AppContextValue | null>(null);

let counter = 3;

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>('inventory');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [orderCounter, setOrderCounter] = useState(2);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'active'>) => {
    const id = `p${Date.now()}`;
    setProducts(prev => [...prev, { ...product, id, active: true }]);
  }, []);

  const editProduct = useCallback((id: string, updates: Partial<Omit<Product, 'id'>>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleProduct = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const simulatePurchase = useCallback(() => {
    const activeProducts = products.filter(p => p.active);
    if (activeProducts.length === 0) {
      showToast('Нет активных товаров для симуляции', 'error');
      return;
    }

    const count = Math.floor(Math.random() * Math.min(3, activeProducts.length)) + 1;
    const shuffled = [...activeProducts].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const items = selected.map(p => ({
      productId: p.id,
      productName: p.name,
      price: p.price,
      quantity: Math.floor(Math.random() * 2) + 1,
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    counter += 1;
    const newNum = counter;
    setOrderCounter(newNum);

    const order: Order = {
      id: `o${Date.now()}`,
      orderNumber: `ЧК-${String(newNum).padStart(4, '0')}`,
      date: new Date(),
      items,
      total,
      status: 'new',
    };

    addOrder(order);
    showToast(`Новый заказ ${order.orderNumber} на ₸${total.toLocaleString('ru-RU')}!`);
  }, [products, addOrder, showToast]);

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      products, orders, settings, toast,
      addProduct, editProduct, deleteProduct, toggleProduct,
      addOrder, updateOrderStatus, updateSettings,
      showToast, simulatePurchase, orderCounter,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
