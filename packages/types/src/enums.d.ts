export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    RESTAURANT_OWNER = "RESTAURANT_OWNER",
    RESTAURANT_STAFF = "RESTAURANT_STAFF",
    DELIVERY_PARTNER = "DELIVERY_PARTNER",
    ADMIN = "ADMIN"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    PREPARING = "PREPARING",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",
    ASSIGNED = "ASSIGNED",
    PICKED_UP = "PICKED_UP",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentMethod {
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
    RAZORPAY = "RAZORPAY"
}
export declare enum DeliveryPartnerStatus {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE"
}
export declare enum ApprovalStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
}
export declare enum CouponType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED"
}
export declare enum VehicleType {
    BICYCLE = "BICYCLE",
    MOTORCYCLE = "MOTORCYCLE",
    CAR = "CAR"
}
export declare enum FoodType {
    VEG = "VEG",
    NON_VEG = "NON_VEG",
    VEGAN = "VEGAN"
}
export declare enum DeliveryAssignmentStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    PICKED_UP = "PICKED_UP",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare enum NotificationType {
    ORDER_UPDATE = "ORDER_UPDATE",
    DELIVERY_UPDATE = "DELIVERY_UPDATE",
    PROMOTION = "PROMOTION",
    SYSTEM = "SYSTEM",
    PAYMENT = "PAYMENT"
}
export declare enum PayoutStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum RealtimeEvent {
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_ACCEPTED = "ORDER_ACCEPTED",
    ORDER_REJECTED = "ORDER_REJECTED",
    ORDER_PREPARING = "ORDER_PREPARING",
    ORDER_READY = "ORDER_READY",
    DELIVERY_ASSIGNED = "DELIVERY_ASSIGNED",
    DELIVERY_ACCEPTED = "DELIVERY_ACCEPTED",
    ORDER_PICKED_UP = "ORDER_PICKED_UP",
    ORDER_OUT_FOR_DELIVERY = "ORDER_OUT_FOR_DELIVERY",
    ORDER_DELIVERED = "ORDER_DELIVERED",
    ORDER_CANCELLED = "ORDER_CANCELLED",
    DELIVERY_LOCATION_UPDATED = "DELIVERY_LOCATION_UPDATED"
}
/**
 * Defines valid order status transitions.
 * Key = current status, Value = array of allowed next statuses.
 */
export declare const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]>;
//# sourceMappingURL=enums.d.ts.map