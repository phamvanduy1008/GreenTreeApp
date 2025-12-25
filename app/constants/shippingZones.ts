export type ShippingZoneKey =
  | "NOI_THANH"
  | "VUNG_1"
  | "VUNG_2";

export const SHIPPING_ZONES: Readonly<Record<
  ShippingZoneKey,
  Readonly<{
    name: string;
    fee: number;
    provinces: readonly number[];
  }>
>> = Object.freeze({
  NOI_THANH: Object.freeze({
    name: "Nội thành",
    fee: 20000,
    provinces: Object.freeze([1, 48, 79]),
  }),

  VUNG_1: Object.freeze({
    name: "Vùng 1",
    fee: 30000,
    provinces: Object.freeze([
      // Gần HN (Miền Bắc lân cận)
      19, // Thái Nguyên
      22, // Quảng Ninh
      24, // Bắc Giang
      25, // Phú Thọ
      26, // Vĩnh Phúc
      27, // Bắc Ninh
      30, // Hải Dương
      31, // Hải Phòng
      33, // Hưng Yên
      34, // Thái Bình
      35, // Hà Nam
      36, // Nam Định
      37, // Ninh Bình
      38, // Thanh Hóa
      // Gần HCM (Miền Nam lân cận)
      70, // Bình Phước
      72, // Tây Ninh
      74, // Bình Dương
      75, // Đồng Nai
      77, // Bà Rịa - Vũng Tàu
      80, // Long An
      82, // Tiền Giang
      83, // Bến Tre
      84, // Trà Vinh
      87, // Đồng Tháp
      // Gần ĐN (Miền Trung lân cận)
      40, // Nghệ An
      42, // Hà Tĩnh
      44, // Quảng Bình
      45, // Quảng Trị
      46, // Thừa Thiên Huế
      49, // Quảng Nam
      51, // Quảng Ngãi
      52, // Bình Định
      54, // Phú Yên
      56, // Khánh Hòa
      58, // Ninh Thuận
      60, // Bình Thuận
      92, // Cần Thơ
    ]),
  }),

  VUNG_2: Object.freeze({
    name: "Vùng 2",
    fee: 40000,
    provinces: Object.freeze([
      // Miền Bắc xa (miền núi, biên giới)
      2,  // Hà Giang
      4,  // Cao Bằng
      6,  // Bắc Kạn
      8,  // Tuyên Quang
      10, // Lào Cai
      11, // Điện Biên
      12, // Lai Châu
      14, // Sơn La
      15, // Yên Bái
      17, // Hòa Bình
      20, // Lạng Sơn
      // Miền Nam xa (ĐBSCL xa, đảo)
      86, // Vĩnh Long
      89, // An Giang
      91, // Kiên Giang
      93, // Hậu Giang
      94, // Sóc Trăng
      95, // Bạc Liêu
      96, // Cà Mau
      // Tây Nguyên (địa hình khó khăn)
      62, // Kon Tum
      64, // Gia Lai
      66, // Đắk Lắk
      67, // Đắk Nông
      68, // Lâm Đồng
    ]),
  }),
});


const provinceToZoneMap: Readonly<Record<number, ShippingZoneKey>> = Object.freeze(
  (() => {
    const map: Record<number, ShippingZoneKey> = {};
    (Object.keys(SHIPPING_ZONES) as ShippingZoneKey[]).forEach((zoneKey) => {
      SHIPPING_ZONES[zoneKey].provinces.forEach((provinceCode) => {
        map[provinceCode] = zoneKey;
      });
    });
    return map;
  })()
);


export const getShippingFee = (provinceCode?: number): number => {
  if (!provinceCode || provinceCode < 1 || provinceCode > 96) return 30000;
  const zoneKey = provinceToZoneMap[provinceCode];
  return zoneKey ? SHIPPING_ZONES[zoneKey].fee : 30000;
};


export const getShippingZone = (provinceCode?: number): string => {
  if (!provinceCode || provinceCode < 1 || provinceCode > 96) return "Vùng 1 (Gần nội thành)";
  const zoneKey = provinceToZoneMap[provinceCode];
  return zoneKey ? SHIPPING_ZONES[zoneKey].name : "Vùng 1 (Gần nội thành)";
};


const PROVINCE_NAME_TO_CODE: Readonly<Record<string, number>> = Object.freeze({
  // Nội thành
  "Thành phố Hà Nội": 1, "Hà Nội": 1,
  "Thành phố Đà Nẵng": 48, "Đà Nẵng": 48,
  "Thành phố Hồ Chí Minh": 79, "Hồ Chí Minh": 79, "TP. Hồ Chí Minh": 79, "TP.HCM": 79,
  // Vùng 1 - Miền Bắc/HN
  "Tỉnh Thái Nguyên": 19, "Thái Nguyên": 19,
  "Tỉnh Quảng Ninh": 22, "Quảng Ninh": 22,
  "Tỉnh Bắc Giang": 24, "Bắc Giang": 24,
  "Tỉnh Phú Thọ": 25, "Phú Thọ": 25,
  "Tỉnh Vĩnh Phúc": 26, "Vĩnh Phúc": 26,
  "Tỉnh Bắc Ninh": 27, "Bắc Ninh": 27,
  "Tỉnh Hải Dương": 30, "Hải Dương": 30,
  "Thành phố Hải Phòng": 31, "Hải Phòng": 31,
  "Tỉnh Hưng Yên": 33, "Hưng Yên": 33,
  "Tỉnh Thái Bình": 34, "Thái Bình": 34,
  "Tỉnh Hà Nam": 35, "Hà Nam": 35,
  "Tỉnh Nam Định": 36, "Nam Định": 36,
  "Tỉnh Ninh Bình": 37, "Ninh Bình": 37,
  "Tỉnh Thanh Hóa": 38, "Thanh Hóa": 38,
  // Vùng 1 - Miền Nam/HCM
  "Tỉnh Bình Phước": 70, "Bình Phước": 70,
  "Tỉnh Tây Ninh": 72, "Tây Ninh": 72,
  "Tỉnh Bình Dương": 74, "Bình Dương": 74,
  "Tỉnh Đồng Nai": 75, "Đồng Nai": 75,
  "Tỉnh Bà Rịa - Vũng Tàu": 77, "Bà Rịa - Vũng Tàu": 77, "Bà Rịa – Vũng Tàu": 77,
  "Tỉnh Long An": 80, "Long An": 80,
  "Tỉnh Tiền Giang": 82, "Tiền Giang": 82,
  "Tỉnh Bến Tre": 83, "Bến Tre": 83,
  "Tỉnh Trà Vinh": 84, "Trà Vinh": 84,
  "Tỉnh Đồng Tháp": 87, "Đồng Tháp": 87,
  // Vùng 1 - Miền Trung/ĐN
  "Tỉnh Nghệ An": 40, "Nghệ An": 40,
  "Tỉnh Hà Tĩnh": 42, "Hà Tĩnh": 42,
  "Tỉnh Quảng Bình": 44, "Quảng Bình": 44,
  "Tỉnh Quảng Trị": 45, "Quảng Trị": 45,
  "Tỉnh Thừa Thiên Huế": 46, "Thừa Thiên Huế": 46, "Huế": 46,
  "Tỉnh Quảng Nam": 49, "Quảng Nam": 49,
  "Tỉnh Quảng Ngãi": 51, "Quảng Ngãi": 51,
  "Tỉnh Bình Định": 52, "Bình Định": 52,
  "Tỉnh Phú Yên": 54, "Phú Yên": 54,
  "Tỉnh Khánh Hòa": 56, "Khánh Hòa": 56,
  "Tỉnh Ninh Thuận": 58, "Ninh Thuận": 58,
  "Tỉnh Bình Thuận": 60, "Bình Thuận": 60,
  "Thành phố Cần Thơ": 92, "Cần Thơ": 92,
  // Vùng 2 - Miền Bắc xa
  "Tỉnh Hà Giang": 2, "Hà Giang": 2,
  "Tỉnh Cao Bằng": 4, "Cao Bằng": 4,
  "Tỉnh Bắc Kạn": 6, "Bắc Kạn": 6,
  "Tỉnh Tuyên Quang": 8, "Tuyên Quang": 8,
  "Tỉnh Lào Cai": 10, "Lào Cai": 10,
  "Tỉnh Điện Biên": 11, "Điện Biên": 11,
  "Tỉnh Lai Châu": 12, "Lai Châu": 12,
  "Tỉnh Sơn La": 14, "Sơn La": 14,
  "Tỉnh Yên Bái": 15, "Yên Bái": 15,
  "Tỉnh Hòa Bình": 17, "Hòa Bình": 17,
  "Tỉnh Lạng Sơn": 20, "Lạng Sơn": 20,
  // Vùng 2 - Miền Nam xa
  "Tỉnh Vĩnh Long": 86, "Vĩnh Long": 86,
  "Tỉnh An Giang": 89, "An Giang": 89,
  "Tỉnh Kiên Giang": 91, "Kiên Giang": 91,
  "Tỉnh Hậu Giang": 93, "Hậu Giang": 93,
  "Tỉnh Sóc Trăng": 94, "Sóc Trăng": 94,
  "Tỉnh Bạc Liêu": 95, "Bạc Liêu": 95,
  "Tỉnh Cà Mau": 96, "Cà Mau": 96,
  // Vùng 2 - Tây Nguyên
  "Tỉnh Kon Tum": 62, "Kon Tum": 62,
  "Tỉnh Gia Lai": 64, "Gia Lai": 64,
  "Tỉnh Đắk Lắk": 66, "Đắk Lắk": 66,
  "Tỉnh Đắk Nông": 67, "Đắk Nông": 67,
  "Tỉnh Lâm Đồng": 68, "Lâm Đồng": 68,
});


export const getProvinceCodeFromName = (provinceName?: string): number => {
  if (!provinceName?.trim()) return 48;
  return PROVINCE_NAME_TO_CODE[provinceName.trim()] ?? 48;
};