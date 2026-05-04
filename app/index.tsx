import { GradientButton } from "@/components/GradientButton";
import { ArtStyleKey, StylePicker } from "@/components/StylePicker";
import { theme } from "@/constants/theme";
import { getAnimalImage, getAnimalText } from "@/hooks/useAnimalGenerator";
import { useSpeech } from "@/hooks/useSpeech";
import { Achievement, unlockAchievement } from "@/store/achievements";
import { getAvatar, setAvatar } from "@/store/avatar";
import { getAnimals, saveAnimal } from "@/store/zoo";
import { hapticError, hapticSuccess } from "@/utils/haptics";
import * as Speech from "expo-speech";
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

const suggestions = [
  "magic castle",
  "space rocket",
  "rainbow car",
  "robot dog",
  "superhero cat",
  "underwater house"
];

export default function CreateScreen() {
  const [name, setName] = useState("");
  const [style, setStyle] = useState<ArtStyleKey>("3d");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [textReady, setTextReady] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const [saved, setSaved] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const [avatar, setAvatarState] = useState<string | null>(null);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const imageFade = useRef(new Animated.Value(0)).current;
  const micPulse = useRef(new Animated.Value(1)).current;
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { speaking, speak } = useSpeech();

  function clearListenTimer() {
    if (listenTimer.current) {
      clearTimeout(listenTimer.current);
      listenTimer.current = null;
    }
  }

  function stopListening() {
    clearListenTimer();
    setIsListening(false);

    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.log("Stop speech error:", error);
    }
  }

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    clearListenTimer();
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    console.log("Speech result:", event.results);

    const spokenText = event.results[0]?.transcript;

    if (spokenText) {
      setName(spokenText.trim().toLowerCase());
      stopListening();
    }
  });

  useSpeechRecognitionEvent("error", async (event) => {
    console.log("Speech error:", event.error, event.message);
    stopListening();
    await hapticError();
  });

  useEffect(() => {
    getAvatar().then(setAvatarState);
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      clearListenTimer();
    };
  }, []);

  useEffect(() => {
    if (!isListening) {
      micPulse.stopAnimation();
      micPulse.setValue(1);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, {
          toValue: 1.06,
          duration: 450,
          useNativeDriver: true
        }),
        Animated.timing(micPulse, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [isListening, micPulse]);

  function fadeInImage() {
    imageFade.setValue(0);

    Animated.timing(imageFade, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true
    }).start();
  }

  async function showAchievement(id: Parameters<typeof unlockAchievement>[0]) {
    const unlocked = await unlockAchievement(id);

    if (!unlocked) return;

    setAchievement(unlocked);
    await hapticSuccess();
  }

  async function handleListen() {
    try {
      if (isListening) {
        stopListening();
        return;
      }

      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        await hapticError();
        Alert.alert("Microphone needed", "Please allow microphone access.");
        return;
      }

      await hapticSuccess();
      setIsListening(true);

      ExpoSpeechRecognitionModule.start({
        lang: "en-GB",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false
      });

      clearListenTimer();

      listenTimer.current = setTimeout(() => {
        stopListening();
      }, 6000);
    } catch (error) {
      console.log(error);
      stopListening();
      await hapticError();
    }
  }

  function getCreationSound(prompt: string) {
    const lower = prompt.toLowerCase();

    if (lower.includes("cat")) return "Meow meow!";
    if (lower.includes("dog") || lower.includes("puppy")) return "Woof woof!";
    if (lower.includes("lion") || lower.includes("tiger")) return "Roar!";
    if (lower.includes("bird") || lower.includes("parrot")) return "Tweet tweet!";
    if (lower.includes("cow")) return "Moo!";
    if (lower.includes("duck")) return "Quack quack!";
    if (lower.includes("frog")) return "Ribbit ribbit!";
    if (lower.includes("sheep")) return "Baa!";
    if (lower.includes("pig")) return "Oink oink!";
    if (lower.includes("horse")) return "Neigh!";
    if (lower.includes("elephant")) return "Trumpet!";
    if (lower.includes("dragon")) return "Roar sparkle roar!";
    if (lower.includes("robot")) return "Beep boop!";
    if (lower.includes("rocket")) return "Whoosh!";
    if (lower.includes("car")) return "Vroom vroom!";
    if (lower.includes("castle")) return "Magic sparkle!";
    if (lower.includes("train")) return "Choo choo!";

    return "Sparkle sparkle!";
  }

  async function handleCreationSound() {
    if (!name.trim()) return;

    await hapticSuccess();

    Speech.stop();
    Speech.speak(getCreationSound(name), {
      rate: 0.85,
      pitch: 1.25
    });
  }

  async function handleCreate() {
    if (!name.trim()) return;

    Keyboard.dismiss();
    setMenuOpen(false);
    stopListening();

    setIsGenerating(true);
    setTextReady(false);
    setImageReady(false);
    setSaved(false);
    setImageUrl(null);
    setDescription("");
    imageFade.setValue(0);

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
          fadeInImage();

          if (!avatar) {
            await setAvatar(url);
            setAvatarState(url);
            await showAchievement("FIRST_AVATAR");
          }
        })
        .catch(async (err) => {
          console.log(err);
          await hapticError();
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
    setMenuOpen(false);
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
    setMenuOpen(false);
    await showAchievement("FIRST_AVATAR");
  }

  function handleRead() {
    if (!description) return;
    speak(description);
    setMenuOpen(false);
  }

  function reset() {
    stopListening();
    setName("");
    setImageUrl(null);
    setDescription("");
    setSaved(false);
    setTextReady(false);
    setImageReady(false);
    setIsGenerating(false);
    setMenuOpen(false);
    imageFade.setValue(0);
  }

  function showComingSoon(title: string) {
    setMenuOpen(false);
    Alert.alert(title, "This will be added soon.");
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 150 + keyboardHeight }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <Text style={styles.emoji}>✨</Text>
            )}

            <View style={styles.headerText}>
              <Text style={styles.greeting}>Hi Jason 👋</Text>
              <Text style={styles.title}>Magic Creator</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setMenuOpen((current) => !current)}
            style={styles.menuButton}
          >
            <Text style={styles.menuButtonText}>☰</Text>
          </Pressable>
        </View>

        {menuOpen && (
          <View style={styles.menuPanel}>
            <Text style={styles.menuTitle}>Menu</Text>

            <Pressable
              onPress={handleSave}
              disabled={!imageReady || saved}
              style={[
                styles.menuItem,
                (!imageReady || saved) && styles.menuItemDisabled
              ]}
            >
              <Text style={styles.menuItemText}>
                {saved ? "✅ Saved" : "💾 Save Creation"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleRead}
              disabled={!description}
              style={[styles.menuItem, !description && styles.menuItemDisabled]}
            >
              <Text style={styles.menuItemText}>
                {speaking ? "🔇 Stop Reading" : "🔊 Read Aloud"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSetAvatar}
              disabled={!imageReady}
              style={[styles.menuItem, !imageReady && styles.menuItemDisabled]}
            >
              <Text style={styles.menuItemText}>🙂 Make Avatar</Text>
            </Pressable>

            <Pressable onPress={reset} style={styles.menuItem}>
              <Text style={styles.menuItemText}>🔄 New Creation</Text>
            </Pressable>

            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Style</Text>
              <StylePicker selected={style} onSelect={setStyle} />
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Ideas</Text>
              <View style={styles.suggestions}>
                {suggestions.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setName(item);
                      setMenuOpen(false);
                    }}
                    style={styles.suggestionChip}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {achievement && (
              <View style={styles.achievementBox}>
                <Text style={styles.achievementText}>
                  {achievement.emoji} {achievement.title}
                </Text>
              </View>
            )}

            <Pressable
              onPress={() => showComingSoon("Battle")}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>⚔️ Battle</Text>
            </Pressable>

            <Pressable
              onPress={() => showComingSoon("Achievements")}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>🏆 Achievements</Text>
            </Pressable>

            <Pressable
              onPress={() => showComingSoon("Settings")}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>⚙️ Settings</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={imageReady ? handleCreationSound : undefined}
          style={styles.heroBox}
        >
          {imageReady && imageUrl ? (
            <Animated.Image
              source={{ uri: imageUrl }}
              resizeMode="contain"
              style={[
                styles.heroImage,
                {
                  opacity: imageFade,
                  transform: [
                    {
                      scale: imageFade.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1]
                      })
                    }
                  ]
                }
              ]}
            />
          ) : isGenerating ? (
            <View style={styles.heroLoading}>
              <ActivityIndicator
                color={theme.colors.primaryLight}
                size="large"
              />
              <Text style={styles.loadingText}>
                {textReady ? "🎨 Drawing picture..." : "🪄 Creating picture..."}
              </Text>
            </View>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.placeholderEmoji}>✨</Text>
              <Text style={styles.placeholderText}>What shall we create?</Text>
            </View>
          )}
        </Pressable>

        {imageReady && (
          <Text style={styles.tapHint}>Tap picture for sound</Text>
        )}

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Type anything or emoji..."
            placeholderTextColor={theme.colors.muted}
            value={name}
            onChangeText={setName}
            style={styles.input}
            returnKeyType="go"
            onSubmitEditing={handleCreate}
          />

          <Pressable
            onPress={handleListen}
            disabled={isGenerating}
            style={[
              styles.smallMicButton,
              isListening && styles.smallMicButtonActive,
              isGenerating && styles.micButtonDisabled
            ]}
          >
            <Animated.Text
              style={[
                styles.smallMicText,
                { transform: [{ scale: micPulse }] }
              ]}
            >
              {isListening ? "🛑" : "🎤"}
            </Animated.Text>
          </Pressable>
        </View>

        {isListening && (
          <Text style={styles.listeningText}>
            I’m listening... tap stop if needed
          </Text>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { bottom: keyboardHeight }]}>
        <GradientButton
          title={isGenerating ? "✨ Creating..." : "✨ Create It!"}
          onPress={handleCreate}
          disabled={!name.trim() || isGenerating}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  headerText: {
    flex: 1
  },
  greeting: {
    color: theme.colors.muted,
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    lineHeight: 32
  },
  menuButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight
  },
  menuButtonText: {
    color: theme.colors.text,
    fontSize: 28,
    fontFamily: theme.fonts.headingBold
  },
  menuPanel: {
    gap: 10,
    padding: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  menuTitle: {
    color: theme.colors.primaryLight,
    fontSize: 22,
    fontFamily: theme.fonts.headingBold
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder
  },
  menuItemDisabled: {
    opacity: 0.45
  },
  menuItemText: {
    color: theme.colors.text,
    fontSize: 17,
    fontFamily: theme.fonts.bodyBold
  },
  menuSection: {
    gap: 10,
    paddingTop: 6
  },
  menuSectionTitle: {
    color: theme.colors.muted,
    fontSize: 15,
    fontFamily: theme.fonts.bodyBold
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  suggestionChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder
  },
  suggestionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold
  },
  achievementBox: {
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(192,96,255,0.18)",
    borderWidth: 1,
    borderColor: theme.colors.primaryLight
  },
  achievementText: {
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: theme.fonts.bodyBold
  },
  heroBox: {
    width: "100%",
    height: 360,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    overflow: "hidden"
  },
  heroImage: {
    width: "100%",
    height: "100%"
  },
  heroLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  placeholderEmoji: {
    fontSize: 78
  },
  placeholderText: {
    color: theme.colors.muted,
    fontSize: 22,
    fontFamily: theme.fonts.headingBold
  },
  loadingText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 17
  },
  tapHint: {
    color: theme.colors.muted,
    textAlign: "center",
    fontSize: 14,
    fontFamily: theme.fonts.bodyBold
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: 18,
    borderRadius: theme.radius.lg,
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.bodyBold
  },
  smallMicButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight
  },
  smallMicButtonActive: {
    backgroundColor: "rgba(192,96,255,0.35)"
  },
  micButtonDisabled: {
    opacity: 0.7
  },
  smallMicText: {
    fontSize: 34
  },
  listeningText: {
    color: theme.colors.primaryLight,
    textAlign: "center",
    fontSize: 18,
    fontFamily: theme.fonts.headingBold
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(8,11,24,0.96)",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  }
});