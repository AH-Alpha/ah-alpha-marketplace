import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Clock, Gavel, TrendingUp, User, Medal } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuctionDetail() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/auction/:id");
  const auctionId = params?.id ? parseInt(params.id) : 0;
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");

  // Get auction details
  const { data: auction, isLoading } = trpc.auction.getById.useQuery(auctionId, {
    enabled: !!auctionId,
  });

  // Get bid history
  const { data: bidHistory } = trpc.auction.getById.useQuery(auctionId, {
    enabled: !!auctionId,
    select: (data) => data?.bidHistory || [],
  });

  // Place bid mutation
  const placeBidMutation = trpc.auction.placeBid.useMutation({
    onSuccess: () => {
      toast.success("تم تقديم العرض بنجاح!");
      setBidAmount(0);
    },
    onError: (error: any) => {
      toast.error(error.message || "فشل تقديم العرض");
    },
  });

  // Calculate time left
  useEffect(() => {
    if (!auction?.endTime) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("انتهت المزايدة");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days} يوم و ${hours} ساعة`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} ساعة و ${minutes} دقيقة`);
      } else {
        setTimeLeft(`${minutes} دقيقة و ${seconds} ثانية`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction?.endTime]);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    if (bidAmount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    if (bidAmount <= (auction?.currentHighestBid || 0)) {
      toast.error("العرض يجب أن يكون أعلى من العرض الحالي");
      return;
    }

    placeBidMutation.mutate({
      auctionId,
      bidAmount,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Gavel className="w-8 h-8" />
          </div>
          <p>جاري تحميل المزايدة...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">المزايدة غير موجودة</h1>
          <p className="text-muted-foreground mb-6">
            عذراً، لم نتمكن من العثور على هذه المزايدة
          </p>
          <Button onClick={() => setLocation("/")} className="w-full">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  const isAuctionEnded = auction.status !== "active";
  const isHighestBidder = false; // TODO: Implement when bid data is available

  // Mock bidder data for display
  const mockBidders = [
    {
      name: "أحمد محمد",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
      amount: 350000,
      time: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      name: "فاطمة علي",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
      amount: 250000,
      time: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      name: "محمود حسن",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mahmoud",
      amount: 150000,
      time: new Date(Date.now() - 25 * 60 * 1000),
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          ← العودة
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {auction.product?.imageUrls ? (
                  <img
                    src={auction.product.imageUrls}
                    alt={auction.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">صورة المنتج</span>
                )}
              </div>
            </Card>

            {/* Product Details */}
            <Card className="mt-6 p-6">
              <h1 className="text-3xl font-bold mb-4">{auction.product?.name}</h1>
              <p className="text-gray-600 mb-6">{auction.product?.description}</p>

              {/* Auction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">سعر البداية</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {auction.startPrice?.toLocaleString()} د.ع
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">الحالة</p>
                  <p className={`text-lg font-semibold ${
                    isAuctionEnded ? "text-red-600" : "text-green-600"
                  }`}>
                    {isAuctionEnded ? "انتهت" : "نشطة"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Auction Details Sidebar */}
          <div className="space-y-6">
            {/* Current Bid */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <p className="text-gray-600 text-sm mb-2">أعلى عرض حالي</p>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                {auction.currentHighestBid?.toLocaleString()} د.ع
              </p>

              {/* Time Left */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Clock className="w-4 h-4" />
                <span>{timeLeft}</span>
              </div>

              {/* Place Bid Form */}
              {!isAuctionEnded ? (
                <form onSubmit={handlePlaceBid} className="space-y-3">
                  <Input
                    type="number"
                    placeholder="أدخل عرضك"
                    value={bidAmount || ""}
                    onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                    disabled={!isAuthenticated}
                    className="text-right"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!isAuthenticated || placeBidMutation.isPending}
                  >
                    {placeBidMutation.isPending ? "جاري التقديم..." : "تقديم العرض"}
                  </Button>
                </form>
              ) : (
                <p className="text-center text-red-600 font-semibold">
                  انتهت المزايدة
                </p>
              )}
            </Card>

            {/* Seller Info */}
            {auction.seller && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">معلومات البائع</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{auction.seller.name}</p>
                    <p className="text-sm text-gray-500">⭐ {auction.seller.averageRating || "0"}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  تواصل مع البائع
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Top Bidders Section */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>🏆</span>
            أفضل المزايدين
          </h3>

          {mockBidders && mockBidders.length > 0 ? (
            <div className="space-y-4">
              {mockBidders.map((bidder: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                >
                  {/* Bidder Rank Medal */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-orange-600'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                  </div>

                  {/* Bidder Profile Picture */}
                  <div className="flex-shrink-0">
                    <img
                      src={bidder.profilePicture}
                      alt={bidder.name}
                      className="w-12 h-12 rounded-full border-2 border-blue-200"
                    />
                  </div>

                  {/* Bidder Info */}
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">{bidder.name}</p>
                    <p className="text-sm text-gray-500">
                      {bidder.time.toLocaleString('ar-IQ')}
                    </p>
                  </div>

                  {/* Bid Amount */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {bidder.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">د.ع</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              لم تكن هناك عروض بعد
            </p>
          )}
        </Card>

        {/* Bid History */}
        <Card className="mt-8 p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            سجل العروض
          </h3>

          {auction.bidHistory && auction.bidHistory.length > 0 ? (
            <div className="space-y-3">
              {auction.bidHistory.map((bid: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">مشتري</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bid.time).toLocaleString("ar-IQ")}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">
                    {bid.amount?.toLocaleString()} د.ع
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              لم تكن هناك عروض بعد
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
