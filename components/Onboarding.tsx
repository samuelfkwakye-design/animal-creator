import { theme } from "@/constants/theme";
import { hapticLight } from "@/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientButton } from "./GradientButton";

const slides = [
  {
    emoji: "🐾",
    title: "Welcome to Animal Creator!",
    body: "Build magical animals that no one has ever seen before.",
    colors: ["#41105f", "#080b18"]
  },
  {
    emoji: "✍️",
    title: "Type what you imagine",
    body: 'Write anything — "blue wolf with fire wings" or "tiny space elephant".',
    colors: ["#1d3b72", "#080b18"]
  },
  {
    emoji: "🎨",
    title: "Pick your art style",
    body: "Cartoon, watercolor, pixel art, crayon or 3D — your choice every time.",
    colors: ["#5c2751", "#080b18"]
  },
  {
    emoji: "🦁",
    title: "Build your own Zoo",
    body: "Save your favourite creatures and visit them whenever you want.",
    colors: ["#284d35", "#080b18"]
  }
];

interface Props {
  onDone: () => void;
}

export function Onboarding({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  async function next() {
    await hapticLight();

    if (isLast) {
      onDone();
      return;
    }

    setIndex((current) => current + 1);
  }

  return (
    <LinearGradient
  colors={slide.colors as [string, string]}
  style={styles.container}
>
      <Pressable onPress={onDone} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[styles.dot, dotIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <GradientButton
          title={isLast ? "Let's Create!" : "Next"}
          onPress={next}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.screen,
    justifyContent: "space-between"
  },
  skip: {
    alignSelf: "flex-end",
    paddingTop: 30,
    padding: 10
  },
  skipText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  content: {
    alignItems: "center",
    gap: 18
  },
  emoji: {
    fontSize: 92
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 34,
    textAlign: "center",
    lineHeight: 38
  },
  body: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center"
  },
  footer: {
    gap: 24,
    paddingBottom: 20
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.dim
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primaryLight
  }
});
