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
} from "react-native";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "@/app/constants/ip";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/app/constants/Colors";

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
      setMessage(""); // Chỉ xóa nội dung input, không thêm tin nhắn lạc quan
    }
  };

  const renderadmin__item = ({ item }: { item: Admin }) => (
    <TouchableOpacity
      style={[
        styles.admin__item,
        selectedAdmin === item._id && styles.item__selected,
      ]}
      onPress={() => handleSelectAdmin(item._id)}
    >
      <View
        style={[
          styles.item__container,
          {
            backgroundColor:
              selectedAdmin === item._id ? Colors.primary : "#E0E0E0",
          },
        ]}
      >
        <Ionicons
          name="person-circle-outline"
          size={24}
          color={selectedAdmin === item._id ? "#FFFFFF" : "#666"}
          style={styles.admin__icon}
        />
        <Text
          style={[
            styles.admin__itemText,
            selectedAdmin === item._id && styles.text__selected,
          ]}
        >
          {item.name || item.email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isuser__message = item.sender === `user:${userId}`;
    return (
      <View
        style={[
          styles.message__bubble,
          isuser__message ? styles.user__message : styles.admin__message,
        ]}
      >
        <Text style={styles.message__text}>{item.content}</Text>
        <Text
          style={[
            styles.timestamp,
            isuser__message ? styles.timestampUser : styles.timestampAdmin,
          ]}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {userId ? (
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.header__button}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.header__title}>Chat với Admin</Text>
            <View style={styles.header__button} />
          </View>

          {/* Admin Picker */}
          <View style={styles.admin__picker}>
            <FlatList
              data={admins}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderadmin__item}
              contentContainerStyle={styles.admin__list}
            />
          </View>

          {/* Chat Area */}
          <View style={styles.chat__container}>
            <FlatList
              ref={messagesEndRef}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.message__list}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Input Area */}
          <View style={styles.input__container}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity style={styles.send__button} onPress={sendMessage}>
              <Ionicons name="send" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.loading__container}>
          <Text style={styles.loading__text}>
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
    backgroundColor: "#FFFFFF",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginHorizontal: 30,
    marginTop: 50,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header__button: {
    padding: 8,
  },
  header__title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  admin__picker: {
    paddingBottom: 10,
    paddingLeft: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  admin__list: {
    paddingVertical: 5,
  },
  admin__item: {
    marginRight: 15,
    borderRadius: 20,
    overflow: "hidden",
  },
  item__container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  admin__icon: {
    marginRight: 8,
  },
  admin__itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  text__selected: {
    color: "#FFFFFF",
  },
  item__selected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  chat__container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: "#F5F7FA",
  },
  message__list: {
    paddingBottom: 10,
  },
  message__bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  user__message: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
  },
  admin__message: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  message__text: {
    fontSize: 16,
    color: "#333",
    fontWeight: "400",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
  },
  timestampUser: {
    color: "#FFFFFF",
  },
  timestampAdmin: {
    color: "#999",
  },
  input__container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    marginRight: 10,
    maxHeight: 100,
  },
  send__button: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loading__container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading__text: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});