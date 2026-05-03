import { theme } from "@/constants/theme";
import { Animal } from "@/store/zoo";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  animal: Animal;
  onPress?: () => void;
  onDelete?: () => void;
}

export function AnimalCard({ animal, onPress, onDelete }: Props) {
  const date = new Date(animal.createdAt).toLocaleDateString();

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: animal.imageUrl }} style={styles.image} />

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          “{animal.name}”
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {animal.description}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      {onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>×</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12
  },
  image: {
    width: 82,
    height: 82,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.input
  },
  info: {
    flex: 1,
    justifyContent: "center"
  },
  name: {
    color: theme.colors.primaryLight,
    fontFamily: theme.fonts.headingBold,
    fontSize: 19
  },
  description: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 18
  },
  date: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    marginTop: 4
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,95,122,0.14)"
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: 24,
    fontFamily: theme.fonts.headingBold,
    lineHeight: 26
  }
});
