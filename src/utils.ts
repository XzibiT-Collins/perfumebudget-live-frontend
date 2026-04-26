import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number | string) => {
  if (typeof price === 'string' && isNaN(Number(price))) {
    // If it's a string and not a simple number, it likely already has a currency prefix (e.g., "GHS 100.00")
    return price;
  }
  const numericPrice = typeof price === 'string' ? parsePrice(price) : price;
  return `GHS ${numericPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const parsePrice = (price: string | number | null | undefined): number => {
  if (price === null || price === undefined) return 0;
  if (typeof price === 'number') return price;
  // Remove everything except numbers, decimal point, and minus sign
  const cleaned = price.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const extractErrorMessage = (err: any, fallback: string = 'An error occurred'): string => {
  if (!err?.response?.data) return err?.message || fallback;
  
  const responseData = err.response.data;
  
  // Try to find the validation errors object. It might be under .errors or .data
  let errorsObj = responseData.errors;
  
  if (!errorsObj && responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
    errorsObj = responseData.data;
  }

  if (!errorsObj && typeof responseData === 'object' && !responseData.message && !responseData.description) {
    errorsObj = responseData;
  }

  if (errorsObj && typeof errorsObj === 'object') {
    const errorMessages: string[] = [];
    for (const [key, messages] of Object.entries(errorsObj)) {
      // Avoid printing out generic keys as field errors
      if (key === 'message' || key === 'description' || key === 'status') continue;
      
      if (Array.isArray(messages)) {
        errorMessages.push(`${messages.join(', ')}`);
      } else if (typeof messages === 'string') {
        errorMessages.push(`${messages}`);
      }
    }
    if (errorMessages.length > 0) {
      return errorMessages.join(' | ');
    }
  }

  return responseData.description || responseData.message || err.message || fallback;
};
