export interface GridResponse<T> {
    items: T[];
    total: number;
    currenPage: number;
    hasNext: boolean;
}
