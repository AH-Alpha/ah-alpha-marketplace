import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

export default function Register() {
  const [, setLocation] = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<"google" | "email" | null>(null);



  const handleEmailSignup = () => {
    setLocation("/register/email");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-16 h-16 rounded-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{APP_TITLE}</h1>
          <p className="text-gray-600">انضم إلى أكبر سوق إلكتروني في العراق</p>
        </div>

        {/* Registration Method */}
        <div className="space-y-4">
          {/* Email Signup Button */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
            onClick={handleEmailSignup}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900">إنشاء حساب جديد</h3>
                <p className="text-sm text-gray-500">التسجيل عن طريق البريد الإلكتروني</p>
              </div>
              <div className="text-2xl">→</div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            هل لديك حساب بالفعل؟{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-700"
              onClick={() => setLocation("/login")}
            >
              تسجيل الدخول
            </Button>
          </p>
        </div>

        {/* Info Cards */}
        <div className="mt-8 space-y-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">🛡️ آمن:</span> بيانات محمية بأعلى معايير الأمان
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">⚡ سريع:</span> تسجيل في ثوانٍ معدودة
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💰 مجاني:</span> لا توجد رسوم للتسجيل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
