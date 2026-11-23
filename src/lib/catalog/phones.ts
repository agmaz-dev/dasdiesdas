// Smartphone-Hersteller mit Modellen (neueste zuerst).
export const PHONE_MODELS: Record<string, readonly string[]> = {
  Apple: ["iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone Air", "iPhone 17", "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 16e", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini", "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 12 mini", "iPhone SE (2022)", "iPhone SE (2020)", "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11", "iPhone XS Max", "iPhone XS", "iPhone XR", "iPhone X", "iPhone 8 Plus", "iPhone 8", "iPhone 7 Plus", "iPhone 7", "Älteres iPhone"],
  Samsung: ["Galaxy S25 Ultra", "Galaxy S25 Edge", "Galaxy S25+", "Galaxy S25", "Galaxy S25 FE", "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S24 FE", "Galaxy S23 Ultra", "Galaxy S23+", "Galaxy S23", "Galaxy S23 FE", "Galaxy S22 Ultra", "Galaxy S22+", "Galaxy S22", "Galaxy S21 Ultra", "Galaxy S21+", "Galaxy S21", "Galaxy S21 FE", "Galaxy S20 Ultra", "Galaxy S20+", "Galaxy S20", "Galaxy S20 FE", "Galaxy S10+", "Galaxy S10", "Galaxy S10e", "Galaxy Z Fold7", "Galaxy Z Fold6", "Galaxy Z Fold5", "Galaxy Z Fold4", "Galaxy Z Fold3", "Galaxy Z Flip7", "Galaxy Z Flip7 FE", "Galaxy Z Flip6", "Galaxy Z Flip5", "Galaxy Z Flip4", "Galaxy Z Flip3", "Galaxy Note 20 Ultra", "Galaxy Note 20", "Galaxy Note 10", "Galaxy A56", "Galaxy A55", "Galaxy A54", "Galaxy A53", "Galaxy A52", "Galaxy A36", "Galaxy A35", "Galaxy A34", "Galaxy A26", "Galaxy A25", "Galaxy A16", "Galaxy A15", "Galaxy A14", "Galaxy A13", "Galaxy A05s", "Galaxy XCover 7", "Älteres Galaxy"],
  Google: ["Pixel 10 Pro Fold", "Pixel 10 Pro XL", "Pixel 10 Pro", "Pixel 10", "Pixel 9 Pro Fold", "Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 9a", "Pixel 8 Pro", "Pixel 8", "Pixel 8a", "Pixel Fold", "Pixel 7 Pro", "Pixel 7", "Pixel 7a", "Pixel 6 Pro", "Pixel 6", "Pixel 6a", "Älteres Pixel"],
  Xiaomi: ["Xiaomi 15 Ultra", "Xiaomi 15", "Xiaomi 15T Pro", "Xiaomi 15T", "Xiaomi 14 Ultra", "Xiaomi 14", "Xiaomi 14T Pro", "Xiaomi 14T", "Xiaomi 13T Pro", "Xiaomi 13T", "Xiaomi 13", "Xiaomi 12", "Redmi Note 14 Pro+", "Redmi Note 14 Pro", "Redmi Note 14", "Redmi Note 13 Pro+", "Redmi Note 13 Pro", "Redmi Note 13", "Redmi Note 12", "Redmi 14C", "Redmi 13C", "Poco F7", "Poco F6", "Poco X7 Pro", "Poco X6 Pro", "Poco M6"],
  OnePlus: ["OnePlus 13", "OnePlus 13R", "OnePlus 12", "OnePlus 12R", "OnePlus 11", "OnePlus 10 Pro", "OnePlus Open", "Nord 5", "Nord 4", "Nord CE4", "Nord CE 3 Lite"],
  Huawei: ["Pura 70 Ultra", "Pura 70 Pro", "P60 Pro", "P50 Pro", "P40 Pro", "P30 Pro", "Mate 50 Pro", "Mate X3", "Nova 12"],
  Honor: ["Magic7 Pro", "Magic6 Pro", "Magic V3", "400", "200 Pro", "200", "90", "X8"],
  Motorola: ["Edge 50 Ultra", "Edge 50 Pro", "Edge 40", "Razr 50 Ultra", "Razr 50", "Razr 40", "Moto g85", "Moto g84", "Moto g54", "Moto g24", "Moto g15"],
  Nokia: ["3310", "8210 4G", "G22", "G42", "X30", "XR21"],
  Oppo: ["Find X8 Pro", "Find X8", "Find X7 Ultra", "Find N3", "Reno12 Pro", "Reno12", "A80", "A79"],
  Sony: ["Xperia 1 VI", "Xperia 1 V", "Xperia 5 V", "Xperia 10 VI", "Xperia 10 V"],
  Fairphone: ["Fairphone 5", "Fairphone 4", "Fairphone 3"],
  Nothing: ["Phone (3)", "Phone (3a)", "Phone (2)", "Phone (2a)", "Phone (1)", "CMF Phone 1"],
};

export const TABLET_MODELS: Record<string, readonly string[]> = {
  Apple: ["iPad Pro 13\"", "iPad Pro 11\"", "iPad Air 13\"", "iPad Air 11\"", "iPad", "iPad mini", "Älteres iPad"],
  Samsung: ["Galaxy Tab S10 Ultra", "Galaxy Tab S10+", "Galaxy Tab S10 FE", "Galaxy Tab S9 Ultra", "Galaxy Tab S9+", "Galaxy Tab S9", "Galaxy Tab S9 FE", "Galaxy Tab S8", "Galaxy Tab A9+", "Galaxy Tab A9", "Galaxy Tab A8", "Älteres Galaxy Tab"],
  Microsoft: ["Surface Pro", "Surface Go", "Älteres Surface"],
  Lenovo: ["Tab P12", "Tab P11", "Tab M11", "Tab M10", "Yoga Tab"],
  Xiaomi: ["Pad 7", "Pad 6", "Redmi Pad Pro", "Redmi Pad SE"],
  Huawei: ["MatePad Pro", "MatePad 11.5", "MatePad SE"],
  Amazon: ["Fire HD 10", "Fire HD 8", "Fire 7", "Fire Max 11", "Kindle", "Kindle Paperwhite", "Kindle Oasis", "Kindle Scribe", "Kindle Colorsoft"],
  Tolino: ["Shine", "Vision", "Epos", "Page"],
  Kobo: ["Clara", "Libra", "Sage", "Elipsa"],
  reMarkable: ["reMarkable 2", "reMarkable Paper Pro"],
};
