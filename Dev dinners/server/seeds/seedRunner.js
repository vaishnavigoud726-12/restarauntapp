const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const Customer = require('../models/Customer');
const Restaurant = require('../models/Restaurant');
const Admin = require('../models/Admin');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const Discount = require('../models/Discount');
const DiscountUsage = require('../models/DiscountUsage');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const GroupDiningPlan = require('../models/GroupDiningPlan');
const ActivityLog = require('../models/ActivityLog');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cravewise';
  console.log(`Connecting to ${uri}...`);
  await mongoose.connect(uri);
  console.log('MongoDB connected for seeding.');
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing collections...');
    await Customer.deleteMany({});
    await Restaurant.deleteMany({});
    await Admin.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Booking.deleteMany({});
    await Feedback.deleteMany({});
    await Discount.deleteMany({});
    await DiscountUsage.deleteMany({});
    await LoyaltyTransaction.deleteMany({});
    await GroupDiningPlan.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('1. Seeding Super Admin...');
    const admin = await Admin.create({
      fullName: 'Dr. K. Srinivas (MSD Evaluator & Admin)',
      email: 'admin@cravewise.com',
      password: 'admin123',
      role: 'super_admin',
    });

    console.log('2. Seeding 10 Realistic Hyderabad Restaurants...');
    const restaurantsData = [
      {
        name: 'Paradise Biryani',
        ownerName: 'Mirza Baig',
        email: 'paradise@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 11223',
        tagline: 'World Famous Hyderabadi Dum Biryani since 1953',
        description: 'Iconic heritage venue celebrated worldwide for authentic Nizami spices, long-grain basmati dum biryani, and succulent mutton kebabs.',
        cuisineTypes: ['Hyderabadi', 'Mughlai', 'Biryani'],
        diningStyle: 'Family Restaurant',
        priceForTwo: 900,
        address: {
          street: 'MG Road, Secunderabad',
          area: 'Secunderabad',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500003',
        },
        location: { type: 'Point', coordinates: [78.4878, 17.4411] },
        openingTime: '11:00',
        closingTime: '23:30',
        images: [
          'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
          'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',
        ],
        features: ['Valet Parking', 'Air Conditioned', 'Nizami Ambience', 'Family Dining'],
        averageRating: 4.6,
        totalReviews: 28,
        approvalStatus: 'approved',
      },
      {
        name: 'Bawarchi Restaurant',
        ownerName: 'Syed Mansoor',
        email: 'bawarchi@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 22334',
        tagline: 'The Legendary Soul of RTC X Roads',
        description: 'Beloved landmark famous for authentic spicy Hyderabadi biryani cooked with traditional charcoal wood dum techniques.',
        cuisineTypes: ['Hyderabadi', 'North Indian', 'Tandoori'],
        diningStyle: 'Casual Dining',
        priceForTwo: 700,
        address: {
          street: 'Main Road, RTC Cross Roads',
          area: 'RTC X Roads',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500020',
        },
        location: { type: 'Point', coordinates: [78.4983, 17.4022] },
        openingTime: '11:30',
        closingTime: '23:00',
        images: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        ],
        features: ['Air Conditioned', 'Takeaway Counter', 'Quick Seating'],
        averageRating: 4.5,
        totalReviews: 34,
        approvalStatus: 'approved',
      },
      {
        name: 'Jewel of Nizam - The Minar',
        ownerName: 'Nawab Feroz Khan',
        email: 'jewel@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 33445',
        tagline: 'Royal Regal Dining at a 100ft Tower',
        description: 'Perched high in an exquisite tower overlooking Osman Sagar lake, offering royal recipes handed down through generations of Nizami royal chefs.',
        cuisineTypes: ['Mughlai', 'Hyderabadi', 'Royal Indian'],
        diningStyle: 'Fine Dining',
        priceForTwo: 2800,
        address: {
          street: 'The Golkonda Resort, Gandipet',
          area: 'Gandipet',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500075',
        },
        location: { type: 'Point', coordinates: [78.3614, 17.382] },
        openingTime: '12:30',
        closingTime: '23:30',
        images: [
          'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800',
        ],
        features: ['Valet Parking', 'Lake View', 'Live Classical Music', 'Royal Ambience'],
        averageRating: 4.9,
        totalReviews: 42,
        approvalStatus: 'approved',
      },
      {
        name: 'Chutneys',
        ownerName: 'Venkatesh Rao',
        email: 'chutneys@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 44556',
        tagline: 'Seven Varieties of Authentic Chutneys & Steaming Guntur Idlis',
        description: 'Iconic South Indian culinary paradise renowned for its signature Babai Idli, Guntur Karam Dosa, and freshly churned seasonal chutneys.',
        cuisineTypes: ['South Indian', 'Vegetarian', 'Andhra'],
        diningStyle: 'Casual Dining',
        priceForTwo: 600,
        address: {
          street: 'Road No. 3, Banjara Hills',
          area: 'Banjara Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500034',
        },
        location: { type: 'Point', coordinates: [78.4482, 17.4241] },
        openingTime: '07:00',
        closingTime: '22:30',
        images: [
          'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
        ],
        features: ['Pure Vegetarian', 'Breakfast Buffet', 'Air Conditioned'],
        averageRating: 4.4,
        totalReviews: 19,
        approvalStatus: 'approved',
      },
      {
        name: 'Tatva Restaurant',
        ownerName: 'Ramesh Agrawal',
        email: 'tatva@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 55667',
        tagline: 'Artisanal Global Vegetarian Gastronomy',
        description: 'Fine dining pure vegetarian restaurant offering innovative fusion cuisine, wood-fired sourdough pizzas, and gourmet Indian delicacies.',
        cuisineTypes: ['Vegetarian', 'Continental', 'North Indian', 'Italian'],
        diningStyle: 'Fine Dining',
        priceForTwo: 1600,
        address: {
          street: 'Road No. 36, Jubilee Hills',
          area: 'Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
        },
        location: { type: 'Point', coordinates: [78.4068, 17.4334] },
        openingTime: '12:00',
        closingTime: '23:00',
        images: [
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        ],
        features: ['Valet Parking', 'Pure Vegetarian', 'Jain Options', 'Cocktail Bar'],
        averageRating: 4.7,
        totalReviews: 31,
        approvalStatus: 'approved',
      },
      {
        name: 'Flechazo',
        ownerName: 'Kunal Joshi',
        email: 'flechazo@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 66778',
        tagline: 'Celebration of Mediterranean & Asian Flavours',
        description: 'Lively interactive buffet with a live pizza oven, Asian wok station, liquid nitrogen dessert lab, and unlimited gourmet barbecue skewers.',
        cuisineTypes: ['Mediterranean', 'Asian', 'Barbecue', 'Buffet'],
        diningStyle: 'Casual Dining',
        priceForTwo: 1500,
        address: {
          street: 'Above Croma, Madhapur Main Road',
          area: 'Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
        },
        location: { type: 'Point', coordinates: [78.3846, 17.4486] },
        openingTime: '11:30',
        closingTime: '23:00',
        images: [
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        ],
        features: ['Live Counters', 'Buffet', 'Kids Play Zone', 'Air Conditioned'],
        averageRating: 4.3,
        totalReviews: 24,
        approvalStatus: 'approved',
      },
      {
        name: 'Farzi Café',
        ownerName: 'Zorawar Kalra',
        email: 'farzi@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 77889',
        tagline: 'Modern Indian Bistro & Molecular Gastronomy',
        description: 'Illusionary modern Indian bistro creating sensory culinary experiences where traditional Indian recipes merge with cutting-edge modernist science.',
        cuisineTypes: ['Modern Indian', 'Fusion', 'Continental'],
        diningStyle: 'Bistro',
        priceForTwo: 2200,
        address: {
          street: 'Road No. 59, Jubilee Hills',
          area: 'Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
        },
        location: { type: 'Point', coordinates: [78.4112, 17.4358] },
        openingTime: '12:00',
        closingTime: '00:00',
        images: [
          'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800',
        ],
        features: ['Outdoor Seating', 'Live DJ', 'Molecular Cocktails', 'Valet Parking'],
        averageRating: 4.6,
        totalReviews: 22,
        approvalStatus: 'approved',
      },
      {
        name: 'Rayalaseema Ruchulu',
        ownerName: 'Uttam Reddy',
        email: 'ruchulu@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 88990',
        tagline: 'Fiery Authentic Rayalaseema & Telangana Feasts',
        description: 'Authentic spice lover haven famed for Gongura Mamsam, Ragi Mudda with Natukodi Pulusu, and authentic spicy coastal sea prawn curries.',
        cuisineTypes: ['Andhra', 'South Indian', 'Rayalaseema'],
        diningStyle: 'Casual Dining',
        priceForTwo: 1100,
        address: {
          street: 'Near Cyber Towers, Hitec City',
          area: 'Hitec City',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
        },
        location: { type: 'Point', coordinates: [78.3752, 17.4475] },
        openingTime: '11:30',
        closingTime: '23:00',
        images: [
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
        ],
        features: ['Authentic Andhra Spices', 'Banana Leaf Service', 'Air Conditioned'],
        averageRating: 4.4,
        totalReviews: 18,
        approvalStatus: 'approved',
      },
      {
        name: "The Fisherman's Wharf",
        ownerName: 'Noel De Souza',
        email: 'wharf@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 99001',
        tagline: 'Goan Coastal Seafood & Rustic Village Vibe',
        description: 'Sprawling Goan-themed coastal sanctuary with thatched roofs, breezy garden courtyards, fresh lobsters, prawn balchao, and bebinca.',
        cuisineTypes: ['Goan', 'Seafood', 'Continental'],
        diningStyle: 'Casual Dining',
        priceForTwo: 1800,
        address: {
          street: 'ISB Road, Financial District, Gachibowli',
          area: 'Gachibowli',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500032',
        },
        location: { type: 'Point', coordinates: [78.3498, 17.44] },
        openingTime: '12:00',
        closingTime: '23:30',
        images: [
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        ],
        features: ['Outdoor Garden', 'Live Band', 'Craft Cocktails', 'Pet Friendly'],
        averageRating: 4.5,
        totalReviews: 29,
        approvalStatus: 'approved',
      },
      {
        name: 'Shah Ghouse Hotel & Restaurant',
        ownerName: 'Mohammed Rabbani',
        email: 'shahghouse@cravewise.com',
        password: 'owner123',
        phone: '+91 98490 10203',
        tagline: 'Pure Hyderabadi Haleem & Zafrani Mutton Biryani',
        description: 'Historic culinary giant serving midnight food lovers with rich mutton marag, slow-cooked zafrani biryani, and award-winning Hyderabadi haleem.',
        cuisineTypes: ['Hyderabadi', 'Mughlai', 'Biryani'],
        diningStyle: 'Casual Dining',
        priceForTwo: 650,
        address: {
          street: 'Opposite Charminar Bus Station',
          area: 'Charminar',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500002',
        },
        location: { type: 'Point', coordinates: [78.4747, 17.3616] },
        openingTime: '11:00',
        closingTime: '01:30',
        images: [
          'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',
        ],
        features: ['Late Night Dining', 'Heritage Location', 'Charcoal Dum'],
        averageRating: 4.5,
        totalReviews: 36,
        approvalStatus: 'approved',
      },
    ];

    const createdRestaurants = await Restaurant.create(restaurantsData);
    console.log(`Created ${createdRestaurants.length} restaurants.`);

    console.log('3. Seeding Menu Items (6+ per restaurant)...');
    const menuTemplates = [
      // Starters
      { name: 'Mutton Seekh Kebab', category: 'Starters', price: 290, dietaryType: 'Non-Veg', popularityScore: 92 },
      { name: 'Paneer Tikka Angara', category: 'Starters', price: 220, dietaryType: 'Veg', popularityScore: 88 },
      { name: 'Crispy Corn Salt & Pepper', category: 'Starters', price: 180, dietaryType: 'Veg', popularityScore: 75 },
      { name: 'Apollo Fish Tikka', category: 'Starters', price: 340, dietaryType: 'Non-Veg', popularityScore: 94 },
      // Main Courses
      { name: 'Special Hyderabadi Dum Biryani', category: 'Main Course', price: 280, dietaryType: 'Non-Veg', popularityScore: 98, isChefSpecial: true },
      { name: 'Nizami Subz Biryani Handi', category: 'Main Course', price: 210, dietaryType: 'Veg', popularityScore: 84 },
      { name: 'Murgh Butter Masala', category: 'Main Course', price: 290, dietaryType: 'Non-Veg', popularityScore: 90 },
      { name: 'Dal Makhani Bukhara', category: 'Main Course', price: 190, dietaryType: 'Veg', popularityScore: 86 },
      // Desserts & Beverages
      { name: 'Shahi Double Ka Meetha', category: 'Desserts', price: 120, dietaryType: 'Veg', popularityScore: 95 },
      { name: 'Sizzling Brownie with Ice Cream', category: 'Desserts', price: 150, dietaryType: 'Veg', popularityScore: 91 },
      { name: 'Qubani Ka Meetha with Malai', category: 'Desserts', price: 130, dietaryType: 'Veg', popularityScore: 93 },
      { name: 'Irani Chai with Osmania Biscuit', category: 'Beverages', price: 50, dietaryType: 'Veg', popularityScore: 89 },
      { name: 'Fresh Lime Soda Mint', category: 'Beverages', price: 80, dietaryType: 'Veg', popularityScore: 70 },
    ];

    for (const rest of createdRestaurants) {
      const itemsToInsert = menuTemplates.map((template) => ({
        ...template,
        restaurantId: rest._id,
      }));
      await MenuItem.create(itemsToInsert);
    }
    console.log('Menu items seeded across all 10 restaurants.');

    console.log('4. Seeding Physical Tables (4 tables per restaurant)...');
    for (const rest of createdRestaurants) {
      const tables = [
        { restaurantId: rest._id, tableNumber: 'T-01', capacity: 2, zone: 'Indoor AC' },
        { restaurantId: rest._id, tableNumber: 'T-02', capacity: 4, zone: 'Family Booth' },
        { restaurantId: rest._id, tableNumber: 'T-03', capacity: 6, zone: 'Outdoor / Garden' },
        { restaurantId: rest._id, tableNumber: 'T-04', capacity: 8, zone: 'Rooftop' },
      ];
      await Table.create(tables);
    }
    console.log('Tables seeded.');

    console.log('5. Seeding 15 Realistic Customers...');
    const customerNames = [
      { name: 'Rahul Varma', email: 'rahul@gmail.com', segment: 'loyal', visits: 6, savings: 850 },
      { name: 'Priya Sharma', email: 'priya@gmail.com', segment: 'regular', visits: 3, savings: 320 },
      { name: 'Arjun Reddy', email: 'arjun@gmail.com', segment: 'new', visits: 0, savings: 0 },
      { name: 'Sneha Patel', email: 'sneha@gmail.com', segment: 'birthday', visits: 4, savings: 450 },
      { name: 'Aditya Rao', email: 'aditya@gmail.com', segment: 'high_spending', visits: 5, savings: 1200 },
      { name: 'Ananya Deshmukh', email: 'ananya@gmail.com', segment: 'budget_conscious', visits: 2, savings: 240 },
      { name: 'Vikram Malhotra', email: 'vikram@gmail.com', segment: 'regular', visits: 3, savings: 310 },
      { name: 'Divya Nair', email: 'divya@gmail.com', segment: 'loyal', visits: 7, savings: 940 },
      { name: 'Sanjay Gupta', email: 'sanjay@gmail.com', segment: 'new', visits: 0, savings: 0 },
      { name: 'Kavita Joshi', email: 'kavita@gmail.com', segment: 'regular', visits: 2, savings: 190 },
      { name: 'Nikhil Chowdary', email: 'nikhil@gmail.com', segment: 'high_spending', visits: 6, savings: 1400 },
      { name: 'Meera Pillai', email: 'meera@gmail.com', segment: 'regular', visits: 3, savings: 290 },
      { name: 'Karan Mehra', email: 'karan@gmail.com', segment: 'new', visits: 0, savings: 0 },
      { name: 'Pooja Agarwal', email: 'pooja@gmail.com', segment: 'loyal', visits: 8, savings: 1100 },
      { name: 'Rohan Joshi', email: 'rohan@gmail.com', segment: 'inactive', visits: 1, savings: 100 },
    ];

    const createdCustomers = [];
    for (const c of customerNames) {
      const cust = await Customer.create({
        fullName: c.name,
        email: c.email,
        password: 'customer123',
        phone: '+91 99887 ' + Math.floor(10000 + Math.random() * 90000),
        segment: c.segment,
        totalCompletedVisits: c.visits,
        totalSavings: c.savings,
        loyaltyPoints: 100 + c.visits * 60,
        dietaryPreferences: ['Veg', 'Non-Veg'],
        favouriteCuisines: ['Hyderabadi', 'North Indian'],
        dateOfBirth: c.segment === 'birthday' ? new Date() : new Date('1998-05-15'),
      });
      createdCustomers.push(cust);
    }
    console.log(`Created ${createdCustomers.length} customers.`);

    console.log('6. Seeding Configurable Personalized Discounts...');
    const discountsData = [
      {
        code: 'WELCOME20',
        title: 'New Diner Welcome Gift',
        description: 'Flat 20% off your inaugural dine-in table reservation',
        discountType: 'percentage',
        discountValue: 20,
        minBillAmount: 500,
        maxDiscountAmount: 300,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        targetSegment: 'new',
        whyExplanation: 'Exclusive welcome reward for joining CraveWise!',
      },
      {
        code: 'LOYALTY25',
        title: 'Loyal Diner Privilege',
        description: '25% off up to ₹500 for our most valued patrons',
        discountType: 'percentage',
        discountValue: 25,
        minBillAmount: 800,
        maxDiscountAmount: 500,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        targetSegment: 'loyal',
        whyExplanation: 'Honouring your 5+ completed reservations with CraveWise VIP status!',
      },
      {
        code: 'BDAYBASH',
        title: 'Happy Birthday Dining Treat',
        description: 'Flat ₹300 off on your special birthday dining occasion',
        discountType: 'fixed',
        discountValue: 300,
        minBillAmount: 1000,
        maxDiscountAmount: 300,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        targetSegment: 'birthday',
        whyExplanation: 'Happy Birthday month from CraveWise! Celebrate with friends.',
      },
      {
        code: 'PARADISE150',
        title: 'Paradise Heritage Special',
        description: 'Flat ₹150 off at Paradise Biryani Secunderabad',
        discountType: 'fixed',
        discountValue: 150,
        minBillAmount: 600,
        maxDiscountAmount: 150,
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        targetSegment: 'all',
        restaurantId: createdRestaurants[0]._id,
        whyExplanation: 'Partner promotion: Authentic dum biryani heritage offer.',
      },
      {
        code: 'TATVAVEG',
        title: 'Artisanal Green Dining',
        description: '15% off fine dining vegetarian gastronomy',
        discountType: 'percentage',
        discountValue: 15,
        minBillAmount: 1000,
        maxDiscountAmount: 400,
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        targetSegment: 'all',
        restaurantId: createdRestaurants[4]._id,
        whyExplanation: 'Curated discount for fine dining pure vegetarian culinary lovers.',
      },
    ];

    await Discount.create(discountsData);
    console.log('Discounts seeded.');

    console.log('7. Seeding Completed Bookings & Verified Feedback...');
    const firstRest = createdRestaurants[0];
    const secondRest = createdRestaurants[4];
    const firstCust = createdCustomers[0]; // Rahul
    const secondCust = createdCustomers[1]; // Priya

    const table1 = await Table.findOne({ restaurantId: firstRest._id });
    const table2 = await Table.findOne({ restaurantId: secondRest._id });

    // Completed Booking 1
    const booking1 = await Booking.create({
      bookingReference: 'CW-8821',
      customerId: firstCust._id,
      restaurantId: firstRest._id,
      tableId: table1._id,
      guestCount: 4,
      bookingDate: '2026-11-01',
      timeSlot: '19:00 - 21:00',
      status: 'completed',
      checkInCode: '4821',
      actualBillAmount: 1450,
      discountSaved: 150,
      appliedDiscountCode: 'PARADISE150',
      isFeedbackSubmitted: true,
    });

    // Verified Review for Booking 1
    await Feedback.create({
      bookingId: booking1._id,
      customerId: firstCust._id,
      restaurantId: firstRest._id,
      ratings: { food: 5, service: 4, ambience: 5, overall: 5 },
      reviewTitle: 'Unbeatable Dum Biryani Experience!',
      comment: 'The basmati aroma and tender mutton pieces were authentic Nizami perfection. Seating was quick and check-in was seamless.',
      ownerReply: {
        replyText: 'Thank you Mr. Rahul! We take deep pride in our 70-year legacy. Looking forward to welcoming you again.',
        repliedAt: new Date(),
      },
      status: 'approved',
    });

    // Completed Booking 2
    const booking2 = await Booking.create({
      bookingReference: 'CW-7412',
      customerId: secondCust._id,
      restaurantId: secondRest._id,
      tableId: table2._id,
      guestCount: 2,
      bookingDate: '2026-11-02',
      timeSlot: '20:00 - 22:00',
      status: 'completed',
      checkInCode: '1942',
      actualBillAmount: 1800,
      discountSaved: 270,
      appliedDiscountCode: 'TATVAVEG',
      isFeedbackSubmitted: true,
    });

    // Verified Review for Booking 2
    await Feedback.create({
      bookingId: booking2._id,
      customerId: secondCust._id,
      restaurantId: secondRest._id,
      ratings: { food: 5, service: 5, ambience: 5, overall: 5 },
      reviewTitle: 'Exquisite Fine Dining Pure Veg Gastronomy',
      comment: 'Tatva redefined vegetarian dining for us. The wood-fired pizza and dessert styling were world class!',
      ownerReply: {
        replyText: 'Thank you Priya! Our chef was thrilled to read your appreciation.',
        repliedAt: new Date(),
      },
      status: 'approved',
    });

    // Confirmed upcoming booking
    await Booking.create({
      bookingReference: 'CW-9014',
      customerId: firstCust._id,
      restaurantId: createdRestaurants[1]._id,
      tableId: (await Table.findOne({ restaurantId: createdRestaurants[1]._id }))._id,
      guestCount: 2,
      bookingDate: '2026-11-06',
      timeSlot: '20:00 - 22:00',
      status: 'confirmed',
      checkInCode: '5819',
      billEstimatedAmount: 800,
    });

    console.log('Bookings & verified feedback seeded.');

    console.log('8. Seeding Group Dining Plan...');
    await GroupDiningPlan.create({
      creatorId: firstCust._id,
      groupName: 'MSD Project Celebration Dinner',
      groupSize: 6,
      targetBudgetPerPerson: 500,
      preferredCuisines: ['Hyderabadi', 'Continental'],
      shortlistedRestaurants: [
        { restaurantId: firstRest._id, votes: [firstCust._id] },
        { restaurantId: secondRest._id, votes: [secondCust._id] },
        { restaurantId: createdRestaurants[2]._id, votes: [] },
      ],
      winningRestaurantId: firstRest._id,
      shareCode: 'CW-MSD6',
      status: 'voting',
    });
    console.log('Group dining plan seeded.');

    console.log('====================================================');
    console.log(' CraveWise Database Seeding Completed Successfully! ');
    console.log(' Sample Accounts for Demo & Viva Evaluation:');
    console.log(' 1. Super Admin: admin@cravewise.com | pass: admin123');
    console.log(' 2. Owner (Paradise): paradise@cravewise.com | pass: owner123');
    console.log(' 3. Owner (Tatva): tatva@cravewise.com | pass: owner123');
    console.log(' 4. Customer: rahul@gmail.com | pass: customer123');
    console.log(' 5. Customer (Birthday): sneha@gmail.com | pass: customer123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

