import { AuthResponse } from '../types';

type AdminMenuItem = {
  path: string;
};

type HasPermission = (permission: string) => boolean;

export const getAdminHomePath = (user: AuthResponse | null): string => {
  if (user?.role === 'FRONT_DESK') {
    return '/admin/walk-in';
  }

  return '/admin/dashboard';
};

export const getVisibleAdminMenuItems = <T extends AdminMenuItem>(
  menuItems: T[],
  user: AuthResponse | null,
  hasPermission: HasPermission
): T[] => {
  if (user?.role === 'ADMIN') {
    return menuItems;
  }

  if (user?.role === 'FRONT_DESK') {
    // Paths a front-desk user may see, each gated by the permission it requires.
    const frontDeskAllowed: Record<string, string> = {
      '/admin/walk-in': 'WALK_IN_ORDER_VIEW',
      '/admin/inventory/transfers': 'PRODUCT_VIEW_STOCK_SUMMARY',
    };
    return menuItems.filter(
      (item) => item.path in frontDeskAllowed && hasPermission(frontDeskAllowed[item.path])
    );
  }

  return [];
};
