import api from './api';
import {
  CustomApiResponse,
  InventoryAdjustmentRequest,
  InventoryMovementResponse,
  InventoryReceiptRequest,
  InventorySummaryResponse,
} from '../types';

const INVENTORY_BASE_URL = '/admin/inventory';

const inventoryService = {
  /**
   * POST /api/v1/admin/inventory/receipts
   */
  receiveStock: async (request: InventoryReceiptRequest): Promise<CustomApiResponse<InventorySummaryResponse>> => {
    const response = await api.post<CustomApiResponse<InventorySummaryResponse>>(`${INVENTORY_BASE_URL}/receipts`, request);
    return response.data;
  },

  /**
   * POST /api/v1/admin/inventory/adjustments
   */
  adjustInventory: async (request: InventoryAdjustmentRequest): Promise<CustomApiResponse<InventorySummaryResponse>> => {
    const response = await api.post<CustomApiResponse<InventorySummaryResponse>>(`${INVENTORY_BASE_URL}/adjustments`, request);
    return response.data;
  },

  /**
   * GET /api/v1/admin/inventory/products/{productId}/summary
   */
  getInventorySummary: async (productId: number): Promise<CustomApiResponse<InventorySummaryResponse>> => {
    const response = await api.get<CustomApiResponse<InventorySummaryResponse>>(`${INVENTORY_BASE_URL}/products/${productId}/summary`);
    return response.data;
  },

  /**
   * GET /api/v1/admin/inventory/products/{productId}/history
   */
  getInventoryHistory: async (productId: number): Promise<CustomApiResponse<InventoryMovementResponse[]>> => {
    const response = await api.get<CustomApiResponse<InventoryMovementResponse[]>>(`${INVENTORY_BASE_URL}/products/${productId}/history`);
    return response.data;
  },
};

export default inventoryService;
