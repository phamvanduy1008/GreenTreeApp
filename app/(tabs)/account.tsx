import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={require("../../assets/images/avatar.png")} //
            style={styles.avatar}
          />
          <View style={styles.profileText}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>Afsar Hossen</Text>
              <Icon
                name="pencil"
                size={16}
                color="green"
                style={styles.editIcon}
              />
            </View>
            <Text style={styles.email}>lmshuvo97@gmail.com</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          <MenuItem icon="cart-outline" title="Đơn đặt hàng" />
          <MenuItem icon="person-outline" title="Chi tiết đơn hàng" />
          <MenuItem icon="location-outline" title="Địa chỉ giao hàng" />
          <MenuItem icon="card-outline" title="Phương thức thanh toán" />
          <MenuItem icon="pricetag-outline" title="Mã khuyến mãi" />
          <MenuItem icon="notifications-outline" title="Thông báo" />
          <MenuItem icon="help-circle-outline" title="Giúp đỡ" />
          <MenuItem icon="information-circle-outline" title="Về" />
        </View>

        {/* Log out button */}
        <TouchableOpacity style={styles.logoutButton}>
          <View style={styles.logoutContent}>
            <Icon
              name="log-out-outline" // Icon từ Ionicons (tương tự)
              size={20}
              color="#00C897"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, title }: { icon: string; title: string }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <Icon name={icon} size={24} color="#333" />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

function TabItem({
  icon,
  title,
  active,
}: {
  icon: string;
  title: string;
  active: boolean;
}) {
  return (
    <TouchableOpacity style={styles.tabItem}>
      <Icon name={icon} size={24} color={active ? "#00C897" : "#999"} />
      <Text
        style={[styles.tabItemText, { color: active ? "#00C897" : "#999" }]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 25,
    paddingTop: 30,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileText: {
    marginLeft: 20,
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  editIcon: {
    marginLeft: 10,
  },
  email: {
    color: "#666",
    marginTop: 5,
    fontSize: 14,
  },
  menuContainer: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#444",
  },
  logoutButton: {
    marginHorizontal: 30,
    marginVertical: 30,
    paddingVertical: 20,
    backgroundColor: "#F2F3F2",
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#00C897",
    fontSize: 17,
    fontWeight: "500",
  },
  tabItem: {
    alignItems: "center",
    paddingHorizontal: 5,
  },
  tabItemText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
});
