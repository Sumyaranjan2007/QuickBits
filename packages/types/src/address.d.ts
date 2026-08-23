export interface IAddress {
    id: string;
    userId: string;
    label: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreateAddress {
    label: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
}
export interface IUpdateAddress {
    label?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
}
//# sourceMappingURL=address.d.ts.map