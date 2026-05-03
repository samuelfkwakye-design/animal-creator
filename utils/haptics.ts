import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export async function hapticLight() {
  if (Platform.OS === "web") return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function hapticHeavy() {
  if (Platform.OS === "web") return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export async function hapticSuccess() {
  if (Platform.OS === "web") return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function hapticError() {
  if (Platform.OS === "web") return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export async function hapticWarning() {
  if (Platform.OS === "web") return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
