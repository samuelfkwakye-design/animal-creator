import { AnimalCard } from "@/components/AnimalCard";
import { GradientButton } from "@/components/GradientButton";
import { theme } from "@/constants/theme";
import { useSpeech } from "@/hooks/useSpeech";
import { Animal, deleteAnimal, getAnimals } from "@/store/zoo";
import { hapticWarning } from "@/utils/haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function ZooScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selected, setSelected] = useState<Animal | null>(null);
  const { speaking, speak, stop } = useSpeech();

  async function loadAnimals() {
    const data = await getAnimals();
    setAnimals(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadAnimals();
    }, [])
  );

  async function removeAnimal(animal: Animal) {
    Alert.alert("Remove animal?", `Remove “${animal.name}” from your zoo?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteAnimal(animal.id);
          await hapticWarning();
          setSelected(null);
          loadAnimals();
        }
      }
    ]);
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🦁</Text>
        <Text style={styles.title}>My Zoo</Text>
        <Text style={styles.subtitle}>{animals.length} saved animals</Text>
      </View>

      {animals.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌿</Text>
          <Text style={styles.emptyTitle}>Your zoo is empty</Text>
          <Text style={styles.emptyText}>
            Create an animal and tap Save to Zoo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={animals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AnimalCard
              animal={item}
              onPress={() => setSelected(item)}
              onDelete={() => removeAnimal(item)}
            />
          )}
        />
      )}

      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {selected && (
              <>
                <Pressable
                  onPress={() => {
                    stop();
                    setSelected(null);
                  }}
                  style={styles.close}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>

                <Text style={styles.modalName}>“{selected.name}”</Text>

                <Image source={{ uri: selected.imageUrl }} style={styles.modalImage} />

                <View style={styles.descriptionCard}>
                  <Text style={styles.description}>{selected.description}</Text>
                </View>

                <View style={styles.badges}>
                  <Text style={styles.badge}>Style: {selected.style}</Text>
                  <Text style={styles.badge}>
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.grid}>
                  <GradientButton
                    title={speaking ? "🔇 Stop" : "🔊 Read"}
                    variant="secondary"
                    onPress={() => speak(selected.description)}
                    style={styles.gridButton}
                  />
                  <GradientButton
                    title="🗑️ Remove"
                    variant="danger"
                    onPress={() => removeAnimal(selected)}
                    style={styles.gridButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.screen
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 18
  },
  emoji: {
    fontSize: 54
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 34
  },
  subtitle: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  list: {
    paddingBottom: 110
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  emptyEmoji: {
    fontSize: 76
  },
  emptyTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.headingBold,
    fontSize: 26
  },
  emptyText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    textAlign: "center"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end"
  },
  modal: {
    backgroundColor: "#0d1024",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    gap: 14,
    maxHeight: "92%"
  },
  close: {
    alignSelf: "flex-start",
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  closeText: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 30
  },
  modalName: {
    color: theme.colors.primaryLight,
    fontFamily: theme.fonts.headingBold,
    fontSize: 27,
    textAlign: "center"
  },
  modalImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.input
  },
  descriptionCard: {
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card
  },
  description: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center"
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  badge: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full
  },
  grid: {
    flexDirection: "row",
    gap: 10
  },
  gridButton: {
    flex: 1
  }
});