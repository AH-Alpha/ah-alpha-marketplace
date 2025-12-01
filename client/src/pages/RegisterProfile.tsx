import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Loader2, SkipForward } from "lucide-react";

// Iraqi Governorates
const IRAQI_GOVERNORATES = [
  "بغداد",
  "الموصل",
  "البصرة",
  "الحلة",
  "كربلاء",
  "النجف",
  "كركوك",
  "الرمادي",
  "الناصرية",
  "الديوانية",
  "السليمانية",
  "أربيل",
  "دهوك",
  "تكريت",
  "سامراء",
  "الكوت",
  "الفلوجة",
  "الحويجة",
];

type Step = "personal" | "store" | "picture" | "complete";

export default function RegisterProfile() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("personal");
  const [isLoading, setIsLoading] = useState(false);

  // Personal Info
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [governorate, setGovernorate] = useState("");

  // Store Info
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");

  // Picture
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار صورة");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !address || !governorate) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setStep("store");
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName) {
      toast.error("يرجى إدخال اسم المتجر");
      return;
    }

    setStep("picture");
  };

  const handleSkipPicture = () => {
    setStep("complete");
  };

  const handleUploadPicture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("يرجى اختيار صورة");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Upload image to S3
      toast.success("تم رفع الصورة بنجاح");
      setStep("complete");
    } catch (error) {
      toast.error("فشل رفع الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    try {
      // TODO: Save all data and complete registration
      toast.success("تم إنشاء حسابك بنجاح!");
      setLocation("/");
    } catch (error) {
      toast.error("فشل إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إعداد ملفك الشخصي</h1>
          <p className="text-gray-600 mt-2">أكمل البيانات لإنشاء متجرك</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full ${step === "personal" || step === "store" || step === "picture" || step === "complete" ? "bg-blue-600" : "bg-gray-300"}`} />
          <div className={`flex-1 h-1 rounded-full ${step === "store" || step === "picture" || step === "complete" ? "bg-blue-600" : "bg-gray-300"}`} />
          <div className={`flex-1 h-1 rounded-full ${step === "picture" || step === "complete" ? "bg-blue-600" : "bg-gray-300"}`} />
          <div className={`flex-1 h-1 rounded-full ${step === "complete" ? "bg-blue-600" : "bg-gray-300"}`} />
        </div>

        {/* Personal Info Step */}
        {step === "personal" && (
          <Card className="p-8">
            <form onSubmit={handlePersonalSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <Input
                    type="text"
                    placeholder="أحمد محمد"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <Input
                    type="tel"
                    placeholder="07700000000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <Input
                  type="text"
                  placeholder="الشارع والحي"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-right"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحافظة
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                >
                  <option value="">اختر المحافظة</option>
                  {IRAQI_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                متابعة
              </Button>
            </form>
          </Card>
        )}

        {/* Store Info Step */}
        {step === "store" && (
          <Card className="p-8">
            <form onSubmit={handleStoreSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المتجر
                </label>
                <Input
                  type="text"
                  placeholder="متجري الرائع"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="text-right"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المتجر (اختياري)
                </label>
                <textarea
                  placeholder="اكتب وصفاً عن متجرك..."
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right resize-none"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("personal")}
                >
                  السابق
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  متابعة
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Picture Upload Step */}
        {step === "picture" && (
          <Card className="p-8">
            <form onSubmit={handleUploadPicture} className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  صورة المتجر أو البروفايل
                </h3>
                <p className="text-gray-600 mb-6">
                  أضف صورة جذابة لمتجرك (اختياري)
                </p>
              </div>

              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    تغيير الصورة
                  </Button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">اضغط لاختيار صورة</p>
                  <p className="text-sm text-gray-500">أو اسحب الصورة هنا</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkipPicture}
                >
                  <SkipForward className="w-4 h-4 ml-2" />
                  تخطي
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || !selectedFile}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    "رفع الصورة"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">مبروك!</h2>
              <p className="text-gray-600 mb-6">
                تم إنشاء حسابك بنجاح. الآن يمكنك البدء في بيع منتجاتك!
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-right">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">اسم المتجر:</span> {storeName}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">المحافظة:</span> {governorate}
                </p>
              </div>

              <Button
                onClick={handleCompleteRegistration}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإنهاء...
                  </>
                ) : (
                  "الذهاب إلى الرئيسية"
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
