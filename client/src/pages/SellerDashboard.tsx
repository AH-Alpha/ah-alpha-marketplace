import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Eye, BarChart3, Package, DollarSign, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "analytics">("products");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    categoryId: string;
    condition: "new" | "used";
    quantity: string;
  }>({
    name: "",
    description: "",
    price: "",
    categoryId: "1",
    condition: "new",
    quantity: "1",
  });

  // Fetch seller products
  const { data: products = [] } = trpc.products.sellerProducts.useQuery(
    user?.id || 0,
    { enabled: !!user?.id && isAuthenticated }
  );

  // Fetch seller orders
  const { data: orders = [] } = trpc.orders.list.useQuery(
    { isBuyer: false },
    { enabled: isAuthenticated }
  );

  // Create product mutation
  const createProductMutation = trpc.products.create.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">
            يرجى تسجيل الدخول لعرض لوحة التحكم
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProductMutation.mutateAsync({
        categoryId: parseInt(formData.categoryId),
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        condition: formData.condition,
        quantity: parseInt(formData.quantity),
      });
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "1",
        condition: "new" as "new" | "used",
        quantity: "1",
      });
      setShowAddProduct(false);
      alert("تم إضافة المنتج بنجاح");
    } catch (error) {
      alert("حدث خطأ أثناء إضافة المنتج");
    }
  };

  // Calculate statistics
  const totalSales = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalCommission = orders.reduce((sum, order) => sum + order.commission, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                لوحة تحكم البائع
              </h1>
              <p className="text-gray-600 mt-1">
                مرحباً بك، {user?.name || "البائع"}
              </p>
            </div>
            <Button
              onClick={() => setShowAddProduct(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة منتج جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">المنتجات</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {products.length}
                  </p>
                </div>
                <Package className="w-12 h-12 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">الطلبات</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {totalSales}
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">الإيرادات</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {(totalRevenue - totalCommission).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">د.ع</p>
                </div>
                <DollarSign className="w-12 h-12 text-yellow-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">التقييم</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    4.8
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <Star className="w-12 h-12 text-orange-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "products"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              المنتجات ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "orders"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              الطلبات ({totalSales})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "analytics"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              الإحصائيات
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "products" && (
              <div>
                {products.length > 0 ? (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            السعر: {product.price.toLocaleString()} د.ع | الكمية:{" "}
                            {product.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">لا توجد منتجات حتى الآن</p>
                    <Button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      إضافة منتج جديد
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              الطلب #{order.id}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              المبلغ: {order.totalPrice.toLocaleString()} د.ع
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.status === "delivered"
                                ? "تم التسليم"
                                : order.status === "pending"
                                ? "قيد الانتظار"
                                : "قيد المعالجة"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">لا توجد طلبات حتى الآن</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    ملخص الأداء
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {totalSales}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الإيرادات الصافية</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {(totalRevenue - totalCommission).toLocaleString()} د.ع
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                إضافة منتج جديد
              </h2>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المنتج
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="أدخل اسم المنتج"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="أدخل وصف المنتج"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر (د.ع)
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الكمية
                    </label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الفئة
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">إلكترونيات</option>
                      <option value="2">أزياء</option>
                      <option value="3">منزل وأثاث</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الحالة
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({
                          ...formData,
                          condition: (value === "new" ? "new" : "used") as "new" | "used",
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">جديد</option>
                      <option value="used">مستعمل</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {createProductMutation.isPending
                      ? "جاري الإضافة..."
                      : "إضافة المنتج"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddProduct(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
