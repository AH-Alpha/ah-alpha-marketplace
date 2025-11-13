import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Star, Package, DollarSign, Edit2, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    userType: "buyer" as "buyer" | "seller" | "both",
    sellerName: "",
    sellerDescription: "",
  });

  // Fetch user profile
  const { data: profile } = trpc.user.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch user balance
  const { data: balance = 0 } = trpc.user.balance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Update profile mutation
  const updateProfileMutation = trpc.user.updateProfile.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">
            يرجى تسجيل الدخول لعرض ملفك الشخصي
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        userType: formData.userType,
        sellerName: formData.sellerName,
        sellerDescription: formData.sellerDescription,
      });
      setIsEditing(false);
      alert("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      alert("حدث خطأ أثناء تحديث الملف الشخصي");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile Info */}
          <div className="lg:col-span-2">
            {/* Profile Header Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                      <User className="w-12 h-12" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile?.name || user?.name || "المستخدم"}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {profile?.userType === "seller"
                          ? "بائع"
                          : profile?.userType === "buyer"
                          ? "مشتري"
                          : "بائع ومشتري"}
                      </p>
                      {profile?.userType === "seller" ||
                      profile?.userType === "both" ? (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            4.8 (150 تقييم)
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    {isEditing ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Edit2 className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Edit Form */}
                {isEditing ? (
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الاسم
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="أدخل اسمك"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نوع الحساب
                      </label>
                      <select
                        value={formData.userType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            userType: e.target.value as "buyer" | "seller" | "both",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="buyer">مشتري فقط</option>
                        <option value="seller">بائع فقط</option>
                        <option value="both">بائع ومشتري</option>
                      </select>
                    </div>

                    {(formData.userType === "seller" ||
                      formData.userType === "both") && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم المتجر
                          </label>
                          <Input
                            type="text"
                            value={formData.sellerName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                sellerName: e.target.value,
                              })
                            }
                            placeholder="أدخل اسم متجرك"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            وصف المتجر
                          </label>
                          <textarea
                            value={formData.sellerDescription}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                sellerDescription: e.target.value,
                              })
                            }
                            placeholder="أدخل وصف متجرك"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {updateProfileMutation.isPending
                          ? "جاري الحفظ..."
                          : "حفظ التغييرات"}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-gray-200 space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                        <p className="text-gray-900">{user?.email || "غير محدد"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">الموقع</p>
                        <p className="text-gray-900">العراق</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  إعدادات الحساب
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">كلمة المرور</p>
                      <p className="text-sm text-gray-600">
                        آخر تحديث منذ 3 أشهر
                      </p>
                    </div>
                    <Button variant="outline" className="text-sm">
                      تغيير
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        المصادقة الثنائية
                      </p>
                      <p className="text-sm text-gray-600">
                        غير مفعلة حالياً
                      </p>
                    </div>
                    <Button variant="outline" className="text-sm">
                      تفعيل
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        إشعارات البريد الإلكتروني
                      </p>
                      <p className="text-sm text-gray-600">
                        مفعلة لجميع الأنشطة
                      </p>
                    </div>
                    <Button variant="outline" className="text-sm">
                      تعديل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Quick Stats */}
          <div>
            {/* Balance Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">الرصيد</h3>
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {balance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">دينار عراقي</p>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  إضافة رصيد
                </Button>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">الطلبات</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">المشتريات</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
                  </div>
                  {profile?.userType === "seller" ||
                  profile?.userType === "both" ? (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600">المبيعات</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">45</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">روابط سريعة</h3>
                <div className="space-y-2">
                  <a
                    href="/seller/dashboard"
                    className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    لوحة تحكم البائع
                  </a>
                  <a
                    href="/cart"
                    className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    سلة المشتريات
                  </a>
                  <a
                    href="/"
                    className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    المتجر الرئيسي
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
