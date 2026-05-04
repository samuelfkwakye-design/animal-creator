import { GradientButton } from "@/components/GradientButton";
import { ArtStyleKey, StylePicker } from "@/components/StylePicker";
import { theme } from "@/constants/theme";
import {
    getAnimalImage,
    getAnimalText
} from "@/hooks/useAnimalGenerator";
import { useSpeech } from "@/hooks/useSpeech";
import {
    Achievement,
    unlockAchievement
} from "@/store/achievements";
import { getAvatar, setAvatar } from "@/store/avatar";
import { getAnimals, saveAnimal } from "@/store/zoo";
import { hapticError, hapticSuccess } from "@/utils/haptics";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

const suggestions = [
  "fire lion",
  "rainbow dragon",
  "space elephant",
  "robot tiger"
];

export default function CreateScreen() {
  const [name, setName] = useState("");
  const [style, setStyle] = useState<ArtStyleKey>("3d");

  const [isGenerating, setIsGenerating] = useState(false);
  const [textReady, setTextReady] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const [saved, setSaved] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const [avatar, setAvatarState] = useState<string | null>(null);
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  const { speaking, speak } = useSpeech();

  useEffect(() => {
    getAvatar().then(setAvatarState);
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

  async function handleCreate() {
    if (!name.trim()) return;

    setIsGenerating(true);
    setTextReady(false);
    setImageReady(false);
    setSaved(false);
    setImageUrl(null);
    setDescription("");

    try {
      const { description, imagePrompt } = await getAnimalText(
        name.trim(),
        style
      );

      setDescription(description);
      setTextReady(true);

      await showAchievement("FIRST_ANIMAL");

      getAnimalImage(imagePrompt)
        .then(async (url) => {
          setImageUrl(url);
          setImageReady(true);
          setIsGenerating(false);

          if (!avatar) {
            await setAvatar(url);
            setAvatarState(url);
            await showAchievement("FIRST_AVATAR");
          }
        })
        .catch((err) => {
          console.log(err);
          setIsGenerating(false);
        });
    } catch (error) {
      console.log(error);
      await hapticError();
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!imageUrl || !description || saved) return;

    await saveAnimal({
      name: name.trim(),
      description,
      imageUrl,
      style
    });

    setSaved(true);
    await hapticSuccess();

    const animals = await getAnimals();

    if (animals.length >= 5) {
      await showAchievement("FIVE_ANIMALS");
    }
  }

  async function handleSetAvatar() {
    if (!imageUrl) return;

    await setAvatar(imageUrl);
    setAvatarState(imageUrl);
    await showAchievement("FIRST_AVATAR");
  }

  function reset() {
    setName("");
    setImageUrl(null);
    setDescription("");
    setSaved(false);
    setTextReady(false);
    setImageReady(false);
    setIsGenerating(false);
  }

  return (
    <View style={styles.page}>
      {/* 🔥 ACHIEVEMENT POPUP */}
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <Text style={styles.emoji}>🐾</Text>
          )}

          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hi Jason 👋</Text>
            <Text style={styles.title}>Jason’s Animal World</Text>
            <Text style={styles.subtitle}>
              Create your magical animals ✨
            </Text>
          </View>
        </View>

        <TextInput
          placeholder="Type your animal..."
          placeholderTextColor={theme.colors.muted}
          value={name}
          onChangeText={setName}
          style={styles.input}
          returnKeyType="go"
          onSubmitEditing={handleCreate}
        />

        <StylePicker selected={style} onSelect={setStyle} />

        {!textReady && !isGenerating && (
          <View style={styles.suggestions}>
            {suggestions.map((item) => (
              <GradientButton
                key={item}
                title={item}
                variant="secondary"
                onPress={() => setName(item)}
                style={styles.suggestionButton}
              />
            ))}
          </View>
        )}

        {/* INITIAL LOADING */}
        {isGenerating && !textReady && (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              color={theme.colors.primaryLight}
              size="large"
            />
            <Text style={styles.loadingText}>
              🪄 Creating your animal...
            </Text>
          </View>
        )}

        {/* RESULT */}
        {textReady && (
          <View style={styles.result}>
            <Text style={styles.resultName}>“{name}”</Text>

            {/* 🎨 IMAGE FIRST */}
            {!imageReady && (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={theme.colors.primaryLight} />
                <Text style={styles.loadingText}>
                  🎨 Drawing your animal...
                </Text>
              </View>
            )}

            {imageReady && imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.image} />
            )}

            {/* 🧠 TEXT AFTER */}
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>{description}</Text>
            </View>

            <View style={styles.actions}>
              <GradientButton
                title={speaking ? "🔇 Stop" : "🔊 Read"}
                variant="secondary"
                onPress={() => speak(description)}
                style={styles.actionButton}
              />

              <GradientButton
                title={saved ? "✅ Saved" : "🦁 Save"}
                variant="secondary"
                onPress={handleSave}
                disabled={saved || !imageReady}
                style={styles.actionButton}
              />
            </View>

            {imageReady && (
              <GradientButton
                title="🐾 Make My Avatar"
                variant="secondary"
                onPress={handleSetAvatar}
              />
            )}

            <View style={styles.actions}>
              <GradientButton
                title="🎲 Again"
                variant="secondary"
                onPress={handleCreate}
                style={styles.actionButton}
              />

              <GradientButton
                title="🔄 New"
                variant="ghost"
                onPress={reset}
                style={styles.actionButton}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {!textReady && (
        <View style={styles.bottomBar}>
          <GradientButton
            title={isGenerating ? "✨ Creating..." : "✨ Create It!"}
            onPress={handleCreate}
            disabled={!name.trim() || isGenerating}
          />
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 14
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  headerText: {
    flex: 1
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight
  },
  emoji: {
    fontSize: 42
  },
  greeting: {
    color: theme.colors.muted,
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontFamily: theme.fonts.heading,
    lineHeight: 34
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    fontFamily: theme.fonts.bodyBold
  },
  input: {
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: 18,
    borderRadius: theme.radius.lg,
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.bodyBold
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  suggestionButton: {
    flexGrow: 1
  },
  loadingBox: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  loadingText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 17
  },
  result: {
    gap: 14
  },
  resultName: {
    color: theme.colors.primaryLight,
    fontSize: 24,
    textAlign: "center",
    fontFamily: theme.fonts.headingBold
  },
  image: {
    width: "100%",
    maxHeight: 340,
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder
  },
  descriptionCard: {
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  description: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: theme.fonts.bodyBold
  },
  actions: {
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(8,11,24,0.96)",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  }
});