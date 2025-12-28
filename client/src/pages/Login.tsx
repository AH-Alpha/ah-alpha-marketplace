import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, LogIn } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.loginWithEmail.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      // Reload to update auth state
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message);
      setIsLoading(false);
    },
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);
    loginMutation.mutate({ email, password });
  };

  const handleGoogleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-16 h-16 rounded-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-600">مرحباً بك في {APP_TITLE}</p>
        </div>

        {/* Login Form */}
        <Card className="p-6 mb-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
                />
              </div>
            </div>

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
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </Card>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-500">
              أو
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500 mb-4"
          onClick={handleGoogleLogin}
        >
          <div className="flex items-center justify-center gap-3">
            <LogIn className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">تسجيل الدخول عن طريق Google</span>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            ليس لديك حساب؟{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-700"
              onClick={() => setLocation("/register")}
            >
              إنشاء حساب جديد
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
