import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users, products, ratings } from './drizzle/schema.ts';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting seed data insertion...');

    // Create connection
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);

    console.log('✓ Database connected');

    // Insert test sellers
    const sellerData = [
      { openId: 'seller1', name: 'متجر الإلكترونيات', email: 'electronics@test.com', role: 'user', balance: 1000000 },
      { openId: 'seller2', name: 'متجر الأزياء', email: 'fashion@test.com', role: 'user', balance: 1000000 },
      { openId: 'seller3', name: 'متجر المنزل', email: 'home@test.com', role: 'user', balance: 1000000 },
      { openId: 'seller4', name: 'متجر الجمال', email: 'beauty@test.com', role: 'user', balance: 1000000 },
      { openId: 'seller5', name: 'متجر السيارات', email: 'cars@test.com', role: 'user', balance: 1000000 },
      { openId: 'seller6', name: 'متجر العقارات', email: 'realestate@test.com', role: 'user', balance: 1000000 },
      { openId: 'seller7', name: 'متجر الكتب', email: 'books@test.com', role: 'user', balance: 1000000 },
      { openId: 'seller8', name: 'متجر الأطفال', email: 'kids@test.com', role: 'user', balance: 1000000 },
    ];

    // Insert products data
    const productsData = [
      // Electronics (Category 1)
      { categoryId: 1, sellerId: 1, name: 'iPhone 14 Pro Max', description: 'هاتف ذكي حديث بأحدث التقنيات', price: 2500000, condition: 'new', quantity: 5, averageRating: 4.8, reviewCount: 45 },
      { categoryId: 1, sellerId: 1, name: 'Samsung Galaxy S23', description: 'هاتف ذكي بشاشة AMOLED', price: 2200000, condition: 'new', quantity: 3, averageRating: 4.6, reviewCount: 32 },
      { categoryId: 1, sellerId: 1, name: 'iPad Air', description: 'جهاز لوحي قوي للعمل والترفيه', price: 1800000, condition: 'new', quantity: 4, averageRating: 4.7, reviewCount: 28 },
      { categoryId: 1, sellerId: 1, name: 'MacBook Pro', description: 'حاسوب محمول احترافي', price: 4500000, condition: 'new', quantity: 2, averageRating: 4.9, reviewCount: 52 },
      { categoryId: 1, sellerId: 1, name: 'AirPods Pro', description: 'سماعات لاسلكية عالية الجودة', price: 450000, condition: 'new', quantity: 10, averageRating: 4.5, reviewCount: 38 },

      // Fashion (Category 2)
      { categoryId: 2, sellerId: 2, name: 'قميص رجالي فاخر', description: 'قميص من أفضل الأقمشة', price: 150000, condition: 'new', quantity: 15, averageRating: 4.4, reviewCount: 22 },
      { categoryId: 2, sellerId: 2, name: 'فستان نسائي أنيق', description: 'فستان سهرة فاخر', price: 250000, condition: 'new', quantity: 8, averageRating: 4.7, reviewCount: 35 },
      { categoryId: 2, sellerId: 2, name: 'حذاء رياضي', description: 'حذاء رياضي مريح وعملي', price: 120000, condition: 'new', quantity: 20, averageRating: 4.3, reviewCount: 18 },
      { categoryId: 2, sellerId: 2, name: 'حقيبة يد جلدية', description: 'حقيبة يد من الجلد الطبيعي', price: 350000, condition: 'new', quantity: 6, averageRating: 4.8, reviewCount: 42 },
      { categoryId: 2, sellerId: 2, name: 'ساعة ذهبية', description: 'ساعة يد فاخرة', price: 800000, condition: 'new', quantity: 3, averageRating: 4.9, reviewCount: 55 },

      // Home & Furniture (Category 3)
      { categoryId: 3, sellerId: 3, name: 'أريكة جلدية', description: 'أريكة مريحة وفاخرة', price: 1500000, condition: 'new', quantity: 2, averageRating: 4.6, reviewCount: 28 },
      { categoryId: 3, sellerId: 3, name: 'طاولة طعام خشبية', description: 'طاولة طعام من الخشب الفاخر', price: 800000, condition: 'new', quantity: 3, averageRating: 4.5, reviewCount: 24 },
      { categoryId: 3, sellerId: 3, name: 'سرير مزدوج', description: 'سرير مريح بتصميم عصري', price: 1200000, condition: 'new', quantity: 4, averageRating: 4.7, reviewCount: 31 },
      { categoryId: 3, sellerId: 3, name: 'خزانة ملابس', description: 'خزانة ملابس واسعة', price: 600000, condition: 'new', quantity: 5, averageRating: 4.4, reviewCount: 19 },
      { categoryId: 3, sellerId: 3, name: 'ثريا فاخرة', description: 'ثريا إضاءة حديثة', price: 400000, condition: 'new', quantity: 7, averageRating: 4.6, reviewCount: 26 },

      // Health & Beauty (Category 4)
      { categoryId: 4, sellerId: 4, name: 'كريم الوجه الفاخر', description: 'كريم وجه من أفضل العلامات', price: 80000, condition: 'new', quantity: 25, averageRating: 4.5, reviewCount: 33 },
      { categoryId: 4, sellerId: 4, name: 'مجموعة مكياج', description: 'مجموعة مكياج متكاملة', price: 120000, condition: 'new', quantity: 15, averageRating: 4.7, reviewCount: 41 },
      { categoryId: 4, sellerId: 4, name: 'زيت العطر', description: 'زيت عطر فاخر', price: 150000, condition: 'new', quantity: 20, averageRating: 4.8, reviewCount: 48 },
      { categoryId: 4, sellerId: 4, name: 'شامبو وبلسم', description: 'مجموعة العناية بالشعر', price: 60000, condition: 'new', quantity: 30, averageRating: 4.4, reviewCount: 25 },
      { categoryId: 4, sellerId: 4, name: 'جهاز تنظيف الوجه', description: 'جهاز تنظيف كهربائي', price: 200000, condition: 'new', quantity: 10, averageRating: 4.6, reviewCount: 29 },

      // Vehicles (Category 5)
      { categoryId: 5, sellerId: 5, name: 'BMW X5', description: 'سيارة دفع رباعي فاخرة', price: 80000000, condition: 'used', quantity: 1, averageRating: 4.7, reviewCount: 15 },
      { categoryId: 5, sellerId: 5, name: 'Mercedes-Benz C-Class', description: 'سيارة سيدان فاخرة', price: 70000000, condition: 'used', quantity: 1, averageRating: 4.8, reviewCount: 18 },
      { categoryId: 5, sellerId: 5, name: 'Toyota Corolla', description: 'سيارة عملية وموثوقة', price: 25000000, condition: 'used', quantity: 2, averageRating: 4.5, reviewCount: 22 },
      { categoryId: 5, sellerId: 5, name: 'Honda Civic', description: 'سيارة رياضية عملية', price: 22000000, condition: 'used', quantity: 1, averageRating: 4.6, reviewCount: 19 },
      { categoryId: 5, sellerId: 5, name: 'Lexus RX', description: 'سيارة دفع رباعي فاخرة', price: 75000000, condition: 'used', quantity: 1, averageRating: 4.9, reviewCount: 21 },

      // Real Estate (Category 6)
      { categoryId: 6, sellerId: 6, name: 'شقة سكنية في بغداد', description: 'شقة حديثة في منطقة آمنة', price: 300000000, condition: 'new', quantity: 1, averageRating: 4.6, reviewCount: 12 },
      { categoryId: 6, sellerId: 6, name: 'فيلا فاخرة', description: 'فيلا بحديقة واسعة', price: 800000000, condition: 'new', quantity: 1, averageRating: 4.8, reviewCount: 14 },
      { categoryId: 6, sellerId: 6, name: 'محل تجاري', description: 'محل تجاري في موقع متميز', price: 150000000, condition: 'new', quantity: 1, averageRating: 4.5, reviewCount: 10 },
      { categoryId: 6, sellerId: 6, name: 'أرض سكنية', description: 'أرض سكنية واسعة', price: 200000000, condition: 'new', quantity: 1, averageRating: 4.7, reviewCount: 11 },
      { categoryId: 6, sellerId: 6, name: 'مكتب إداري', description: 'مكتب إداري حديث', price: 100000000, condition: 'new', quantity: 1, averageRating: 4.6, reviewCount: 9 },

      // Books & Arts (Category 7)
      { categoryId: 7, sellerId: 7, name: 'كتاب الأدب العربي', description: 'كتاب أدبي قيم', price: 40000, condition: 'new', quantity: 20, averageRating: 4.5, reviewCount: 16 },
      { categoryId: 7, sellerId: 7, name: 'مجموعة قصص', description: 'مجموعة قصص قصيرة', price: 35000, condition: 'new', quantity: 15, averageRating: 4.4, reviewCount: 13 },
      { categoryId: 7, sellerId: 7, name: 'لوحة فنية', description: 'لوحة فنية أصلية', price: 500000, condition: 'new', quantity: 3, averageRating: 4.8, reviewCount: 20 },
      { categoryId: 7, sellerId: 7, name: 'تمثال ديكور', description: 'تمثال فني جميل', price: 200000, condition: 'new', quantity: 5, averageRating: 4.6, reviewCount: 17 },
      { categoryId: 7, sellerId: 7, name: 'مجلة فنية', description: 'مجلة فنية متخصصة', price: 25000, condition: 'new', quantity: 30, averageRating: 4.3, reviewCount: 11 },

      // Kids (Category 8)
      { categoryId: 8, sellerId: 8, name: 'دراجة أطفال', description: 'دراجة آمنة للأطفال', price: 150000, condition: 'new', quantity: 10, averageRating: 4.7, reviewCount: 27 },
      { categoryId: 8, sellerId: 8, name: 'لعبة بناء', description: 'مجموعة لعب بناء تعليمية', price: 80000, condition: 'new', quantity: 20, averageRating: 4.5, reviewCount: 23 },
      { categoryId: 8, sellerId: 8, name: 'ملابس أطفال', description: 'مجموعة ملابس أطفال', price: 60000, condition: 'new', quantity: 25, averageRating: 4.6, reviewCount: 30 },
      { categoryId: 8, sellerId: 8, name: 'حقيبة مدرسية', description: 'حقيبة مدرسية مريحة', price: 45000, condition: 'new', quantity: 30, averageRating: 4.4, reviewCount: 21 },
      { categoryId: 8, sellerId: 8, name: 'لعبة تعليمية', description: 'لعبة تعليمية ذكية', price: 120000, condition: 'new', quantity: 15, averageRating: 4.8, reviewCount: 36 },
    ];

    console.log('✓ Seed data prepared');
    console.log('📊 Ready to insert:');
    console.log(`   - ${sellerData.length} sellers`);
    console.log(`   - ${productsData.length} products`);
    console.log('   - Multiple ratings and reviews');
    console.log('');
    console.log('Note: Database seeding requires direct database access.');
    console.log('Please use the Management Dashboard to add test data, or');
    console.log('run this script with proper database credentials configured.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();
