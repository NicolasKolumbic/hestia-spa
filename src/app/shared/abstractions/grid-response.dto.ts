export interface QueryResponse<T> {
    items: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    rowsByPage: number;
}

