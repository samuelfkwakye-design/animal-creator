import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🐾</Text>
      <Text style={styles.title}>Animal Creator</Text>
      <Text style={styles.subtitle}>Create screen coming next</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.screen
  },
  emoji: {
    fontSize: 72
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 34
  },
  subtitle: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16
  }
});
