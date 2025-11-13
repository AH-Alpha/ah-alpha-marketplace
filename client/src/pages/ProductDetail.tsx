import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
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

  // Fetch product ratings
  const { data: ratings = [] } = trpc.ratings.list.useQuery(
    productId || 0,
    { enabled: !!productId }
  );

  // Add to cart mutation
  const addToCartMutation = trpc.cart.add.useMutation();

  if (!productId || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">المنتج غير موجود</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
      alert("تم إضافة المنتج إلى السلة");
    } catch (error) {
      alert("حدث خطأ أثناء إضافة المنتج");
    }
  };

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.productRating, 0) / ratings.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">
              الرئيسية
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product Images */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Main Image */}
                <div className="relative bg-gray-200 h-96 flex items-center justify-center rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">صورة المنتج</span>
                  </div>

                  {/* Image Navigation */}
                  <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full">
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                    1 / 3
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="flex gap-2 p-4 bg-gray-50">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-20 h-20 bg-gray-300 rounded cursor-pointer hover:border-2 hover:border-blue-600"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Description */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  تفاصيل المنتج
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <span className="font-semibold">الحالة:</span>
                    <span className="mr-2">
                      {product.condition === "new" ? "جديد" : "مستعمل"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">الكمية المتاحة:</span>
                    <span className="mr-2">{product.quantity}</span>
                  </div>
                  <div>
                    <span className="font-semibold">الوصف:</span>
                    <p className="mt-2 text-gray-600">{product.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ratings Section */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  التقييمات والمراجعات
                </h3>

                {ratings.length > 0 ? (
                  <div className="space-y-6">
                    {/* Rating Summary */}
                    <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                      <div className="text-center">
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
                              <span className="text-sm text-gray-600 w-8">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-4">
                      {ratings.slice(0, 5).map((rating, index) => (
                        <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">
                                مشتري
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
                              منذ يومين
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {rating.comment || "لا توجد تعليقات"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    لا توجد تقييمات حتى الآن
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Purchase Section */}
          <div>
            {/* Price Card */}
            <Card className="sticky top-20">
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
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="flex-1 text-center py-2 outline-none"
                      min="1"
                      max={product.quantity}
                    />
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.quantity, quantity + 1))
                      }
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {addToCartMutation.isPending
                      ? "جاري الإضافة..."
                      : "أضف إلى السلة"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">البائع</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">متجر موثوق</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">98%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    1500+ عملية بيع ناجحة
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                  >
                    تواصل مع البائع
                  </Button>
                </div>

                {/* Safety Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-900 font-semibold mb-2">
                    🛡️ حماية المشتري
                  </p>
                  <p className="text-xs text-blue-800">
                    أموالك محجوزة حتى تستلم المنتج وتؤكد رضاك عنه
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
