import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Clock, Gavel, TrendingUp, User } from "lucide-react";

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

    if (user?.id === auction?.sellerId) {
      toast.error("لا يمكنك المزايدة على منتجك الخاص");
      return;
    }

    if (bidAmount <= (auction?.currentHighestBid || 0)) {
      toast.error("يجب أن يكون العرض أعلى من أعلى عرض حالي");
      return;
    }

    placeBidMutation.mutate({
      auctionId,
      bidAmount,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
                  <div className="text-gray-400">لا توجد صورة</div>
                )}
              </div>
            </Card>

            {/* Product Details */}
            <Card className="mt-6 p-6">
              <h1 className="text-3xl font-bold mb-4">{auction.product?.name}</h1>
              <p className="text-muted-foreground mb-6">{auction.product?.description}</p>

              {/* Seller Info */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  معلومات البائع
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">{auction.seller?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    تقييم: ⭐ 4.8 (150 تقييم)
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Auction Info & Bidding */}
          <div>
            {/* Auction Status */}
            <Card className={`p-6 mb-6 ${isAuctionEnded ? "bg-red-50" : "bg-green-50"}`}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  {isAuctionEnded ? "انتهت المزايدة" : "المزايدة نشطة"}
                </span>
              </div>
              <p className={`text-2xl font-bold ${isAuctionEnded ? "text-red-600" : "text-green-600"}`}>
                {timeLeft}
              </p>
            </Card>

            {/* Bid Info */}
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">سعر البداية</p>
                  <p className="text-2xl font-bold">
                    {auction.startPrice?.toLocaleString()} د.ع
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-1">أعلى عرض حالي</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {auction.currentHighestBid?.toLocaleString()} د.ع
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    عدد العروض: {auction.bids || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* Bid Form */}
            {!isAuctionEnded && isAuthenticated && user?.id !== auction.sellerId && (
              <Card className="p-6 mb-6">
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      عرضك (د.ع)
                    </label>
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                      placeholder={`أكثر من ${auction.currentHighestBid?.toLocaleString()}`}
                      min={auction.currentHighestBid + 1}
                      step="1000"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      يجب أن يكون العرض أكثر من {auction.currentHighestBid?.toLocaleString()} د.ع
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={placeBidMutation.isPending}
                    className="w-full"
                  >
                    {placeBidMutation.isPending ? "جاري تقديم العرض..." : "تقديم العرض"}
                  </Button>
                </form>
              </Card>
            )}

            {isAuctionEnded && isHighestBidder && (
              <Card className="p-6 mb-6 bg-green-50 border-green-200">
                <p className="text-green-800 font-semibold">
                  ✓ أنت الفائز بهذه المزايدة!
                </p>
              </Card>
            )}

            {isAuctionEnded && !isHighestBidder && (
              <Card className="p-6 mb-6 bg-gray-50">
                <p className="text-muted-foreground text-sm">
                  انتهت المزايدة. لا يمكن تقديم عروض جديدة.
                </p>
              </Card>
            )}
          </div>
        </div>

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
