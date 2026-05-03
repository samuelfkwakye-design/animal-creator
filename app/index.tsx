import { GradientButton } from "@/components/GradientButton";
import { ArtStyleKey, StylePicker } from "@/components/StylePicker";
import { theme } from "@/constants/theme";
import { generateAnimal } from "@/hooks/useAnimalGenerator";
import { useSpeech } from "@/hooks/useSpeech";
import { saveAnimal } from "@/store/zoo";
import { hapticError, hapticSuccess } from "@/utils/haptics";
import { useState } from "react";
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
  "blue wolf with fire wings",
  "tiny space elephant",
  "rainbow dragon cat",
  "golden lion fish",
  "moon rabbit unicorn",
  "robot tiger"
];

export default function CreateScreen() {
  const [name, setName] = useState("");
  const [style, setStyle] = useState<ArtStyleKey>("cartoon");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const { speaking, speak } = useSpeech();

  async function handleCreate() {
    if (!name.trim()) return;

    setLoading(true);
    setSaved(false);

    try {
      const result = await generateAnimal(name.trim(), style);
      setImageUrl(result.imageUrl);
      setDescription(result.description);
      await hapticSuccess();
    } catch (error) {
      console.log(error);
      await hapticError();
    } finally {
      setLoading(false);
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
  }

  function reset() {
    setName("");
    setImageUrl(null);
    setDescription("");
    setSaved(false);
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>Animal Creator</Text>
        <Text style={styles.subtitle}>Type any animal you can imagine</Text>
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

      <GradientButton
        title="✨ Create It!"
        onPress={handleCreate}
        disabled={!name.trim() || loading}
        loading={loading}
      />

      {!imageUrl && !loading && (
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

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primaryLight} size="large" />
          <Text style={styles.loadingText}>Creating magic...</Text>
        </View>
      )}

      {imageUrl && (
        <View style={styles.result}>
          <Text style={styles.resultName}>“{name}”</Text>

          <Image source={{ uri: imageUrl }} style={styles.image} />

          <View style={styles.descriptionCard}>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.actions}>
            <GradientButton
              title={speaking ? "🔇 Stop" : "🔊 Read it!"}
              variant="secondary"
              onPress={() => speak(description)}
              style={styles.actionButton}
            />
            <GradientButton
              title={saved ? "✅ Saved!" : "🦁 Save"}
              variant="secondary"
              onPress={handleSave}
              disabled={saved}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.actions}>
            <GradientButton
              title="🎲 Surprise!"
              variant="secondary"
              onPress={handleCreate}
              style={styles.actionButton}
            />
            <GradientButton
              title="🔄 New Animal"
              variant="ghost"
              onPress={reset}
              style={styles.actionButton}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  container: {
    padding: theme.spacing.screen,
    gap: 16,
    paddingBottom: 110
  },
  header: {
    alignItems: "center",
    marginTop: 20
  },
  emoji: {
    fontSize: 58
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    fontFamily: theme.fonts.heading
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    fontFamily: theme.fonts.bodyBold
  },
  input: {
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: 18,
    borderRadius: theme.radius.lg,
    color: theme.colors.text,
    fontSize: 18,
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
    alignItems: "center",
    gap: 10,
    marginTop: 24
  },
  loadingText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold
  },
  result: {
    gap: 16,
    marginTop: 10
  },
  resultName: {
    color: theme.colors.primaryLight,
    fontSize: 26,
    textAlign: "center",
    fontFamily: theme.fonts.headingBold
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder
  },
  descriptionCard: {
    padding: 18,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  description: {
    color: theme.colors.text,
    fontSize: 17,
    lineHeight: 27,
    textAlign: "center",
    fontFamily: theme.fonts.bodyBold
  },
  actions: {
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1
  }
});