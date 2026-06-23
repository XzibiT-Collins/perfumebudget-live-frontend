import api from './api';
import {
  CustomApiResponse,
  PageResponse,
  StockByLocationResponse,
  StockTransferRequest,
  StockTransferResponse,
  StorageLocationDefaultsRequest,
  StorageLocationRequest,
  StorageLocationResponse,
} from '../types';

const BASE_URL = '/admin/inventory';

export interface TransferQuery {
  productId?: number;
  locationId?: number;
  page?: number;
  size?: number;
}

const locationInventoryService = {
  // ─── Storage locations (ADMIN) ───────────────────────────────────────────────

  /** GET /api/v1/admin/inventory/locations */
  getLocations: async (): Promise<StorageLocationResponse[]> => {
    const res = await api.get<CustomApiResponse<StorageLocationResponse[]>>(`${BASE_URL}/locations`);
    return res.data.data;
  },

  /** GET /api/v1/admin/inventory/locations/{id} */
  getLocation: async (id: number): Promise<StorageLocationResponse> => {
    const res = await api.get<CustomApiResponse<StorageLocationResponse>>(`${BASE_URL}/locations/${id}`);
    return res.data.data;
  },

  /** POST /api/v1/admin/inventory/locations */
  createLocation: async (request: StorageLocationRequest): Promise<StorageLocationResponse> => {
    const res = await api.post<CustomApiResponse<StorageLocationResponse>>(`${BASE_URL}/locations`, request);
    return res.data.data;
  },

  /** PUT /api/v1/admin/inventory/locations/{id} */
  updateLocation: async (id: number, request: StorageLocationRequest): Promise<StorageLocationResponse> => {
    const res = await api.put<CustomApiResponse<StorageLocationResponse>>(`${BASE_URL}/locations/${id}`, request);
    return res.data.data;
  },

  /** PATCH /api/v1/admin/inventory/locations/{id}/defaults — moves the supplied `true` roles to this location */
  setLocationDefaults: async (
    id: number,
    request: StorageLocationDefaultsRequest
  ): Promise<StorageLocationResponse> => {
    const res = await api.patch<CustomApiResponse<StorageLocationResponse>>(
      `${BASE_URL}/locations/${id}/defaults`,
      request
    );
    return res.data.data;
  },

  // ─── Stock transfers (ADMIN + FRONT_DESK) ────────────────────────────────────

  /** POST /api/v1/admin/inventory/transfers */
  createTransfer: async (request: StockTransferRequest): Promise<StockTransferResponse> => {
    const res = await api.post<CustomApiResponse<StockTransferResponse>>(`${BASE_URL}/transfers`, request);
    return res.data.data;
  },

  /** GET /api/v1/admin/inventory/transfers?productId=&locationId=&page=&size= */
  listTransfers: async (query: TransferQuery = {}): Promise<PageResponse<StockTransferResponse>> => {
    const { productId, locationId, page = 0, size = 20 } = query;
    const params: Record<string, number> = { page, size };
    if (productId !== undefined) params.productId = productId;
    if (locationId !== undefined) params.locationId = locationId;
    const res = await api.get<CustomApiResponse<PageResponse<StockTransferResponse>>>(`${BASE_URL}/transfers`, {
      params,
    });
    return res.data.data;
  },

  // ─── Stock by location (ADMIN + FRONT_DESK) ──────────────────────────────────

  /** GET /api/v1/admin/inventory/products/{productId}/stock-by-location */
  getStockByLocation: async (productId: number): Promise<StockByLocationResponse> => {
    const res = await api.get<CustomApiResponse<StockByLocationResponse>>(
      `${BASE_URL}/products/${productId}/stock-by-location`
    );
    return res.data.data;
  },
};

export default locationInventoryService;
