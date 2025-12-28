import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, X, Loader2, User } from "lucide-react";

export default function SelectUsername() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const setUsernameMutation = trpc.user.setUsername.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ اسم المستخدم بنجاح! 🎉");
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء حفظ اسم المستخدم");
    },
  });

  const utils = trpc.useUtils();

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setAvailable(null);
      setError("");
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط");
      setAvailable(false);
      return;
    }

    setError("");
    setChecking(true);

    const timer = setTimeout(async () => {
      try {
        const result = await utils.client.user.checkUsername.query(username);
        setAvailable(result.available);
        setChecking(false);
      } catch (err) {
        setChecking(false);
        setAvailable(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, utils]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!available || username.length < 3) return;
    setUsernameMutation.mutate(username);
  };

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">اختر اسم المستخدم</CardTitle>
          <CardDescription className="text-base">
            اختر اسم مستخدم فريد يمكن للآخرين العثور عليك من خلاله
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم المستخدم</label>
              <div className="relative">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="اكتب اسم المستخدم (مثال: ahmed_2024)"
                  className="pr-10"
                  dir="ltr"
                  maxLength={30}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                  {!checking && available === true && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {!checking && available === false && username.length >= 3 && (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {!error && available === true && (
                <p className="text-sm text-green-600">✓ اسم المستخدم متاح</p>
              )}

              {!error && available === false && username.length >= 3 && (
                <p className="text-sm text-red-500">✗ اسم المستخدم محجوز بالفعل</p>
              )}

              <p className="text-xs text-gray-500">
                • يجب أن يكون من 3-30 حرف<br />
                • يمكن استخدام الحروف والأرقام و _ فقط<br />
                • لا يمكن تغييره لاحقاً
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={!available || setUsernameMutation.isPending}
              >
                {setUsernameMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ واستمرار"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={setUsernameMutation.isPending}
              >
                تخطي
              </Button>
            </div>
          </form>

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 لماذا اسم المستخدم؟</p>
            <p className="text-xs">
              اسم المستخدم يسهل على الآخرين العثور عليك ومتابعة متجرك. يمكنك تخطي هذه الخطوة واختيار اسم لاحقاً من إعدادات الحساب.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
