// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  FRONT_DESK = 'FRONT_DESK',
}

export enum FrontDeskPermission {
  WALK_IN_ORDER_CREATE = 'WALK_IN_ORDER_CREATE',
  WALK_IN_ORDER_VIEW = 'WALK_IN_ORDER_VIEW',
  WALK_IN_ORDER_MARK_RECEIPT_PRINTED = 'WALK_IN_ORDER_MARK_RECEIPT_PRINTED',
  CUSTOMER_SEARCH = 'CUSTOMER_SEARCH',
  PRODUCT_VIEW_ADMIN_CATALOG = 'PRODUCT_VIEW_ADMIN_CATALOG',
  PRODUCT_VIEW_STOCK_SUMMARY = 'PRODUCT_VIEW_STOCK_SUMMARY',
}

export enum AddressLabel {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  WORK = 'WORK',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  INITIATED = 'INITIATED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  PACKING = 'PACKING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  GHS = 'GHS',
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Matches backend AuthResponse */
export interface AuthResponse {
  id: number;
  email: string;
  fullName: string;
  profilePicture: string | null;
  role: UserRole;
  permissions: FrontDeskPermission[];
}

/** POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Response for POST /api/v1/auth/login */
export interface LoginResponse {
  requiresOtp: boolean;
  challengeToken?: string;
  email?: string;
  auth?: AuthResponse;
}

/** POST /api/v1/auth/verify-login-otp */
export interface LoginOtpVerificationRequest {
  challengeToken: string;
  otp: string;
}

/** POST /api/v1/auth/resend-login-otp */
export interface LoginOtpResendRequest {
  challengeToken: string;
}

/** POST /api/v1/auth/register */
export interface RegistrationRequest {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

/** POST /api/v1/auth/verify-otp */
export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

/** POST /api/v1/auth/forgot-password, POST /api/v1/auth/resend-otp */
export interface EmailRequest {
  email: string;
}

/** POST /api/v1/auth/reset-password */
export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

/** Matches backend CategoryResponse */
export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description: string;
  slug: string;
}

/** POST/PUT category */
export interface CategoryRequest {
  categoryName: string;
  description: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

/** Backwards-compatibility alias for ProductListing */
export type Product = ProductListing;

/** Matches backend ProductListing (used in paginated listing) */
export interface ProductListing {
  productId: number;
  productName: string;
  productShortDescription: string;
  productImageUrl: string;
  categoryName: string;
  price: string;
  stockQuantity: number;
  isOutOfStock: boolean;
  isActive: boolean;
  isEnlisted: boolean;
  slug: string;
}

/** Matches backend ProductDetailsPageResponse (public detail page) */
export interface ProductDetailsPageResponse {
  productId: number;
  productName: string;
  productShortDescription: string;
  productDescription: string;
  productImageUrl: string;
  category: string;
  sellingPrice: string;
  isOutOfStock: boolean;
  isFeatured: boolean;
  slug: string;
}

/** Matches backend ProductDetails (admin detail) */
export interface ProductDetails {
  productId: number;
  productName: string;
  productShortDescription: string;
  productDescription: string;
  productImageUrl: string;
  category: CategoryResponse;
  sellingPrice: string;
  costPrice: string;
  stockKeepingUnit: string;
  isOutOfStock: boolean;
  soldCount: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isEnlisted: boolean;
  isFeatured: boolean;
  slug: string;
  familyCode?: string;
  uomCode?: string;
  conversionFactor?: number;
}

export interface ProductFamilyResponse {
  id: number;
  familyCode: string;
  name: string;
  brand: string;
  baseUnitProductId: number;
  baseUnitSku: string;
}

export interface UnitOfMeasureResponse {
  id: number;
  code: string;
  name: string;
}

export interface AvailableUomsResponse {
  familyCode?: string;
  baseUnitCost?: string;
  availableUoms: UnitOfMeasureResponse[];
  takenUoms: string[];
}

export interface StockConversionRequest {
  sourceProductId: number;
  quantity: number;
  targetProductId?: number;
  notes?: string;
}

export interface ConversionResponse {
  id: number;
  conversionNumber: string;
  direction: 'FORWARD' | 'REVERSE';
  fromProductId: number;
  fromProductName: string;
  fromQuantity: number;
  toProductId: number;
  toProductName: string;
  toQuantity: number;
  fromCostValue: number;
  toCostValue: number;
  varianceAmount: number;
  convertedBy: string;
  notes?: string;
  convertedAt: string;
}

export interface ProductVariantSummaryResponse {
  variantId: number;
  variantSku: string;
  variantName: string;
}

export interface InventoryReceiptRequest {
  productId: number;
  quantity: number;
  unitCost: number;
  unitSellingPrice: number;
  receivedAt?: string;
  reference: string;
  note?: string;
}

export interface InventoryAdjustmentRequest {
  productId: number;
  direction: 'INCREASE' | 'DECREASE';
  quantity: number;
  reason: string;
  reference?: string;
  note?: string;
  unitCost?: number;
  unitSellingPrice?: number;
}

export interface InventoryLayerResponse {
  layerId: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitCost: string;
  unitSellingPrice: string;
  sourceType: string;
  sourceReference: string;
  receivedAt: string;
}

export interface InventorySummaryResponse {
  productId: number;
  productName: string;
  stockQuantity: number;
  activeCostPrice: string;
  activeSellingPrice: string;
  layers: InventoryLayerResponse[];
}

export interface InventoryMovementResponse {
  movementId: number;
  movementType: string;
  quantity: number;
  unitCost: string;
  unitSellingPrice: string;
  referenceType: string;
  referenceId: string;
  note: string;
  createdAt: string;
}

export interface ProductRequest {
  productName: string;
  brand: string;
  size?: string;
  productDescription: string;
  shortDescription: string;
  currency: Currency;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  categoryId: number;
  familyId?: number;
  uomCode?: string;
  conversionFactor?: number;
  isNewProduct?: boolean;
  isActive?: boolean;
  isEnlisted?: boolean;
  isFeatured?: boolean;
  productImage?: File;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  isFirst: boolean;
  isLast: boolean;
  isEmpty: boolean;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItemResponse {
  cartItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: string;
  quantity: number;
}

export interface CartResponse {
  cartItems: CartItemResponse[];
  totalPrice: string;
}

/** POST /api/v1/cart/items/add-item */
export interface CartItemRequest {
  productId: number;
  quantity: number;
}

/** PUT /api/v1/cart/items/update/{cartItemId} */
export interface CartItemUpdateRequest {
  quantity: number;
}

/** POST /api/v1/cart/populate */
export interface PopulateCartItemRequest {
  cartItems: CartItemRequest[];
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  subtotal: string;
  discountAmount: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  lineItems: OrderItemResponse[];
  orderDate: string;
  deliveryDetail?: DeliveryDetailResponse;
  /** Tax breakdown returned by the order detail endpoint */
  taxes?: TaxCalculationResult;
}

export interface OrderListResponse {
  orderId: number;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  totalAmount: string;
  orderDate: string;
}

/** PUT /api/v1/order/update-order-status/{orderNumber} */
export interface OrderStatusUpdateRequest {
  orderStatus: DeliveryStatus;
}

// ─── Delivery Details ─────────────────────────────────────────────────────────

/** POST/PUT delivery detail */
export interface DeliveryDetailRequest {
  recipientName: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  landmark: string;
  label?: AddressLabel;
  isDefault?: boolean;
}

export interface DeliveryDetailResponse {
  id: number;
  recipientName: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  landmark: string;
  label: AddressLabel;
  isDefault: boolean;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export interface CouponRequest {
  couponCode?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maximumDiscountAmount: number;
  minimumCartAmountForDiscount: number;
  usageLimit: number;
  isActive: boolean;
  startDate: string;      // ISO date e.g. "2026-01-01"
  expirationDate: string; // ISO date e.g. "2026-12-31"
}

export interface CouponDetailResponse {
  couponId: number;
  couponCode: string;
  isActive: boolean;
  discountType: CouponDiscountType;
  usageLimit: number;
  usageCount: number;
  discountValue: number;
  maximumDiscountAmount: number;
  minimumCartAmountForDiscount: number;
  startDate: string;
  expirationDate: string;
}

export interface CouponListResponse {
  couponId: number;
  couponCode: string;
  isActive: boolean;
  discountType: CouponDiscountType;
  usageLimit: number;
  usageCount: number;
  expirationDate: string;
}

// ─── Paystack ─────────────────────────────────────────────────────────────────

export interface PaystackTransactionData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackInitiateTransactionResponse {
  status: boolean;
  message: string;
  data: PaystackTransactionData;
}

// ─── Tax ──────────────────────────────────────────────────────────────────────

/** Single tax line returned by GET /api/v1/tax */
export interface TaxOrderItem {
  id: number;
  taxName: string;
  taxRate: number;
  taxAmount: number;
}

/** Matches backend TaxCalculationResult */
export interface TaxCalculationResult {
  orderTaxes: TaxOrderItem[];
  /** Pre-formatted string, e.g. "GHS 5.00" */
  totalTaxAmount: string;
  /** Pre-formatted string, e.g. "GHS 105.00" */
  totalAmountAfterTax: string;
  /** Discount applied to the order */
  discount: number;
}

/** Matches backend TaxResponse — returned by admin CRUD endpoints */
export interface TaxResponse {
  id: number;
  name: string;
  code: string;
  rate: number;
  isActive: boolean;
  isCompound: boolean;
  applyOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/v1/tax/add-tax  |  PUT /api/v1/tax/update/{taxId} */
export interface TaxRequest {
  name: string;
  code: string;
  rate: number;
  isActive?: boolean;
  isCompound?: boolean;
  applyOrder: number;
}

// ─── Admin Metrics ──────────────────────────────────────────────────────────

export interface CustomerDataResponse {
  id: number;
  fullName: string;
  email: string;
  orderCount: number;
  totalSpent: string;
  isActive: boolean;
  dateJoined: string;
}

export interface MostPurchaseProductResponse {
  productId: number;
  productName: string;
  viewCount: number;
  addToCartCount: number;
  soldCount: number;
  conversionRate: number;
}

export interface CouponMetricResponse {
  totalCreated: number;
  totalUsage: number;
  totalDiscountGiven: string;
  totalRevenueGenerated: string;
  coupons: CouponListResponse[];
}

export interface PageVisitMetric {
  page: string;
  uniqueVisits: number;
}

export interface SiteVisitMetric {
  totalVisits: number;
  totalUniqueVisitors: number;
  totalPageViews: number;
  uniqueVisitToOrderConversionRate: number;
  top5MostVisitedPages: PageVisitMetric[];
}

export interface DailyRevenueMetric {
  date: string;
  revenue: number;
}

export interface OrderCountMetric {
  totalOrders: number;
  totalDeliveredOrders: number;
  totalPendingOrders: number;
  totalCancelledOrders: number;
}

export interface TopCompositionMetric {
  productId: number;
  productName: string;
  productImage: string;
  totalSold: number;
  totalRevenue: number;
}

export interface DashboardMetrics {
  totalRevenue: string;
  orderCountMetric: OrderCountMetric;
  totalCustomers: number;
  totalProducts: number;
  totalSiteVisits: number;
  dailyRevenueMetric: DailyRevenueMetric[];
  top5Compositions: TopCompositionMetric[];
}

export interface TopCustomer {
  fullName: string;
  email: string;
  totalOrders: number;
  totalAmountSpent: number;
}

export interface LowStockProduct {
  id: number;
  stockQuantity: number;
  productName: string;
  productImage: string;
}

// ─── Generic API Wrapper ──────────────────────────────────────────────────────

export interface CustomApiResponse<T> {
  description: string;
  data: T;
}

// ─── Legacy (kept for components not yet migrated) ────────────────────────────

/** @deprecated Use AuthResponse instead */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** @deprecated Use DeliveryDetailResponse instead */
export interface Address {
  id: string;
  label: AddressLabel;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  addressLine: string;
  isActive?: boolean;
}

// ─── Walk-In Orders ──────────────────────────────────────────────────────────

export enum WalkInPaymentMethod {
  CASH = 'CASH',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CARD = 'CARD',
  SPLIT = 'SPLIT',
}

export enum WalkInOrderStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum WalkInDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export interface WalkInCustomerRequest {
  name?: string;
  phone?: string;
  email?: string;
}

export interface WalkInOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface WalkInOrderRequest {
  registeredUserId?: number;
  walkInCustomer?: WalkInCustomerRequest;
  items: WalkInOrderItemRequest[];
  discountType?: WalkInDiscountType;
  discountValue?: number;
  paymentMethod: WalkInPaymentMethod;
  amountPaid: number;
  splitCashAmount?: number;
  splitMobileAmount?: number;
}

export interface WalkInOrderItemResponse {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface WalkInOrderResponse {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  processedBy: string;
  paymentMethod: WalkInPaymentMethod;
  status: WalkInOrderStatus;
  subtotal: string;
  discountAmount: string;
  totalTaxAmount: string;
  totalAmount: string;
  amountPaid: string;
  changeGiven: string;
  receiptPrinted: boolean;
  createdAt: string;
  items: WalkInOrderItemResponse[];
}

export interface CustomerSearchResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
}

// ─── Accounting & Bookkeeping ──────────────────────────────────────────────────

export enum EntryType {
  SALE = 'SALE',
  REFUND = 'REFUND',
  DISCOUNT = 'DISCOUNT',
  TAX_COLLECTION = 'TAX_COLLECTION',
  INVENTORY = 'INVENTORY',
  INVENTORY_PURCHASE = 'INVENTORY_PURCHASE',
  INVENTORY_ADJUSTMENT = 'INVENTORY_ADJUSTMENT',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum AccountCategory {
  CASH = 'CASH',
  COGS = 'COGS',
  INVENTORY = 'INVENTORY',
  SALES_REVENUE = 'SALES_REVENUE',
  DISCOUNT_EXPENSE = 'DISCOUNT_EXPENSE',
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  INVENTORY_ADJUSTMENT = 'INVENTORY_ADJUSTMENT',
  TAX_PAYABLE = 'TAX_PAYABLE',
  REFUND_PAYABLE = 'REFUND_PAYABLE',
  COUPON_EXPENSE = 'COUPON_EXPENSE',
  MARKETING_EXPENSE = 'MARKETING_EXPENSE',
  LOGISTICS_EXPENSE = 'LOGISTICS_EXPENSE',
  MISCELLANEOUS_EXPENSE = 'MISCELLANEOUS_EXPENSE',
  OWNERS_EQUITY = 'OWNERS_EQUITY',
  OWNERS_CAPITAL = 'OWNERS_CAPITAL',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  LOANS_PAYABLE = 'LOANS_PAYABLE',
  INVESTMENT_INCOME = 'INVESTMENT_INCOME',
  GENERAL_EXPENSE = 'GENERAL_EXPENSE'
}

export enum JournalEntryLineType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export interface JournalEntryLineRequest {
  accountCategory: AccountCategory;
  entryType: JournalEntryLineType;
  amount: number;
  description?: string;
}

export interface ManualJournalEntryRequest {
  description: string;
  type: EntryType;
  lines: JournalEntryLineRequest[];
}

export interface JournalEntryLineResponse {
  accountCode?: string;
  accountName?: string;
  entryType?: JournalEntryLineType;
  amount?: number;
  description?: string;
}

export interface JournalEntryResponse {
  entryNumber?: string;
  description?: string;
  type?: EntryType;
  referenceType?: string;
  referenceId?: string;
  isManual?: boolean;
  recordedBy?: string;
  transactionDate?: string;
  lines?: JournalEntryLineResponse[];
}

export interface LedgerSummaryResponse {
  totalRevenue?: number;
  totalExpenses?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  netProfit?: number;
  cashBalance?: number;
}

export interface AccountBalanceResponse {
  accountCode?: string;
  accountName?: string;
  accountType?: AccountType;
  accountCategory?: AccountCategory;
  balance?: number;
}

export interface IncomeStatementResponse {
  totalRevenue?: number;
  totalCOGS?: number;
  grossProfit?: number;
  totalExpenses?: number;
  netProfit?: number;
  revenueAccounts?: AccountBalanceResponse[];
  expenseAccounts?: AccountBalanceResponse[];
}

export interface DailyCashFlow {
  date?: string;
  inflow?: number;
  outflow?: number;
  net?: number;
}

export interface CashFlowResponse {
  totalInflows?: number;
  totalOutflows?: number;
  netCashFlow?: number;
  dailyCashFlows?: DailyCashFlow[];
}

export interface BalanceSheetResponse {
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  assetAccounts?: AccountBalanceResponse[];
  liabilityAccounts?: AccountBalanceResponse[];
  equityAccounts?: AccountBalanceResponse[];
}

export interface EnumResponse {
  value: string;
  label: string;
}

export interface AccountingMetadataResponse {
  accountCategories: EnumResponse[];
  journalEntryTypes: EnumResponse[];
}

export interface CustomerFullDetailsResponse {
  id: number;
  fullName: string;
  email: string;
  dateJoined: string;
  isActive: boolean;
  addresses: DeliveryDetailResponse[];
  totalSpent: string;
  orderCount: number;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export interface NotificationResponse {
  recipientId: number;
  notificationId: number;
  type: string;
  title: string;
  message: string;
  referenceType: string;
  referenceId: string;
  read: boolean;
  readAt: string | null;
  deliveredAt: string;
  createdAt: string;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}

// ─── Feature Flags ──────────────────────────────────────────────────────────

export interface FeatureFlagResponse {
  featureKey: string;
  description: string;
  adminEnabled: boolean;
  frontDeskEnabled: boolean;
  customerEnabled: boolean;
}

export interface FeatureFlagUpdateRequest {
  adminEnabled: boolean;
  frontDeskEnabled: boolean;
  customerEnabled: boolean;
}

// ─── Front Desk Management ────────────────────────────────────────────────────

export interface FrontDeskPermissionTemplateResponse {
  permissions: FrontDeskPermission[];
}

export interface FrontDeskPermissionTemplateUpdateRequest {
  permissions: FrontDeskPermission[];
}

export interface FrontDeskUserSummaryResponse {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  role: UserRole;
}

export interface CreateFrontDeskUserRequest {
  fullName: string;
  email: string;
  password: string;
  isActive: boolean;
}

export interface UpdateFrontDeskUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface FrontDeskUserPermissionsResponse {
  userId: number;
  templatePermissions: FrontDeskPermission[];
  allowedOverrides: FrontDeskPermission[];
  deniedOverrides: FrontDeskPermission[];
  effectivePermissions: FrontDeskPermission[];
}

export interface FrontDeskUserPermissionOverrideUpdateRequest {
  allowedPermissions: FrontDeskPermission[];
  deniedPermissions: FrontDeskPermission[];
}

export interface MiniStatResponse {
  label: string;
  value: string;
  trend: string;
  isUp?: boolean;
}

export interface OrderStatusSliceResponse {
  name: string;
  value: number;
}

export interface ProfitDataPointResponse {
  name: string;
  grossProfit: number;
  netProfit: number;
}

export interface RevenueDataPointResponse {
  name: string;
  revenue: number;
}

export interface SalesAnalyticsResponse {
  revenueBreakdown: RevenueDataPointResponse[];
  profitBreakdown: ProfitDataPointResponse[];
  miniStats: MiniStatResponse[];
  orderStatus: OrderStatusSliceResponse[];
}
