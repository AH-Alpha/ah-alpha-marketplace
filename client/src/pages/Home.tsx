import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShoppingCart, User, LogOut, Menu, X, Star, Package, Gavel } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch categories
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Fetch products
  const { data: products = [] } = trpc.products.list.useQuery({
    categoryId: selectedCategory || undefined,
    limit: 20,
  });

  // Fetch active auctions
  const { data: auctions = [] } = trpc.auction.getActive.useQuery();

  // Main categories for display
  const mainCategories = [
    { id: 1, name: "إلكترونيات", icon: "📱" },
    { id: 2, name: "أزياء", icon: "👕" },
    { id: 3, name: "منزل وأثاث", icon: "🛋️" },
    { id: 4, name: "صحة وجمال", icon: "💄" },
    { id: 5, name: "سيارات", icon: "🚗" },
    { id: 6, name: "عقارات", icon: "🏠" },
    { id: 7, name: "كتب وفنون", icon: "📚" },
    { id: 8, name: "مستلزمات أطفال", icon: "👶" },
  ];

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">AH Alpha</div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 mx-8">
              <div className="w-full flex items-center bg-gray-100 rounded-lg px-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن أي شيء..."
                  className="w-full bg-transparent px-3 py-2 outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right Menu */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <a href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      0
                    </span>
                  </a>
                  <div className="hidden sm:flex items-center gap-4">
                    <a href="/orders" className="text-gray-600 hover:text-gray-900 text-sm">
                      الطلبات
                    </a>
                    <a href="/profile" className="text-gray-600 hover:text-gray-900 text-sm">
                      {user?.name || "المستخدم"}
                    </a>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                  <button className="p-2 text-gray-600 hover:text-gray-900 md:hidden">
                    <User className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    تسجيل الدخول
                  </Button>
                </a>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث..."
                className="w-full bg-transparent px-2 py-1 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Categories Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-2 sm:gap-4 py-3 sm:py-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === null
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              الكل
            </button>
            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="text-sm sm:text-base">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.name}</span>
                <span className="sm:hidden text-xs">{cat.name.substring(0, 4)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">أهلاً بك في AH Alpha</h1>
          <p className="text-lg text-blue-100 mb-6">
            أكبر سوق إلكتروني في العراق - اشتري وبع بثقة
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                ابدأ الآن
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">المنتجات المميزة</h2>
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              عرض الكل →
            </a>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative bg-gray-200 h-48 overflow-hidden rounded-t-lg">
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <img
                          src={JSON.parse(product.imageUrls)[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-gray-500">صورة المنتج</span>
                        </div>
                      )}
                      {product.condition === "new" && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          جديد
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4 flex flex-col h-full">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm sm:text-base">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-2 sm:mb-3">
                        <p className="text-lg sm:text-xl font-bold text-blue-600 break-words">
                          {product.price.toLocaleString()} د.ع
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3 flex-wrap">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 sm:w-4 h-3 sm:h-4 ${
                                i < Math.round(Number(product.averageRating))
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-1.5 sm:py-2 mt-auto"
                      >
                        أضف إلى السلة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">لا توجد منتجات متاحة حالياً</p>
            </div>
          )}
        </div>

        {/* Auctions Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">المزايدات النشطة</h2>
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              عرض الكل →
            </a>
          </div>

          {auctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {auctions.slice(0, 8).map((auction: any) => (
                <Card
                  key={auction.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/auction/${auction.id}`)}
                >
                  <CardContent className="p-0">
                    {/* Auction Image */}
                    <div className="relative bg-gray-200 h-48 overflow-hidden rounded-t-lg">
                      {auction.product?.imageUrls ? (
                        <img
                          src={auction.product.imageUrls}
                          alt={auction.product?.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-gray-500">صورة المزايدة</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        مزايدة
                      </div>
                    </div>

                    {/* Auction Info */}
                    <div className="p-3 sm:p-4 flex flex-col h-full">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm sm:text-base">
                        {auction.product?.name}
                      </h3>

                      {/* Current Bid */}
                      <div className="mb-2 sm:mb-3">
                        <p className="text-xs text-gray-500 mb-1">أعلى عرض</p>
                        <p className="text-lg sm:text-xl font-bold text-red-600 break-words">
                          {auction.currentHighestBid?.toLocaleString()} د.ع
                        </p>
                      </div>

                      {/* Time Left */}
                      <div className="text-xs text-gray-500 mt-auto">
                        ⏱️ ينتهي قريباً
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">لا توجد مزايدات نشطة حالياً</p>
            </div>
          )}
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-8 mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            لماذا تختار AH Alpha؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-2">حماية المشتري والبائع</h3>
              <p className="text-gray-600 text-sm">
                نظام حجز الأموال يضمن حقوق الطرفين
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="font-semibold text-gray-900 mb-2">تقييمات موثوقة</h3>
              <p className="text-gray-600 text-sm">
                نظام تقييم شامل يساعدك على الاختيار الصحيح
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="font-semibold text-gray-900 mb-2">سهل وسريع</h3>
              <p className="text-gray-600 text-sm">
                عملية شراء وبيع بسيطة وآمنة
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">عن AH Alpha</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    من نحن
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    الأخبار
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    الوظائف
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">المساعدة</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    مركز المساعدة
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    اتصل بنا
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    الأسئلة الشائعة
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">السياسات</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    شروط الاستخدام
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    سياسة الخصوصية
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    سياسة الأمان
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">تابعنا</h3>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm">
              © 2025 AH Alpha Marketplace. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
