import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  ShoppingCart, 
  Ticket, 
  BarChart3, 
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Receipt,
  Calculator,
  BookOpen,
  Settings,
  Shield
} from 'lucide-react';
import { cn } from '../utils';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVisibleAdminMenuItems } from '../utils/adminNavigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: ShoppingCart, label: 'Walk-In Orders', path: '/admin/walk-in' },
  { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: Receipt, label: 'Taxes', path: '/admin/taxes' },
  { icon: Calculator, label: 'Accounting', path: '/admin/accounting' },
  { icon: BookOpen, label: 'Bookkeeping', path: '/admin/bookkeeping' },
  { icon: Shield, label: 'Front Desk', path: '/admin/front-desk' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredMenuItems = getVisibleAdminMenuItems(menuItems, user, hasPermission);

  return (
    <aside className={cn(
      "bg-white dark:bg-zinc-950 border-r border-[#E5E5E5] dark:border-zinc-800 h-[calc(100vh-64px)] sticky top-16 hidden lg:flex flex-col overflow-hidden transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 flex justify-end">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900 rounded-xl transition-colors"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        {!isCollapsed && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999999] mb-6 px-4">
            Management
          </p>
        )}
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-accent text-[#1A1A1A] font-bold shadow-sm' 
                    : 'text-[#666666] dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900 hover:text-[#1A1A1A] dark:hover:text-white',
                  isCollapsed ? "justify-center" : "justify-between"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn('h-4 w-4', isActive ? 'text-[#1A1A1A]' : 'text-[#999999]')} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && isActive && <ChevronRight className="h-3 w-3" />}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-[#F5F5F5] dark:border-zinc-800">
        <button 
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl w-full transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
