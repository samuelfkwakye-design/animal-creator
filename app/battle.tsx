import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function BattleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ Animal Battle</Text>
      <Text style={styles.text}>Battle mode will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 30
  },
  text: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold
  }
});
