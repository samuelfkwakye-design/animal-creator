import { GradientButton } from "@/components/GradientButton";
import { theme } from "@/constants/theme";
import {
    Achievement,
    unlockAchievement
} from "@/store/achievements";
import { Animal, getAnimals } from "@/store/zoo";
import { hapticError, hapticSuccess } from "@/utils/haptics";
import { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function BattleScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [fighterOne, setFighterOne] = useState<Animal | null>(null);
  const [fighterTwo, setFighterTwo] = useState<Animal | null>(null);
  const [winner, setWinner] = useState<Animal | null>(null);
  const [story, setStory] = useState("");
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    getAnimals().then(setAnimals);
  }, []);

  async function showAchievement(id: Parameters<typeof unlockAchievement>[0]) {
    const unlocked = await unlockAchievement(id);

    if (!unlocked) return;

    setAchievement(unlocked);
    await hapticSuccess();

    setTimeout(() => {
      setAchievement(null);
    }, 3500);
  }

  function chooseAnimal(animal: Animal) {
    if (!fighterOne) {
      setFighterOne(animal);
      setWinner(null);
      setStory("");
      return;
    }

    if (fighterOne.id === animal.id) return;

    setFighterTwo(animal);
    setWinner(null);
    setStory("");
  }

  async function startBattle() {
    if (!fighterOne || !fighterTwo) {
      await hapticError();
      return;
    }

    const fighters = [fighterOne, fighterTwo];
    const chosenWinner = fighters[Math.floor(Math.random() * fighters.length)];

    setWinner(chosenWinner);
    setStory(
      `${fighterOne.name} and ${fighterTwo.name} had a magical battle! ${chosenWinner.name} used a super special power and became today’s champion!`
    );

    await showAchievement("FIRST_BATTLE");
  }

  function resetBattle() {
    setFighterOne(null);
    setFighterTwo(null);
    setWinner(null);
    setStory("");
  }

  return (
    <View style={styles.page}>
      {achievement && (
        <View style={styles.achievementToast}>
          <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
          <View style={styles.achievementTextBox}>
            <Text style={styles.achievementTitle}>
              Achievement unlocked!
            </Text>
            <Text style={styles.achievementName}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>⚔️ Animal Battle</Text>
        <Text style={styles.subtitle}>
          Pick two animals from Jason’s Zoo.
        </Text>

        {animals.length < 2 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🦁</Text>
            <Text style={styles.emptyTitle}>Save 2 animals first</Text>
            <Text style={styles.emptyText}>
              Create and save at least two animals before starting a battle.
            </Text>
          </View>
        )}

        {animals.length >= 2 && (
          <>
            <View style={styles.fighterRow}>
              <View style={styles.fighterBox}>
                {fighterOne ? (
                  <>
                    <Image
                      source={{ uri: fighterOne.imageUrl }}
                      style={styles.fighterImage}
                    />
                    <Text style={styles.fighterName}>
                      {fighterOne.name}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.pickText}>Pick animal 1</Text>
                )}
              </View>

              <Text style={styles.vs}>VS</Text>

              <View style={styles.fighterBox}>
                {fighterTwo ? (
                  <>
                    <Image
                      source={{ uri: fighterTwo.imageUrl }}
                      style={styles.fighterImage}
                    />
                    <Text style={styles.fighterName}>
                      {fighterTwo.name}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.pickText}>Pick animal 2</Text>
                )}
              </View>
            </View>

            <GradientButton
              title="⚔️ Start Battle"
              onPress={startBattle}
              disabled={!fighterOne || !fighterTwo}
            />

            {winner && (
              <View style={styles.winnerCard}>
                <Text style={styles.winnerLabel}>🏆 Winner</Text>
                <Image
                  source={{ uri: winner.imageUrl }}
                  style={styles.winnerImage}
                />
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.story}>{story}</Text>
              </View>
            )}

            <GradientButton
              title="🔄 New Battle"
              variant="secondary"
              onPress={resetBattle}
            />

            <Text style={styles.sectionTitle}>Choose fighters</Text>

            <View style={styles.grid}>
              {animals.map((animal) => {
                const selected =
                  fighterOne?.id === animal.id || fighterTwo?.id === animal.id;

                return (
                  <View
                    key={animal.id}
                    style={[
                      styles.animalCard,
                      selected && styles.selectedCard
                    ]}
                  >
                    <Image
                      source={{ uri: animal.imageUrl }}
                      style={styles.animalImage}
                    />
                    <Text style={styles.animalName}>{animal.name}</Text>

                    <GradientButton
                      title={selected ? "✅ Picked" : "Pick"}
                      variant="secondary"
                      onPress={() => chooseAnimal(animal)}
                      disabled={selected}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  achievementToast: {
    position: "absolute",
    top: 18,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight
  },
  achievementEmoji: {
    fontSize: 38
  },
  achievementTextBox: {
    flex: 1
  },
  achievementTitle: {
    color: theme.colors.primaryLight,
    fontSize: 13,
    fontFamily: theme.fonts.bodyBold
  },
  achievementName: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.headingBold
  },
  achievementDescription: {
    color: theme.colors.muted,
    fontSize: 13,
    fontFamily: theme.fonts.bodyBold
  },
  container: {
    padding: 16,
    paddingBottom: 120,
    gap: 16
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 32
  },
  subtitle: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  emptyCard: {
    alignItems: "center",
    padding: 24,
    gap: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  emptyEmoji: {
    fontSize: 50
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: theme.fonts.headingBold,
    textAlign: "center"
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 15,
    fontFamily: theme.fonts.bodyBold,
    textAlign: "center",
    lineHeight: 22
  },
  fighterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  fighterBox: {
    flex: 1,
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10
  },
  fighterImage: {
    width: "100%",
    height: 110,
    resizeMode: "contain",
    borderRadius: theme.radius.md
  },
  fighterName: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.headingBold,
    textAlign: "center"
  },
  pickText: {
    color: theme.colors.muted,
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold,
    textAlign: "center"
  },
  vs: {
    color: theme.colors.primaryLight,
    fontSize: 18,
    fontFamily: theme.fonts.headingBold
  },
  winnerCard: {
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight
  },
  winnerLabel: {
    color: theme.colors.primaryLight,
    fontSize: 18,
    fontFamily: theme.fonts.headingBold
  },
  winnerImage: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    borderRadius: theme.radius.lg
  },
  winnerName: {
    color: theme.colors.text,
    fontSize: 26,
    fontFamily: theme.fonts.headingBold,
    textAlign: "center"
  },
  story: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: theme.fonts.bodyBold,
    textAlign: "center"
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: theme.fonts.headingBold
  },
  grid: {
    gap: 14
  },
  animalCard: {
    gap: 10,
    padding: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  selectedCard: {
    borderColor: theme.colors.primaryLight,
    borderWidth: 2
  },
  animalImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.input
  },
  animalName: {
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.headingBold,
    textAlign: "center"
  }
});