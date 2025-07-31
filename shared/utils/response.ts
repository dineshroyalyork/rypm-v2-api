// Common pagination utility
export function paginateArray<T>(
  items: T[],
  page_number: number = 1,
  page_size: number = 10
): {
  data: T[];
  total_count: number;
  page_number: number;
  page_size: number;
} {
  const total_count = items.length;
  const skip = (page_number - 1) * page_size;
  const data = items.slice(skip, skip + page_size);
  return {
    data,
    total_count,
    page_number,
    page_size,
  };
}

// Standardized response utilities
export function successResponse(message: string, data: any, statusCode: number = 200) {
  return {
    statusCode,
    success: true,
    message,
    data,
  };
}
