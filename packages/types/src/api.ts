/**
 * Standard API response wrapper.
 * All API endpoints return this format for consistency.
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface IApiError {
  success: false;
  data: null;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message: string;
}
