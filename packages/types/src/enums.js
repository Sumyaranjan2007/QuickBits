"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_STATUS_TRANSITIONS = exports.RealtimeEvent = exports.PayoutStatus = exports.NotificationType = exports.DeliveryAssignmentStatus = exports.FoodType = exports.VehicleType = exports.CouponType = exports.ApprovalStatus = exports.DeliveryPartnerStatus = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = exports.UserRole = void 0;
// ─── User Roles ─────────────────────────────────────────
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["RESTAURANT_OWNER"] = "RESTAURANT_OWNER";
    UserRole["RESTAURANT_STAFF"] = "RESTAURANT_STAFF";
    UserRole["DELIVERY_PARTNER"] = "DELIVERY_PARTNER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
// ─── Order Status (strict lifecycle) ────────────────────
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["ACCEPTED"] = "ACCEPTED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY_FOR_PICKUP"] = "READY_FOR_PICKUP";
    OrderStatus["ASSIGNED"] = "ASSIGNED";
    OrderStatus["PICKED_UP"] = "PICKED_UP";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
// ─── Payment ────────────────────────────────────────────
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH_ON_DELIVERY"] = "CASH_ON_DELIVERY";
    PaymentMethod["RAZORPAY"] = "RAZORPAY";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
// ─── Delivery Partner ───────────────────────────────────
var DeliveryPartnerStatus;
(function (DeliveryPartnerStatus) {
    DeliveryPartnerStatus["ONLINE"] = "ONLINE";
    DeliveryPartnerStatus["OFFLINE"] = "OFFLINE";
})(DeliveryPartnerStatus || (exports.DeliveryPartnerStatus = DeliveryPartnerStatus = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
    ApprovalStatus["SUSPENDED"] = "SUSPENDED";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
// ─── Coupon ─────────────────────────────────────────────
var CouponType;
(function (CouponType) {
    CouponType["PERCENTAGE"] = "PERCENTAGE";
    CouponType["FIXED"] = "FIXED";
})(CouponType || (exports.CouponType = CouponType = {}));
// ─── Vehicle ────────────────────────────────────────────
var VehicleType;
(function (VehicleType) {
    VehicleType["BICYCLE"] = "BICYCLE";
    VehicleType["MOTORCYCLE"] = "MOTORCYCLE";
    VehicleType["CAR"] = "CAR";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
// ─── Food ───────────────────────────────────────────────
var FoodType;
(function (FoodType) {
    FoodType["VEG"] = "VEG";
    FoodType["NON_VEG"] = "NON_VEG";
    FoodType["VEGAN"] = "VEGAN";
})(FoodType || (exports.FoodType = FoodType = {}));
// ─── Delivery Assignment Status ─────────────────────────
var DeliveryAssignmentStatus;
(function (DeliveryAssignmentStatus) {
    DeliveryAssignmentStatus["PENDING"] = "PENDING";
    DeliveryAssignmentStatus["ACCEPTED"] = "ACCEPTED";
    DeliveryAssignmentStatus["PICKED_UP"] = "PICKED_UP";
    DeliveryAssignmentStatus["DELIVERED"] = "DELIVERED";
    DeliveryAssignmentStatus["CANCELLED"] = "CANCELLED";
})(DeliveryAssignmentStatus || (exports.DeliveryAssignmentStatus = DeliveryAssignmentStatus = {}));
// ─── Notification Type ──────────────────────────────────
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER_UPDATE"] = "ORDER_UPDATE";
    NotificationType["DELIVERY_UPDATE"] = "DELIVERY_UPDATE";
    NotificationType["PROMOTION"] = "PROMOTION";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["PAYMENT"] = "PAYMENT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// ─── Payout Status ──────────────────────────────────────
var PayoutStatus;
(function (PayoutStatus) {
    PayoutStatus["PENDING"] = "PENDING";
    PayoutStatus["PROCESSING"] = "PROCESSING";
    PayoutStatus["COMPLETED"] = "COMPLETED";
    PayoutStatus["FAILED"] = "FAILED";
})(PayoutStatus || (exports.PayoutStatus = PayoutStatus = {}));
// ─── Real-time Events ───────────────────────────────────
var RealtimeEvent;
(function (RealtimeEvent) {
    RealtimeEvent["ORDER_CREATED"] = "ORDER_CREATED";
    RealtimeEvent["ORDER_ACCEPTED"] = "ORDER_ACCEPTED";
    RealtimeEvent["ORDER_REJECTED"] = "ORDER_REJECTED";
    RealtimeEvent["ORDER_PREPARING"] = "ORDER_PREPARING";
    RealtimeEvent["ORDER_READY"] = "ORDER_READY";
    RealtimeEvent["DELIVERY_ASSIGNED"] = "DELIVERY_ASSIGNED";
    RealtimeEvent["DELIVERY_ACCEPTED"] = "DELIVERY_ACCEPTED";
    RealtimeEvent["ORDER_PICKED_UP"] = "ORDER_PICKED_UP";
    RealtimeEvent["ORDER_OUT_FOR_DELIVERY"] = "ORDER_OUT_FOR_DELIVERY";
    RealtimeEvent["ORDER_DELIVERED"] = "ORDER_DELIVERED";
    RealtimeEvent["ORDER_CANCELLED"] = "ORDER_CANCELLED";
    RealtimeEvent["DELIVERY_LOCATION_UPDATED"] = "DELIVERY_LOCATION_UPDATED";
})(RealtimeEvent || (exports.RealtimeEvent = RealtimeEvent = {}));
/**
 * Defines valid order status transitions.
 * Key = current status, Value = array of allowed next statuses.
 */
exports.ORDER_STATUS_TRANSITIONS = {
    [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
    [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
    [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
    [OrderStatus.ASSIGNED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
    [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
    [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
};
//# sourceMappingURL=enums.js.map