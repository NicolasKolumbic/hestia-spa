export interface AccessSummaryResponse {
    totalUsers: number;
    activeUsers: number;
    pendingInvitations: number;
    owners: number;
    operators: number;
    viewers: number;
}
