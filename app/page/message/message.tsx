import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "@/app/constants/ip";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/app/constants/Colors";
import { router } from "expo-router";

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

interface Admin {
  _id: string;
  email: string;
  name: string;
}

const socket: Socket = io(`${ipAddress}`, {
  transports: ["websocket"],
});

export default function UserChat() {
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const messagesEndRef = useRef<FlatList<Message>>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          const id = parsedUserData._id;
          if (id) {
            setUserId(id);
          } else {
            console.error("Không tìm thấy _id trong userData");
          }
        } else {
          console.error("Không tìm thấy userData trong AsyncStorage");
        }
      } catch (error) {
        console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    socket.emit("register", { userId, role: "user" });

    socket.on("loadAdmins", (admins: Admin[]) => {
      setAdmins(admins);
      if (admins.length > 0) {
        setSelectedAdmin(admins[0]._id);
        socket.emit("selectAdmin", { userId, adminId: admins[0]._id });
      }
    });

    socket.on("loadMessages", (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
    });

    socket.on("receiveMessage", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("error", ({ message }: { message: string }) => {
      console.error("Lỗi từ server:", message);
    });

    return () => {
      socket.off("loadAdmins");
      socket.off("loadMessages");
      socket.off("receiveMessage");
      socket.off("error");
    };
  }, [userId]);

  const handleSelectAdmin = (adminId: string) => {
    setSelectedAdmin(adminId);
    socket.emit("selectAdmin", { userId, adminId });
  };

  const sendMessage = () => {
    if (message.trim() && userId && selectedAdmin) {
      const newMessage = {
        userId,
        sender: `user:${userId}`,
        receiver: `admin:${selectedAdmin}`,
        content: message,
        timestamp: new Date().toISOString(),
      };
      socket.emit("sendMessage", newMessage);
      setMessage("");
    }
  };

  const renderadmin__item = ({ item }: { item: Admin }) => (
    <TouchableOpacity
      style={[
        styles.adminItem,
        selectedAdmin === item._id && styles.selectedItem,
      ]}
      onPress={() => handleSelectAdmin(item._id)}
    >
      <View
        style={[
          styles.adminItemContainer,
          {
            backgroundColor:
              selectedAdmin === item._id ? Colors.primary : Colors.accent,
          },
        ]}
      >
        <View style={styles.adminAvatarContainer}>
          <Ionicons
            name="person"
            size={14}
            color={selectedAdmin === item._id ? Colors.white : Colors.primary}
          />
        </View>
        <Text
          style={[
            styles.adminItemText,
            selectedAdmin === item._id && styles.selectedText,
          ]}
          numberOfLines={1}
        >
          {item.name || item.email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === `user:${userId}`;
    const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View
        style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessage : styles.adminMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUserMessage ? styles.userMessageText : styles.adminMessageText,
          ]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            isUserMessage ? styles.timestampUser : styles.timestampAdmin,
          ]}
        >
          {formattedTime}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {userId ? (
        <>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
          <View style={styles.header}>
            <TouchableOpacity onPress={()=>{router.back()}} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Chat với Admin</Text>
            </View>
          </View>

          <View style={styles.adminPickerContainer}>
            <Text style={styles.adminPickerLabel}>Chọn admin để chat:</Text>
            <FlatList
              data={admins}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderadmin__item}
              contentContainerStyle={styles.adminList}
            />
          </View>

          <View style={styles.chatContainer}>
            <FlatList
              ref={messagesEndRef}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Nhập tin nhắn của bạn..."
              placeholderTextColor={Colors.lightText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={60}
            color={Colors.primary}
          />
          <Text style={styles.loadingText}>
            Đang tải thông tin người dùng...
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.accent,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: 0.5,
    marginRight:40
  },
  adminPickerContainer: {
    padding: 15,
    backgroundColor: Colors.white,
  },
  adminPickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 10,
    paddingLeft: 5,
  },
  adminList: {
    paddingBottom: 5,
  },
  adminItem: {
    marginRight: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  adminItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  adminAvatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  adminItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    maxWidth: 100,
  },
  selectedText: {
    color: Colors.white,
    fontWeight: "600",
  },
  selectedItem: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 15,
  },
  messageList: {
    paddingVertical: 15,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 20,
    marginVertical: 6,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  adminMessage: {
    alignSelf: "flex-start",
    backgroundColor: Colors.messageBackground,
    borderBottomLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.white,
  },
  adminMessageText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "right",
  },
  timestampUser: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  timestampAdmin: {
    color: Colors.lightText,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 20
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
    marginLeft:10
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.lightText,
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
    marginTop: 20,
  },
});