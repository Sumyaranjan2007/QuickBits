import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, ApprovalStatus, FoodType, VehicleType, DeliveryPartnerStatus, CouponType } from '@quickbite/types';

import { UserEntity } from './entities/user.entity';
import { ProfileEntity } from './entities/profile.entity';
import { CustomerEntity } from './entities/customer.entity';
import { RestaurantEntity } from './entities/restaurant.entity';
import { RestaurantStaffEntity } from './entities/restaurant-staff.entity';
import { MenuCategoryEntity } from './entities/menu-category.entity';
import { MenuItemEntity } from './entities/menu-item.entity';
import { MenuItemAddonEntity } from './entities/menu-item-addon.entity';
import { AddressEntity } from './entities/address.entity';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderStatusHistoryEntity } from './entities/order-status-history.entity';
import { DeliveryPartnerEntity } from './entities/delivery-partner.entity';
import { DeliveryAssignmentEntity } from './entities/delivery-assignment.entity';
import { DeliveryLocationEntity } from './entities/delivery-location.entity';
import { PaymentEntity } from './entities/payment.entity';
import { RefundEntity } from './entities/refund.entity';
import { CouponEntity } from './entities/coupon.entity';
import { CouponUsageEntity } from './entities/coupon-usage.entity';
import { ReviewEntity } from './entities/review.entity';
import { NotificationEntity } from './entities/notification.entity';
import { RestaurantPayoutEntity } from './entities/restaurant-payout.entity';
import { DeliveryPayoutEntity } from './entities/delivery-payout.entity';

const entities = [
  UserEntity, ProfileEntity, CustomerEntity, RestaurantEntity,
  RestaurantStaffEntity, MenuCategoryEntity, MenuItemEntity,
  MenuItemAddonEntity, AddressEntity, CartEntity, CartItemEntity,
  OrderEntity, OrderItemEntity, OrderStatusHistoryEntity,
  DeliveryPartnerEntity, DeliveryAssignmentEntity, DeliveryLocationEntity,
  PaymentEntity, RefundEntity, CouponEntity, CouponUsageEntity,
  ReviewEntity, NotificationEntity, RestaurantPayoutEntity, DeliveryPayoutEntity,
];

export async function seedDatabase(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(UserEntity);
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@quickbite.com' } });
  if (existingAdmin) {
    console.log('Database already seeded.');
    return;
  }

  console.log('🌱 Seeding QuickBite database with demo data...');

  const profileRepo = dataSource.getRepository(ProfileEntity);
  const customerRepo = dataSource.getRepository(CustomerEntity);
  const restaurantRepo = dataSource.getRepository(RestaurantEntity);
  const categoryRepo = dataSource.getRepository(MenuCategoryEntity);
  const itemRepo = dataSource.getRepository(MenuItemEntity);
  const addonRepo = dataSource.getRepository(MenuItemAddonEntity);
  const addressRepo = dataSource.getRepository(AddressEntity);
  const partnerRepo = dataSource.getRepository(DeliveryPartnerEntity);
  const couponRepo = dataSource.getRepository(CouponEntity);

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Admin User
  const admin = await userRepo.save(userRepo.create({
    email: 'admin@quickbite.com',
    phone: '+919999999991',
    passwordHash,
    role: UserRole.ADMIN,
    isActive: true,
    isVerified: true,
  }));
  await profileRepo.save(profileRepo.create({
    userId: admin.id,
    firstName: 'Platform',
    lastName: 'Admin',
  }));

  // 2. Customer User
  const customerUser = await userRepo.save(userRepo.create({
    email: 'customer@quickbite.com',
    phone: '+919999999992',
    passwordHash,
    role: UserRole.CUSTOMER,
    isActive: true,
    isVerified: true,
  }));
  await profileRepo.save(profileRepo.create({
    userId: customerUser.id,
    firstName: 'Rahul',
    lastName: 'Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  }));
  const customer = await customerRepo.save(customerRepo.create({
    userId: customerUser.id,
  }));
  await addressRepo.save(addressRepo.create({
    userId: customerUser.id,
    label: 'Home',
    addressLine1: '402, Skyline Residency, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    latitude: 12.9716,
    longitude: 77.5946,
    isDefault: true,
  }));

  // 3. Restaurant Owner User
  const ownerUser = await userRepo.save(userRepo.create({
    email: 'owner@quickbite.com',
    phone: '+919999999993',
    passwordHash,
    role: UserRole.RESTAURANT_OWNER,
    isActive: true,
    isVerified: true,
  }));
  await profileRepo.save(profileRepo.create({
    userId: ownerUser.id,
    firstName: 'Vikram',
    lastName: 'Singhania',
  }));

  // 4. Delivery Partner User
  const driverUser = await userRepo.save(userRepo.create({
    email: 'driver@quickbite.com',
    phone: '+919999999994',
    passwordHash,
    role: UserRole.DELIVERY_PARTNER,
    isActive: true,
    isVerified: true,
  }));
  await profileRepo.save(profileRepo.create({
    userId: driverUser.id,
    firstName: 'Amit',
    lastName: 'Verma',
  }));
  await partnerRepo.save(partnerRepo.create({
    userId: driverUser.id,
    vehicleType: VehicleType.MOTORCYCLE,
    vehicleNumber: 'KA-01-EQ-9876',
    licenseNumber: 'DL-987654321098',
    isOnline: true,
    approvalStatus: ApprovalStatus.APPROVED,
    rating: 4.85,
    totalDeliveries: 142,
  }));

  // 5. Restaurants
  const r1: any = await restaurantRepo.save(restaurantRepo.create({
    ownerId: ownerUser.id,
    name: 'Burger & Co.',
    description: 'Artisanal gourmet smash burgers, loaded fries, and thick shakes.',
    logoUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300',
    coverImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000',
    address: '100 Feet Road, Indiranagar, Bengaluru',
    phone: '+918012345678',
    latitude: 12.9784,
    longitude: 77.6408,
    openingHours: '11:00',
    closingHours: '23:30',
    cuisineType: 'Burgers, American, Fast Food',
    minOrderAmount: 150,
    deliveryFee: 35,
    avgDeliveryTime: 25,
    rating: 4.6,
    totalRatings: 380,
    approvalStatus: ApprovalStatus.APPROVED,
    isActive: true,
    commissionRate: 20,
  } as any));

  const cat1 = await categoryRepo.save(categoryRepo.create({
    restaurantId: r1.id,
    name: 'Burgers',
    description: 'Handcrafted patties grilled to perfection',
    sortOrder: 1,
    isActive: true,
  }));
  const cat2 = await categoryRepo.save(categoryRepo.create({
    restaurantId: r1.id,
    name: 'Sides & Shakes',
    description: 'Crispy fries and creamy milkshakes',
    sortOrder: 2,
    isActive: true,
  }));

  const item1 = await itemRepo.save(itemRepo.create({
    restaurantId: r1.id,
    categoryId: cat1.id,
    name: 'Classic Smash Cheeseburger',
    description: 'Double tender smashed patty, cheddar cheese, secret sauce, pickles on brioche bun.',
    price: 289,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    foodType: FoodType.NON_VEG,
    isAvailable: true,
    sortOrder: 1,
  }));
  await addonRepo.save([
    addonRepo.create({ menuItemId: item1.id, name: 'Extra Cheddar Cheese', price: 40, isAvailable: true }),
    addonRepo.create({ menuItemId: item1.id, name: 'Crispy Bacon Strips', price: 60, isAvailable: true }),
  ]);

  const item2 = await itemRepo.save(itemRepo.create({
    restaurantId: r1.id,
    categoryId: cat1.id,
    name: 'Crispy Paneer Truffle Burger',
    description: 'Crispy spiced paneer patty, truffle mayo, caramelized onions and lettuce.',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500',
    foodType: FoodType.VEG,
    isAvailable: true,
    sortOrder: 2,
  }));

  const item3 = await itemRepo.save(itemRepo.create({
    restaurantId: r1.id,
    categoryId: cat2.id,
    name: 'Peri Peri Loaded Fries',
    description: 'Crispy golden fries tossed in hot peri-peri seasoning with cheese dip.',
    price: 159,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
    foodType: FoodType.VEG,
    isAvailable: true,
    sortOrder: 1,
  }));

  const r2: any = await restaurantRepo.save(restaurantRepo.create({
    ownerId: ownerUser.id,
    name: 'Spice Symphony',
    description: 'Authentic royal North Indian cuisine, fragrant Dum Biryanis and rich curries.',
    logoUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300',
    coverImageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1000',
    address: 'Koramangala 5th Block, Bengaluru',
    phone: '+918023456789',
    latitude: 12.9352,
    longitude: 77.6245,
    openingHours: '12:00',
    closingHours: '23:00',
    cuisineType: 'North Indian, Biryani, Mughlai',
    minOrderAmount: 200,
    deliveryFee: 40,
    avgDeliveryTime: 35,
    rating: 4.8,
    totalRatings: 520,
    approvalStatus: ApprovalStatus.APPROVED,
    isActive: true,
    commissionRate: 20,
  } as any));

  const cat3 = await categoryRepo.save(categoryRepo.create({
    restaurantId: r2.id,
    name: 'Dum Biryani',
    description: 'Slow-cooked aromatic basmati rice with traditional spices',
    sortOrder: 1,
    isActive: true,
  }));

  await itemRepo.save([
    itemRepo.create({
      restaurantId: r2.id,
      categoryId: cat3.id,
      name: 'Hyderabadi Chicken Dum Biryani',
      description: 'Layered spiced basmati rice and marinated chicken slow cooked on dum. Served with Mirchi Ka Salan and Raita.',
      price: 349,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
      foodType: FoodType.NON_VEG,
      isAvailable: true,
      sortOrder: 1,
    }),
    itemRepo.create({
      restaurantId: r2.id,
      categoryId: cat3.id,
      name: 'Paneer Tikka Biryani',
      description: 'Chargrilled cottage cheese layered with saffron scented rice and mint masala.',
      price: 299,
      imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=500',
      foodType: FoodType.VEG,
      isAvailable: true,
      sortOrder: 2,
    }),
  ]);

  const r3: any = await restaurantRepo.save(restaurantRepo.create({
    ownerId: ownerUser.id,
    name: 'Pizzeria Bella',
    description: 'Neapolitan woodfired sourdough pizzas and handmade pastas.',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
    coverImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000',
    address: 'Lavelle Road, Bengaluru',
    phone: '+918034567890',
    latitude: 12.9719,
    longitude: 77.5937,
    openingHours: '12:00',
    closingHours: '23:00',
    cuisineType: 'Italian, Pizza, Pasta',
    minOrderAmount: 250,
    deliveryFee: 45,
    avgDeliveryTime: 30,
    rating: 4.7,
    totalRatings: 410,
    approvalStatus: ApprovalStatus.APPROVED,
    isActive: true,
    commissionRate: 20,
  } as any));

  const cat4 = await categoryRepo.save(categoryRepo.create({
    restaurantId: r3.id,
    name: 'Woodfired Pizzas',
    description: '11-inch hand-stretched fermented crust',
    sortOrder: 1,
    isActive: true,
  }));

  await itemRepo.save([
    itemRepo.create({
      restaurantId: r3.id,
      categoryId: cat4.id,
      name: 'Margherita Burrata Pizza',
      description: 'San Marzano tomato sauce, fresh buffalo mozzarella, creamy burrata ball, basil, extra virgin olive oil.',
      price: 449,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
      foodType: FoodType.VEG,
      isAvailable: true,
      sortOrder: 1,
    }),
    itemRepo.create({
      restaurantId: r3.id,
      categoryId: cat4.id,
      name: 'Spicy Pepperoni & Hot Honey',
      description: 'Imported pepperoni, fresh mozzarella, jalapeños, drizzled with artisanal chili hot honey.',
      price: 529,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
      foodType: FoodType.NON_VEG,
      isAvailable: true,
      sortOrder: 2,
    }),
  ]);

  // 6. Discount Coupons
  await couponRepo.save([
    couponRepo.create({
      code: 'WELCOME50',
      type: CouponType.PERCENTAGE,
      value: 50,
      maxDiscount: 100,
      minOrderAmount: 199,
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
      createdBy: admin.id,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2028-12-31'),
    }),
    couponRepo.create({
      code: 'FLAT100',
      type: CouponType.FIXED,
      value: 100,
      minOrderAmount: 399,
      usageLimit: 500,
      perUserLimit: 3,
      isActive: true,
      createdBy: admin.id,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2028-12-31'),
    }),
  ]);

  console.log('✅ QuickBite database seeded successfully!');
  console.log('   👤 Admin: admin@quickbite.com / Password@123');
  console.log('   👤 Customer: customer@quickbite.com / Password@123');
  console.log('   👤 Restaurant: owner@quickbite.com / Password@123');
  console.log('   👤 Delivery: driver@quickbite.com / Password@123');
}
