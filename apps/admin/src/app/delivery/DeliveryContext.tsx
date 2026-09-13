'use client';
import React, { createContext, useContext } from 'react';

export interface DeliveryContextType {
  isOnline: boolean;
  toggleOnline: () => Promise<void>;
  profile: any;
  loadingStatus: boolean;
}

export const DeliveryContext = createContext<DeliveryContextType>({
  isOnline: true,
  toggleOnline: async () => {},
  profile: null,
  loadingStatus: false,
});

export const useDeliveryContext = () => useContext(DeliveryContext);
