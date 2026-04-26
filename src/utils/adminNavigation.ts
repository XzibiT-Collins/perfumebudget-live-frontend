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
    return menuItems.filter((item) => item.path === '/admin/walk-in' && hasPermission('WALK_IN_ORDER_VIEW'));
  }

  return [];
};
