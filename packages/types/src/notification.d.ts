import { NotificationType } from './enums';
export interface INotification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
    data: Record<string, unknown> | null;
    isRead: boolean;
    createdAt: Date;
}
export interface ICreateNotification {
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
    data?: Record<string, unknown>;
}
//# sourceMappingURL=notification.d.ts.map