import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Zap, ShoppingBag, Gavel } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Welcome() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const addTrialBalanceMutation = trpc.user.addTrialBalance.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة 5000 دينار تجريبي! 🎉");
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة المبلغ التجريبي");
      setIsLoading(false);
    },
  });

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await addTrialBalanceMutation.mutateAsync();
    } catch (error) {
      console.error("Error adding trial balance:", error);
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    setTimeout(() => navigate("/"), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            أهلاً وسهلاً بك في AH Alpha! 👋
          </h1>
          <p className="text-xl text-gray-600">
            {user?.name ? `مرحباً ${user.name}` : "مرحباً بك"}
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-8 mb-8 border-2 border-blue-200 shadow-lg">
          <div className="text-center mb-8">
            <Gift className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              عرض خاص للمستخدمين الجدد
            </h2>
            <p className="text-gray-600">
              احصل على 5000 دينار تجريبي لتجربة المنصة بدون قيود
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">ابدأ البيع فوراً</h3>
              <p className="text-sm text-gray-600">
                بيع منتجاتك بدون انتظار أو تحقق
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <Gavel className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">شارك في المزايدات</h3>
              <p className="text-sm text-gray-600">
                زايد على المنتجات بثقة مع رصيد تجريبي
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">بدون شروط</h3>
              <p className="text-sm text-gray-600">
                استخدم المبلغ كما تشاء بدون قيود
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <Gift className="w-6 h-6 text-orange-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">5000 دينار</h3>
              <p className="text-sm text-gray-600">
                مبلغ تجريبي لتجربة كاملة للمنصة
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAccept}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  جاري المعالجة...
                </span>
              ) : (
                "✅ نعم، أعطيني 5000 دينار تجريبي"
              )}
            </Button>

            <Button
              onClick={handleDecline}
              disabled={isLoading}
              variant="outline"
              className="w-full py-6 text-lg font-semibold"
            >
              ❌ لا، أفضل أبدأ بدون مبلغ تجريبي
            </Button>
          </div>
        </Card>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">ملاحظة:</span> المبلغ التجريبي متاح فقط للمستخدمين الجدد
            ويمكن استخدامه مرة واحدة فقط
          </p>
        </div>
      </div>
    </div>
  );
}
