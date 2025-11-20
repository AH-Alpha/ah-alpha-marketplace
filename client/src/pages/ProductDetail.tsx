import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const productId = params?.id ? parseInt(params.id) : null;
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  // Fetch product details
  const { data: product, isLoading: productLoading } = trpc.products.detail.useQuery(
    productId || 0,
    { enabled: !!productId }
  );

  // Fetch seller info (seller profile doesn't take an ID parameter in this setup)
  const { data: seller } = trpc.user.profile.useQuery(undefined, {
    enabled: false, // We'll use the seller data from the product response
  });

  // Fetch product ratings
  const { data: ratings = [] } = trpc.ratings.list.useQuery(
    productId || 0,
    { enabled: !!productId }
  );

  // Add to cart mutation
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المنتج إلى السلة");
      setQuantity(1);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة المنتج");
    },
  });

  const createConversationMutation = trpc.messaging.getOrCreateConversation.useMutation({
    onSuccess: () => {
      toast.success("تم فتح المحادثة");
      navigate("/messages");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء فتح المحادثة");
    },
  });

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    
    if (!product) return;
    
    await createConversationMutation.mutateAsync({
      sellerId: product.sellerId,
      productId: product.id,
    });
  };

  if (!productId || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">المنتج غير موجود</p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  // Parse image URLs
  const imageUrls = product.imageUrls
    ? JSON.parse(product.imageUrls)
    : ["/placeholder.jpg"];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.productRating, 0) / ratings.length
        ).toFixed(1)
      : 0;

  // Get seller info from product data
  const sellerRating = product?.averageRating
    ? Number(product.averageRating).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <a href="/" className="hover:text-blue-600 transition">
              الرئيسية
            </a>
            <span>/</span>
            <a href="/" className="hover:text-blue-600 transition">
              المنتجات
            </a>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Main Image */}
                <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden group">
                  <img
                    src={imageUrls[currentImageIndex]}
                    alt={`${product.name} - صورة ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Image Navigation Buttons */}
                  {imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition z-10"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition z-10"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium">
                    {currentImageIndex + 1} / {imageUrls.length}
                  </div>

                  {/* Condition Badge */}
                  {product.condition === "new" && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      جديد
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {imageUrls.length > 1 && (
                  <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                    {imageUrls.map((url: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition ${
                          currentImageIndex === index
                            ? "border-blue-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`صورة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Description & Specifications */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  تفاصيل المنتج
                </h3>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الحالة</p>
                      <p className="font-semibold text-gray-900">
                        {product.condition === "new" ? "جديد" : "مستعمل"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الكمية المتاحة</p>
                      <p className="font-semibold text-gray-900">{product.quantity} وحدة</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">وصف المنتج</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">طريقة الدفع</span>
                      <span className="font-semibold text-gray-900">تحويل بنكي / دفع عند الاستلام</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الشحن</span>
                      <span className="font-semibold text-gray-900">شحن مجاني للعراق</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">سياسة الاسترجاع</span>
                      <span className="font-semibold text-gray-900">استرجاع مجاني خلال 7 أيام</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ratings Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  التقييمات والمراجعات
                </h3>

                {ratings.length > 0 ? (
                  <div className="space-y-6">
                    {/* Rating Summary */}
                    <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                      <div className="text-center min-w-fit">
                        <div className="text-4xl font-bold text-gray-900">
                          {averageRating}
                        </div>
                        <div className="flex justify-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(Number(averageRating))
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          ({ratings.length} تقييم)
                        </p>
                      </div>

                      {/* Rating Distribution */}
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = ratings.filter(
                            (r) => r.productRating === stars
                          ).length;
                          const percentage =
                            ratings.length > 0
                              ? (count / ratings.length) * 100
                              : 0;
                          return (
                            <div key={stars} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 w-12">
                                {stars} نجوم
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-400 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-8 text-left">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        آخر التقييمات
                      </h4>
                      {ratings.slice(0, 5).map((rating, index) => (
                        <div
                          key={index}
                          className="pb-4 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">
                                مشتري موثوق
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < rating.productRating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              منذ أسبوع
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">
                            {rating.comment || "تقييم بدون تعليق"}
                          </p>
                          <div className="flex gap-4 text-xs text-gray-600">
                            <div>
                              <span className="font-semibold">المنتج:</span> {rating.productRating}/5
                            </div>
                            <div>
                              <span className="font-semibold">التغليف:</span> {rating.packagingRating}/5
                            </div>
                            <div>
                              <span className="font-semibold">الشحن:</span> {rating.shippingRating}/5
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    لا توجد تقييمات حتى الآن. كن أول من يقيم هذا المنتج!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Purchase Section */}
          <div>
            {/* Price Card */}
            <Card className="sticky top-20 mb-6">
              <CardContent className="p-6">
                {/* Price */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">السعر</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {product.price.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">دينار عراقي</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(Number(averageRating))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({ratings.length} تقييم)
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-3">الكمية</p>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1))
                        )
                      }
                      className="flex-1 text-center py-2 outline-none border-l border-r border-gray-300"
                      min="1"
                      max={product.quantity}
                    />
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.quantity, quantity + 1))
                      }
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {product.quantity} وحدة متاحة
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {addToCartMutation.isPending
                      ? "جاري الإضافة..."
                      : "أضف إلى السلة"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-3"
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        liked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    {liked ? "تمت الإضافة للمفضلة" : "أضف للمفضلة"}
                  </Button>
                </div>

                {/* Seller Info */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3 font-semibold">البائع</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        متجر موثوق
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(Number(sellerRating))
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    100+ عملية بيع ناجحة
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-sm flex items-center justify-center gap-2 py-3 hover:bg-blue-50 hover:border-blue-300 transition"
                    onClick={handleContactSeller}
                    disabled={createConversationMutation.isPending}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {createConversationMutation.isPending ? "جاري الفتح..." : "تواصل مع البائع"}
                  </Button>
                </div>


              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
