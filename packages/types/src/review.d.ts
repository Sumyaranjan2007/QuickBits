export interface IReview {
    id: string;
    orderId: string;
    customerId: string;
    restaurantId: string;
    deliveryPartnerId: string | null;
    restaurantRating: number;
    foodRating: number;
    deliveryRating: number | null;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreateReview {
    orderId: string;
    restaurantRating: number;
    foodRating: number;
    deliveryRating?: number;
    comment?: string;
}
//# sourceMappingURL=review.d.ts.map