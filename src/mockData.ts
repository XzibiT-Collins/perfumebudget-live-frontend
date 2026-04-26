interface MockCategory {
  id: string;
  name: string;
  productCount: number;
}

interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: MockCategory;
  imageUrl: string;
  isActive: boolean;
  sku: string;
  discountPrice?: number;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: '1', name: 'Botanical', productCount: 12 },
  { id: '2', name: 'Arboreal', productCount: 8 },
  { id: '3', name: 'Hesperidic', productCount: 24 },
  { id: '4', name: 'Amber', productCount: 15 },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    name: 'Rosa Damascena No. 1',
    description: 'A delicate blend of Bulgarian rose and white musk. Perfect for romantic evenings.',
    price: 89.00,
    stockQuantity: 45,
    category: MOCK_CATEGORIES[0],
    imageUrl: 'https://picsum.photos/seed/perfume1/800/1000',
    isActive: true,
    sku: 'PB-FL-001'
  },
  {
    id: '2',
    name: 'Nuit de Musc',
    description: 'Deep, mysterious notes of amber, patchouli, and dark musk.',
    price: 120.00,
    stockQuantity: 12,
    category: MOCK_CATEGORIES[1],
    imageUrl: 'https://picsum.photos/seed/perfume2/800/1000',
    isActive: true,
    discountPrice: 99.00,
    sku: 'PB-WD-001'
  },
  {
    id: '3',
    name: 'L\'Eau de Gingembre',
    description: 'An invigorating citrus burst with hints of ginger and green tea.',
    price: 65.00,
    stockQuantity: 20,
    category: MOCK_CATEGORIES[2],
    imageUrl: 'https://picsum.photos/seed/perfume3/800/1000',
    isActive: true,
    sku: 'PB-CT-001'
  },
  {
    id: '4',
    name: 'Safran Royal',
    description: 'Warm oriental spices blended with precious oud and saffron.',
    price: 150.00,
    stockQuantity: 3,
    category: MOCK_CATEGORIES[3],
    imageUrl: 'https://picsum.photos/seed/perfume4/800/1000',
    isActive: true,
    sku: 'PB-OR-001'
  },
  {
    id: '5',
    name: 'Champs de Lavande',
    description: 'Calming French lavender mixed with sweet vanilla and tonka bean.',
    price: 45.00,
    stockQuantity: 0,
    category: MOCK_CATEGORIES[0],
    imageUrl: 'https://picsum.photos/seed/perfume5/800/1000',
    isActive: true,
    sku: 'PB-FL-002'
  },
  {
    id: '6',
    name: 'Santal Sacré',
    description: 'Smooth Australian sandalwood with creamy coconut and cardamom.',
    price: 110.00,
    stockQuantity: 50,
    category: MOCK_CATEGORIES[1],
    imageUrl: 'https://picsum.photos/seed/perfume6/800/1000',
    isActive: true,
    sku: 'PB-WD-002'
  }
];
