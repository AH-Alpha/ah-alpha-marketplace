import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

type Step = "email" | "verification" | "profile";

export default function RegisterEmail() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to send verification code
      // For now, just move to next step
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      setStep("verification");
    } catch (error) {
      toast.error("فشل إرسال رمز التحقق");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error("يرجى إدخال رمز التحقق");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to verify code
      // For now, just move to next step
      toast.success("تم التحقق من البريد الإلكتروني بنجاح");
      setStep("profile");
    } catch (error) {
      toast.error("رمز التحقق غير صحيح");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/register")}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">التسجيل عن طريق البريد</h1>
          <p className="text-gray-600 mt-2">أنشئ حسابك بسهولة</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full ${step === "email" || step === "verification" || step === "profile" ? "bg-blue-600" : "bg-gray-300"}`} />
          <div className={`flex-1 h-1 rounded-full ${step === "verification" || step === "profile" ? "bg-blue-600" : "bg-gray-300"}`} />
          <div className={`flex-1 h-1 rounded-full ${step === "profile" ? "bg-blue-600" : "bg-gray-300"}`} />
        </div>

        {/* Email Step */}
        {step === "email" && (
          <Card className="p-8">
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="text-right"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 ml-2" />
                    إرسال رمز التحقق
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* Verification Step */}
        {step === "verification" && (
          <Card className="p-8">
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  تم إرسال رمز التحقق إلى <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز التحقق (6 أرقام)
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                  disabled={isLoading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "التحقق"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("email")}
              >
                إعادة إرسال الرمز
              </Button>
            </form>
          </Card>
        )}

        {/* Profile Step */}
        {step === "profile" && (
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم التحقق بنجاح!</h2>
              <p className="text-gray-600 mb-6">الآن دعنا ننهي إعداد حسابك</p>
              <Button
                onClick={() => setLocation("/register/profile")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                متابعة إعداد الملف الشخصي
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
