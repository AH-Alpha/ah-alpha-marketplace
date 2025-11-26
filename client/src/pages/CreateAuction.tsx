import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function CreateAuction() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    productId: 0,
    startPrice: 0,
    duration: "24",
  });

  // Get user's products for the dropdown
  const { data: userProducts } = trpc.products.sellerProducts.useQuery(
    user?.id || 0,
    { enabled: !!user?.id }
  );

  const createAuctionMutation = trpc.auction.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المزايدة بنجاح!");
      setLocation("/");
    },
    onError: (error: any) => {
      toast.error(error.message || "فشل إنشاء المزايدة");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "productId" || name === "startPrice" 
        ? parseFloat(value) 
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.productId <= 0) {
      toast.error("يرجى اختيار منتج");
      return;
    }

    if (formData.startPrice <= 0) {
      toast.error("يرجى إدخال سعر البداية");
      return;
    }

    createAuctionMutation.mutate({
      productId: formData.productId,
      startPrice: formData.startPrice,
      durationHours: formData.duration as "12" | "24" | "36" | "48" | "72",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">يرجى تسجيل الدخول</h1>
          <p className="text-muted-foreground mb-6">
            يجب عليك تسجيل الدخول لإنشاء مزايدة جديدة
          </p>
          <Button onClick={() => setLocation("/")} className="w-full">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">إنشاء مزايدة جديدة</h1>
          <p className="text-muted-foreground">
            اختر منتجاً من منتجاتك وحوله إلى مزايدة لجذب المشترين
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">المنتج</label>
              {userProducts && userProducts.length > 0 ? (
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  required
                >
                  <option value={0}>اختر منتجاً</option>
                  {userProducts.map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.price?.toLocaleString()} د.ع
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ليس لديك منتجات حالياً. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => setLocation("/seller-dashboard")}
                    >
                      أنشئ منتجاً أولاً
                    </Button>
                  </p>
                </div>
              )}
            </div>

            {/* Starting Price */}
            <div>
              <label className="block text-sm font-medium mb-2">سعر البداية (د.ع)</label>
              <Input
                type="number"
                name="startPrice"
                value={formData.startPrice}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1000"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                هذا هو أقل سعر سيبدأ به المشترون في المزايدة
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">مدة المزايدة</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="12">12 ساعة</option>
                <option value="24">24 ساعة</option>
                <option value="36">36 ساعة</option>
                <option value="48">48 ساعة</option>
                <option value="72">72 ساعة</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createAuctionMutation.isPending}
                className="flex-1"
              >
                {createAuctionMutation.isPending ? "جاري الإنشاء..." : "إنشاء المزايدة"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Section */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-600">ℹ️</span> نصائح لمزايدة ناجحة
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>اختر سعر بداية معقول لجذب المشترين</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>المزايدات الأقصر (12-24 ساعة) تحصل على مزيد من الانتباه</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>تأكد من أن صور المنتج واضحة وعالية الجودة</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>المنتجات المشهورة تحصل على مزايدات أعلى</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
