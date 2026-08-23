import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, ApprovalStatus, FoodType, CouponType, OrderStatus, PaymentMethod, VehicleType } from '@quickbite/types';
import { UserEntity } from '../entities/user.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { RestaurantEntity } from '../entities/restaurant.entity';
import { MenuCategoryEntity } from '../entities/menu-category.entity';
import { MenuItemEntity } from '../entities/menu-item.entity';
import { MenuItemAddonEntity } from '../entities/menu-item-addon.entity';
import { DeliveryPartnerEntity } from '../entities/delivery-partner.entity';
import { CouponEntity } from '../entities/coupon.entity';
import { AddressEntity } from '../entities/address.entity';

// ─── Demo Credentials ──────────────────────────────────
// These are test-only credentials. NEVER use in production.
export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@quickbite.dev', password: 'Admin@123', phone: '+911000000001' },
  customers: [
    { email: 'customer1@quickbite.dev', password: 'Customer@123', phone: '+911000000010', first: 'Aarav', last: 'Sharma' },
    { email: 'customer2@quickbite.dev', password: 'Customer@123', phone: '+911000000011', first: 'Priya', last: 'Patel' },
    { email: 'customer3@quickbite.dev', password: 'Customer@123', phone: '+911000000012', first: 'Rohan', last: 'Gupta' },
    { email: 'customer4@quickbite.dev', password: 'Customer@123', phone: '+911000000013', first: 'Ananya', last: 'Singh' },
    { email: 'customer5@quickbite.dev', password: 'Customer@123', phone: '+911000000014', first: 'Vikram', last: 'Kumar' },
    { email: 'customer6@quickbite.dev', password: 'Customer@123', phone: '+911000000015', first: 'Meera', last: 'Reddy' },
    { email: 'customer7@quickbite.dev', password: 'Customer@123', phone: '+911000000016', first: 'Arjun', last: 'Nair' },
    { email: 'customer8@quickbite.dev', password: 'Customer@123', phone: '+911000000017', first: 'Sneha', last: 'Joshi' },
    { email: 'customer9@quickbite.dev', password: 'Customer@123', phone: '+911000000018', first: 'Dev', last: 'Malhotra' },
    { email: 'customer10@quickbite.dev', password: 'Customer@123', phone: '+911000000019', first: 'Kavya', last: 'Menon' },
  ],
  restaurantOwners: [
    { email: 'restaurant1@quickbite.dev', password: 'Restaurant@123', phone: '+911000000020', first: 'Rajesh', last: 'Iyer' },
    { email: 'restaurant2@quickbite.dev', password: 'Restaurant@123', phone: '+911000000021', first: 'Sunita', last: 'Agrawal' },
    { email: 'restaurant3@quickbite.dev', password: 'Restaurant@123', phone: '+911000000022', first: 'Mohan', last: 'Bhatt' },
    { email: 'restaurant4@quickbite.dev', password: 'Restaurant@123', phone: '+911000000023', first: 'Lakshmi', last: 'Rao' },
    { email: 'restaurant5@quickbite.dev', password: 'Restaurant@123', phone: '+911000000024', first: 'Anil', last: 'Verma' },
  ],
  deliveryPartners: [
    { email: 'delivery1@quickbite.dev', password: 'Delivery@123', phone: '+911000000030', first: 'Karan', last: 'Thakur' },
    { email: 'delivery2@quickbite.dev', password: 'Delivery@123', phone: '+911000000031', first: 'Suresh', last: 'Yadav' },
    { email: 'delivery3@quickbite.dev', password: 'Delivery@123', phone: '+911000000032', first: 'Amit', last: 'Saxena' },
    { email: 'delivery4@quickbite.dev', password: 'Delivery@123', phone: '+911000000033', first: 'Ravi', last: 'Chauhan' },
    { email: 'delivery5@quickbite.dev', password: 'Delivery@123', phone: '+911000000034', first: 'Deepak', last: 'Mishra' },
  ],
};

const RESTAURANTS_DATA = [
  {
    name: 'Spice Garden',
    description: 'Authentic North Indian cuisine with a modern twist',
    address: '42 MG Road, Bangalore 560001',
    phone: '+919800000001',
    lat: 12.9716, lng: 77.5946,
    opening: '10:00', closing: '23:00',
    cuisine: ['North Indian', 'Mughlai'],
    minOrder: 150, deliveryFee: 30, deliveryTime: 35,
    categories: [
      { name: 'Starters', items: [
        { name: 'Paneer Tikka', price: 249, type: FoodType.VEG, desc: 'Marinated cottage cheese grilled to perfection' },
        { name: 'Chicken Seekh Kebab', price: 299, type: FoodType.NON_VEG, desc: 'Minced chicken kebabs with aromatic spices' },
      ]},
      { name: 'Main Course', items: [
        { name: 'Butter Chicken', price: 349, type: FoodType.NON_VEG, desc: 'Creamy tomato gravy with tender chicken' },
        { name: 'Dal Makhani', price: 249, type: FoodType.VEG, desc: 'Slow-cooked black lentils in creamy gravy' },
      ]},
    ],
  },
  {
    name: 'Dragon Wok',
    description: 'Indo-Chinese fusion at its finest',
    address: '15 Church Street, Bangalore 560001',
    phone: '+919800000002',
    lat: 12.9750, lng: 77.6070,
    opening: '11:00', closing: '22:30',
    cuisine: ['Chinese', 'Indo-Chinese'],
    minOrder: 200, deliveryFee: 25, deliveryTime: 30,
    categories: [
      { name: 'Noodles & Rice', items: [
        { name: 'Hakka Noodles', price: 199, type: FoodType.VEG, desc: 'Stir-fried noodles with seasonal vegetables' },
        { name: 'Chicken Fried Rice', price: 229, type: FoodType.NON_VEG, desc: 'Wok-tossed rice with chicken and egg' },
      ]},
      { name: 'Starters', items: [
        { name: 'Veg Manchurian', price: 179, type: FoodType.VEG, desc: 'Crispy vegetable balls in tangy sauce' },
        { name: 'Chilli Chicken', price: 259, type: FoodType.NON_VEG, desc: 'Spicy dry chicken with bell peppers' },
      ]},
    ],
  },
  {
    name: 'Pizza Planet',
    description: 'Handcrafted pizzas with fresh ingredients',
    address: '88 Indiranagar, Bangalore 560038',
    phone: '+919800000003',
    lat: 12.9784, lng: 77.6408,
    opening: '11:00', closing: '23:30',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    minOrder: 250, deliveryFee: 35, deliveryTime: 40,
    categories: [
      { name: 'Pizzas', items: [
        { name: 'Margherita', price: 299, type: FoodType.VEG, desc: 'Classic tomato, mozzarella and basil' },
        { name: 'Pepperoni Feast', price: 399, type: FoodType.NON_VEG, desc: 'Loaded with premium pepperoni' },
      ]},
      { name: 'Pasta', items: [
        { name: 'Penne Arrabbiata', price: 279, type: FoodType.VEG, desc: 'Spicy tomato sauce with penne pasta' },
        { name: 'Chicken Alfredo', price: 329, type: FoodType.NON_VEG, desc: 'Creamy white sauce with grilled chicken' },
      ]},
    ],
  },
  {
    name: 'Dosa Corner',
    description: 'South Indian breakfast and meals, served all day',
    address: '5 Jayanagar 4th Block, Bangalore 560041',
    phone: '+919800000004',
    lat: 12.9279, lng: 77.5831,
    opening: '07:00', closing: '22:00',
    cuisine: ['South Indian', 'Breakfast'],
    minOrder: 100, deliveryFee: 20, deliveryTime: 25,
    categories: [
      { name: 'Dosas', items: [
        { name: 'Masala Dosa', price: 99, type: FoodType.VEG, desc: 'Crispy dosa with potato masala' },
        { name: 'Rava Dosa', price: 119, type: FoodType.VEG, desc: 'Semolina crepe, crispy and lacy' },
      ]},
      { name: 'Meals', items: [
        { name: 'South Indian Thali', price: 179, type: FoodType.VEG, desc: 'Rice, sambar, rasam, poriyal, curd' },
        { name: 'Curd Rice', price: 79, type: FoodType.VEG, desc: 'Tempered yogurt rice' },
      ]},
    ],
  },
  {
    name: 'Burger Barn',
    description: 'Gourmet burgers and loaded fries',
    address: '22 Koramangala, Bangalore 560034',
    phone: '+919800000005',
    lat: 12.9352, lng: 77.6245,
    opening: '11:00', closing: '01:00',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    minOrder: 200, deliveryFee: 30, deliveryTime: 30,
    categories: [
      { name: 'Burgers', items: [
        { name: 'Classic Smash Burger', price: 199, type: FoodType.NON_VEG, desc: 'Double patty, cheese, lettuce, tomato' },
        { name: 'Paneer Crunch Burger', price: 179, type: FoodType.VEG, desc: 'Crispy paneer patty with spicy mayo' },
      ]},
      { name: 'Sides', items: [
        { name: 'Loaded Fries', price: 149, type: FoodType.VEG, desc: 'Cheese, jalapeño, sour cream' },
        { name: 'Chicken Wings (6pc)', price: 249, type: FoodType.NON_VEG, desc: 'Buffalo-style with ranch dip' },
      ]},
    ],
  },
];

export async function seedDatabase(dataSource: DataSource) {
  console.log('🌱 Starting database seed...\n');

  const userRepo = dataSource.getRepository(UserEntity);
  const profileRepo = dataSource.getRepository(ProfileEntity);
  const customerRepo = dataSource.getRepository(CustomerEntity);
  const restaurantRepo = dataSource.getRepository(RestaurantEntity);
  const menuCategoryRepo = dataSource.getRepository(MenuCategoryEntity);
  const menuItemRepo = dataSource.getRepository(MenuItemEntity);
  const menuItemAddonRepo = dataSource.getRepository(MenuItemAddonEntity);
  const deliveryPartnerRepo = dataSource.getRepository(DeliveryPartnerEntity);
  const couponRepo = dataSource.getRepository(CouponEntity);
  const addressRepo = dataSource.getRepository(AddressEntity);

  // Check if already seeded
  const existingAdmin = await userRepo.findOne({ where: { email: DEMO_CREDENTIALS.admin.email } });
  if (existingAdmin) {
    console.log('⚠️  Database already seeded. Skipping.\n');
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const customerHash = await bcrypt.hash('Customer@123', 12);
  const restaurantHash = await bcrypt.hash('Restaurant@123', 12);
  const deliveryHash = await bcrypt.hash('Delivery@123', 12);

  // ─── Admin ──────────────────────────────────────────
  const adminUser = await userRepo.save(userRepo.create({
    email: DEMO_CREDENTIALS.admin.email,
    phone: DEMO_CREDENTIALS.admin.phone,
    passwordHash,
    role: UserRole.ADMIN,
    isActive: true,
    isVerified: true,
  }));
  await profileRepo.save(profileRepo.create({
    userId: adminUser.id, firstName: 'Admin', lastName: 'QuickBite',
  }));
  console.log('✅ Admin created');

  // ─── Customers ────────────────────────────────────────
  for (const cust of DEMO_CREDENTIALS.customers) {
    const user = await userRepo.save(userRepo.create({
      email: cust.email, phone: cust.phone, passwordHash: customerHash,
      role: UserRole.CUSTOMER, isActive: true, isVerified: true,
    }));
    await profileRepo.save(profileRepo.create({
      userId: user.id, firstName: cust.first, lastName: cust.last,
    }));
    await customerRepo.save(customerRepo.create({ userId: user.id }));
    // Create a default address for the customer
    await addressRepo.save(addressRepo.create({
      userId: user.id,
      label: 'Home',
      addressLine1: `${Math.floor(Math.random() * 200) + 1} Sample Street`,
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9716 + (Math.random() - 0.5) * 0.05,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.05,
      isDefault: true,
    }));
  }
  console.log('✅ 10 Customers created');

  // ─── Restaurant Owners & Restaurants ──────────────────
  let adminId = adminUser.id; // for coupon creator
  for (let i = 0; i < DEMO_CREDENTIALS.restaurantOwners.length; i++) {
    const owner = DEMO_CREDENTIALS.restaurantOwners[i];
    const rData = RESTAURANTS_DATA[i];

    const user = await userRepo.save(userRepo.create({
      email: owner.email, phone: owner.phone, passwordHash: restaurantHash,
      role: UserRole.RESTAURANT_OWNER, isActive: true, isVerified: true,
    }));
    await profileRepo.save(profileRepo.create({
      userId: user.id, firstName: owner.first, lastName: owner.last,
    }));

    const restaurant = await restaurantRepo.save(restaurantRepo.create({
      ownerId: user.id,
      name: rData.name,
      description: rData.description,
      address: rData.address,
      phone: rData.phone,
      latitude: rData.lat,
      longitude: rData.lng,
      openingHours: rData.opening,
      closingHours: rData.closing,
      cuisineType: rData.cuisine,
      minOrderAmount: rData.minOrder,
      deliveryFee: rData.deliveryFee,
      avgDeliveryTime: rData.deliveryTime,
      approvalStatus: ApprovalStatus.APPROVED,
      isActive: true,
      rating: 4.0 + Math.random() * 0.8,
      totalRatings: Math.floor(Math.random() * 500) + 50,
    }));

    for (let ci = 0; ci < rData.categories.length; ci++) {
      const catData = rData.categories[ci];
      const category = await menuCategoryRepo.save(menuCategoryRepo.create({
        restaurantId: restaurant.id,
        name: catData.name,
        sortOrder: ci,
        isActive: true,
      }));

      for (let ii = 0; ii < catData.items.length; ii++) {
        const itemData = catData.items[ii];
        const menuItem = await menuItemRepo.save(menuItemRepo.create({
          categoryId: category.id,
          restaurantId: restaurant.id,
          name: itemData.name,
          description: itemData.desc,
          price: itemData.price,
          foodType: itemData.type,
          isAvailable: true,
          sortOrder: ii,
        }));

        // Add some addons to each item
        await menuItemAddonRepo.save([
          menuItemAddonRepo.create({ menuItemId: menuItem.id, name: 'Extra Cheese', price: 30, isAvailable: true }),
          menuItemAddonRepo.create({ menuItemId: menuItem.id, name: 'Extra Spicy', price: 0, isAvailable: true }),
        ]);
      }
    }
  }
  console.log('✅ 5 Restaurants with 20 menu items created');

  // ─── Delivery Partners ────────────────────────────────
  const vehicleTypes = [VehicleType.MOTORCYCLE, VehicleType.BICYCLE, VehicleType.MOTORCYCLE, VehicleType.CAR, VehicleType.MOTORCYCLE];
  for (let i = 0; i < DEMO_CREDENTIALS.deliveryPartners.length; i++) {
    const dp = DEMO_CREDENTIALS.deliveryPartners[i];
    const user = await userRepo.save(userRepo.create({
      email: dp.email, phone: dp.phone, passwordHash: deliveryHash,
      role: UserRole.DELIVERY_PARTNER, isActive: true, isVerified: true,
    }));
    await profileRepo.save(profileRepo.create({
      userId: user.id, firstName: dp.first, lastName: dp.last,
    }));
    await deliveryPartnerRepo.save(deliveryPartnerRepo.create({
      userId: user.id,
      vehicleType: vehicleTypes[i],
      vehicleNumber: `KA${String(i + 1).padStart(2, '0')}AB${String(1000 + i)}`,
      licenseNumber: `DL${String(1000 + i)}${String(2024 + i)}`,
      isOnline: false,
      approvalStatus: ApprovalStatus.APPROVED,
      rating: 4.0 + Math.random() * 0.9,
      totalDeliveries: Math.floor(Math.random() * 200),
      bankDetails: {
        accountHolderName: `${dp.first} ${dp.last}`,
        accountNumber: `${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
      },
    }));
  }
  console.log('✅ 5 Delivery Partners created');

  // ─── Coupons ──────────────────────────────────────────
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await couponRepo.save([
    couponRepo.create({
      code: 'WELCOME50',
      type: CouponType.PERCENTAGE,
      value: 50,
      minOrderAmount: 199,
      maxDiscount: 100,
      startDate: now,
      endDate: thirtyDaysLater,
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
      createdBy: adminUser.id,
    }),
    couponRepo.create({
      code: 'FLAT100',
      type: CouponType.FIXED,
      value: 100,
      minOrderAmount: 500,
      maxDiscount: null,
      startDate: now,
      endDate: thirtyDaysLater,
      usageLimit: 500,
      perUserLimit: 3,
      isActive: true,
      createdBy: adminUser.id,
    }),
    couponRepo.create({
      code: 'QUICKBITE20',
      type: CouponType.PERCENTAGE,
      value: 20,
      minOrderAmount: 300,
      maxDiscount: 150,
      startDate: now,
      endDate: thirtyDaysLater,
      usageLimit: null,
      perUserLimit: 5,
      isActive: true,
      createdBy: adminUser.id,
    }),
  ]);
  console.log('✅ 3 Coupons created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Accounts:');
  console.log(`  Admin:     ${DEMO_CREDENTIALS.admin.email} / ${DEMO_CREDENTIALS.admin.password}`);
  console.log(`  Customer:  ${DEMO_CREDENTIALS.customers[0].email} / ${DEMO_CREDENTIALS.customers[0].password}`);
  console.log(`  Restaurant: ${DEMO_CREDENTIALS.restaurantOwners[0].email} / ${DEMO_CREDENTIALS.restaurantOwners[0].password}`);
  console.log(`  Delivery:  ${DEMO_CREDENTIALS.deliveryPartners[0].email} / ${DEMO_CREDENTIALS.deliveryPartners[0].password}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
