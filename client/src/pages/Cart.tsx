import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Fetch cart items
  const { data: cartItems = [], refetch: refetchCart } = trpc.cart.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Remove from cart mutation
  const removeFromCartMutation = trpc.cart.remove.useMutation({
    onSuccess: () => refetchCart(),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              سلة المشتريات
            </h1>
            <p className="text-gray-600 mb-6">
              يرجى تسجيل الدخول لعرض سلة المشتريات
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleRemove = async (cartId: number) => {
    try {
      await removeFromCartMutation.mutateAsync(cartId);
    } catch (error) {
      alert("حدث خطأ أثناء حذف المنتج");
    }
  };

  const handleQuantityChange = (cartId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      setQuantities((prev) => ({
        ...prev,
        [cartId]: newQuantity,
      }));
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const qty = quantities[item.id] || item.quantity;
    return sum + (item.productId * qty); // This is simplified, should fetch product price
  }, 0);

  const commission = Math.round(subtotal * 0.025); // 2.5% commission
  const total = subtotal + commission;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">سلة المشتريات</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 flex gap-6 hover:bg-gray-50 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">صورة</span>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            اسم المنتج
                          </h3>
                          <p className="text-gray-600 text-sm mb-4">
                            معرف المنتج: {item.productId}
                          </p>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  (quantities[item.id] || item.quantity) - 1
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={quantities[item.id] || item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-12 text-center border border-gray-300 rounded py-1"
                              min="1"
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  (quantities[item.id] || item.quantity) + 1
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600 mb-4">
                            0 د.ع
                          </p>
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={removeFromCartMutation.isPending}
                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    ملخص الطلب
                  </h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>عدد المنتجات</span>
                      <span className="font-medium">
                        {cartItems.reduce(
                          (sum, item) =>
                            sum + (quantities[item.id] || item.quantity),
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>المجموع الفرعي</span>
                      <span className="font-medium">
                        {subtotal.toLocaleString()} د.ع
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>رسوم المنصة (2.5%)</span>
                      <span className="font-medium">
                        {commission.toLocaleString()} د.ع
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <span className="font-semibold text-gray-900">المجموع</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {total.toLocaleString()} د.ع
                    </span>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3">
                    متابعة الدفع
                  </Button>

                  <Button variant="outline" className="w-full">
                    متابعة التسوق
                  </Button>

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
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              سلة المشتريات فارغة
            </h2>
            <p className="text-gray-600 mb-6">
              ابدأ بإضافة بعض المنتجات إلى سلتك
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              تصفح المنتجات
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
