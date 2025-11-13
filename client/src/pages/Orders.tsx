import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, CheckCircle, AlertCircle, Star, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"buying" | "selling">("buying");

  // Fetch orders
  const { data: buyingOrders = [] } = trpc.orders.list.useQuery(
    { isBuyer: true },
    { enabled: isAuthenticated && activeTab === "buying" }
  );

  const { data: sellingOrders = [] } = trpc.orders.list.useQuery(
    { isBuyer: false },
    { enabled: isAuthenticated && activeTab === "selling" }
  );

  const orders = activeTab === "buying" ? buyingOrders : sellingOrders;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">
            يرجى تسجيل الدخول لعرض الطلبات
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "processing":
        return <Package className="w-5 h-5" />;
      case "shipped":
        return <Package className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "processing":
        return "قيد المعالجة";
      case "shipped":
        return "تم الشحن";
      case "delivered":
        return "تم التسليم";
      case "cancelled":
        return "ملغى";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">الطلبات</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("buying")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "buying"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              طلبات الشراء ({buyingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("selling")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "selling"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              طلبات البيع ({sellingOrders.length})
            </button>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              الطلب #{order.id}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {activeTab === "buying"
                              ? `من: متجر موثوق`
                              : `إلى: مشتري`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {order.totalPrice.toLocaleString()} د.ع
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString(
                              "ar-IQ"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-600">المبلغ الأساسي</p>
                            <p className="font-semibold text-gray-900">
                              {(
                                order.totalPrice - order.commission
                              ).toLocaleString()}{" "}
                              د.ع
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">رسوم المنصة</p>
                            <p className="font-semibold text-gray-900">
                              {order.commission.toLocaleString()} د.ع
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">عدد المنتجات</p>
                            <p className="font-semibold text-gray-900">
                              1
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">رقم التتبع</p>
                            <p className="font-semibold text-gray-900">
                              {order.trackingCode || "قريباً"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {order.status === "delivered" && activeTab === "buying" ? (
                          <>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                              <Star className="w-4 h-4" />
                              تقييم المنتج
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              تواصل مع البائع
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              className="flex-1 flex items-center justify-center gap-2"
                            >
                              <Package className="w-4 h-4" />
                              تتبع الشحنة
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              تواصل
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {activeTab === "buying"
                    ? "لا توجد طلبات شراء"
                    : "لا توجد طلبات بيع"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {activeTab === "buying"
                    ? "ابدأ بالتسوق الآن"
                    : "أضف منتجات وابدأ البيع"}
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  {activeTab === "buying"
                    ? "تصفح المنتجات"
                    : "إضافة منتج جديد"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
