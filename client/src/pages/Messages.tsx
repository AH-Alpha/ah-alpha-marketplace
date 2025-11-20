import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations, refetch: refetchConversations } = 
    trpc.messaging.getUserConversations.useQuery();

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: loadingMessages, refetch: refetchMessages } = 
    trpc.messaging.getConversationMessages.useQuery(selectedConversation || 0, {
      enabled: selectedConversation !== null,
    });

  // Send message mutation
  const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      refetchConversations();
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const receiverId = conversation.buyerId === user?.id ? conversation.sellerId : conversation.buyerId;

    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversation,
      receiverId,
      content: messageText,
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUserName = conv.otherUser?.name || "Unknown";
    return otherUserName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConvo = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">الرسائل</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Input
                  placeholder="ابحث عن محادثة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loadingConversations ? (
                    <p className="text-gray-500 text-center py-4">جاري التحميل...</p>
                  ) : filteredConversations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">لا توجد محادثات</p>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full text-right p-3 rounded-lg transition ${
                          selectedConversation === conv.id
                            ? "bg-blue-100 border-2 border-blue-500"
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <p className="font-semibold text-gray-900">
                          {conv.otherUser?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {conv.otherUser?.userType === "seller" ? "بائع" : "مشتري"}
                        </p>
                        {conv.product && (
                          <p className="text-xs text-gray-500 mt-1">
                            {conv.product.name}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConvo ? (
              <Card>
                <CardContent className="p-6 flex flex-col h-96">
                  {/* Header */}
                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedConvo.otherUser?.name || "Unknown"}
                    </h2>
                    {selectedConvo.product && (
                      <p className="text-sm text-gray-600 mt-1">
                        بخصوص: {selectedConvo.product.name}
                      </p>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {loadingMessages ? (
                      <p className="text-gray-500 text-center">جاري التحميل...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-gray-500 text-center">لا توجد رسائل بعد</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.senderId === user?.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.senderId === user?.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString("ar-IQ")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="اكتب رسالتك..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 flex flex-col items-center justify-center h-96">
                  <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">
                    اختر محادثة لبدء الرسائل
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
