/** All primary keys in the DB are INT IDENTITY(1,1) — never use string IDs */
export type DbId = number;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
