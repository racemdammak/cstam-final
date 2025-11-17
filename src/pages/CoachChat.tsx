import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Sparkles, Bell, BellOff } from "lucide-react";
import { marked } from "marked";
import coachAvatar from "@/assets/coach-avatar.png";
import {
  requestNotificationPermission,
  showNotification,
  playNotificationSound,
} from "@/utils/notificationUtils";
import { useToast } from "@/hooks/use-toast";

const WS_URL = "ws://localhost:8000/ws";

interface Message {
  id: string;
  text: string;
  sender: "user" | "coach";
  timestamp: Date;
}

const CoachChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey there! 👋 I'm Coach Emma, your personal nutrition companion. I'm here to support you on your wellness journey! How are you feeling today?",
      sender: "coach",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // 🔌 Connect WebSocket once
  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Connected to backend WebSocket");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("🤖 Coach:", event.data);
      const coachResponse: Message = {
        id: Date.now().toString(),
        text: event.data,
        sender: "coach",
        timestamp: new Date(),
      };

      playNotificationSound();
      if (notificationsEnabled && document.hidden) {
        showNotification("Coach Emma", event.data, coachAvatar);
      }

      setMessages((prev) => [...prev, coachResponse]);
      setIsTyping(false);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket closed");
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  // 📜 Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // 🔔 Toggle notifications
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      toast({
        title: granted ? "Notifications enabled 🔔" : "Notifications blocked",
        description: granted
          ? "You'll receive notifications for new messages"
          : "Please enable them in your browser settings",
        variant: granted ? "default" : "destructive",
      });
    } else {
      setNotificationsEnabled(false);
      toast({
        title: "Notifications disabled 🔕",
        description: "You won't receive notifications anymore",
      });
    }
  };

  // 📨 Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    socketRef.current.send(userMessage.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen gradient-warm pb-20">
      <div className="container max-w-3xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-elevated mb-3 sm:mb-4 flex items-center gap-2 sm:gap-4"
        >
          <div className="relative flex-shrink-0">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 sm:border-4 border-primary/30">
              <AvatarImage src={coachAvatar} alt="Coach Emma" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
                CE
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-card ${
                isConnected ? "bg-green-600" : "bg-red-500"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">Coach Emma</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {isConnected ? "Online" : "Offline"} • Your nutrition companion
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 touch-manipulation"
            onClick={toggleNotifications}
            title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            ) : (
              <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            )}
          </Button>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 space-y-3 sm:space-y-4 px-1 sm:px-2">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-2 sm:gap-3 ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {message.sender === "coach" && (
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 border-2 border-primary/20">
                    <AvatarImage src={coachAvatar} alt="Coach Emma" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs sm:text-sm font-bold">
                      CE
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-soft"
                      : "bg-card shadow-soft border border-border/50"
                  }`}
                >
                  {message.sender === "coach" ? (
                    <div
                      className="text-sm leading-relaxed break-words prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: marked(message.text) }}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed break-words">{message.text}</p>
                  )}
                  <span
                    className={`text-xs mt-1 block ${
                      message.sender === "user"
                        ? "text-white/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 border-2 border-secondary/20">
                    <AvatarFallback className="bg-accent text-accent-foreground font-bold text-xs sm:text-sm">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 sm:gap-3"
            >
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 border-2 border-primary/20">
                <AvatarImage src={coachAvatar} alt="Coach Emma" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs sm:text-sm font-bold">
                  CE
                </AvatarFallback>
              </Avatar>
              <div className="bg-card shadow-soft border border-border/50 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((delay) => (
                    <motion.div
                      key={delay}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-elevated"
        >
          <div className="flex gap-2 sm:gap-3 items-end">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... 💬"
              className="rounded-2xl min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none text-base"
            />
            <Button
              variant="hero"
              size="icon"
              className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 touch-manipulation"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping || !isConnected}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
            Press Enter to send • Shift+Enter for new line
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CoachChat;
