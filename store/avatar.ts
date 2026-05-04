import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "JASON_AVATAR";

export async function setAvatar(imageUrl: string) {
  await AsyncStorage.setItem(KEY, imageUrl);
}

export async function getAvatar() {
  return await AsyncStorage.getItem(KEY);
}
