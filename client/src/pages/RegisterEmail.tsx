import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowRight, Loader2, User, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function RegisterEmail() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.auth.registerWithEmail.useMutation({
    onSuccess: () => {
      toast.success("تم التسجيل بنجاح! جاري تحويلك...");
      // Redirect to home after successful registration
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password || !name || !username) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }

    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (username.length < 3 || username.length > 20) {
      toast.error("اسم المستخدم يجب أن يكون بين 3 و 20 حرف");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط");
      return;
    }

    setIsLoading(true);
    registerMutation.mutate({
      email,
      password,
      name,
      username,
    });
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
          <h1 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-600 mt-2">املأ البيانات التالية للتسجيل</p>
        </div>

        {/* Registration Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-right block mb-2">
                الاسم الكامل
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أحمد محمد"
                  className="pr-10 text-right"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username" className="text-right block mb-2">
                اسم المستخدم
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="ahmed123"
                  className="pr-10 text-right"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                حروف وأرقام فقط، 3-20 حرف
              </p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-right block mb-2">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="pr-10 text-right"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-right block mb-2">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 text-right"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                6 أحرف على الأقل
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-right block mb-2">
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 text-right"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التسجيل...
                </>
              ) : (
                "إنشاء الحساب"
              )}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
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
      </div>
    </div>
  );
}
