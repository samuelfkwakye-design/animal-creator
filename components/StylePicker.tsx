import { theme } from "@/constants/theme";
import { hapticLight } from "@/utils/haptics";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export type ArtStyleKey = "3d" | "cartoon" | "watercolor" | "pixel" | "crayon";

export const ART_STYLES: Record<
  ArtStyleKey,
  { label: string; prompt: string }
> = {
  "3d": {
    label: "✨ 3D",
    prompt:
      "3D render, cute Blender style, soft lighting, toy-like, pastel colors"
  },
  cartoon: {
    label: "🎨 Cartoon",
    prompt: "vibrant cartoon illustration, bold outlines, Pixar style, colorful"
  },
  watercolor: {
    label: "💧 Watercolor",
    prompt:
      "soft watercolor painting, gentle washes, illustrated children's book style"
  },
  pixel: {
    label: "👾 Pixel Art",
    prompt: "pixel art, 16-bit retro game sprite, colorful pixels, cute"
  },
  crayon: {
    label: "🖍️ Crayon",
    prompt: "crayon drawing by a child, colorful, hand-drawn, playful scribbles"
  }
};

const STYLE_ORDER: ArtStyleKey[] = [
  "3d",
  "cartoon",
  "watercolor",
  "pixel",
  "crayon"
];

interface Props {
  selected: ArtStyleKey;
  onSelect: (style: ArtStyleKey) => void;
}

export function StylePicker({ selected, onSelect }: Props) {
  async function choose(style: ArtStyleKey) {
    await hapticLight();
    onSelect(style);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {STYLE_ORDER.map((key) => {
        const active = key === selected;

        return (
          <Pressable
            key={key}
            onPress={() => choose(key)}
            style={[styles.chip, active && styles.activeChip]}
          >
            <Text style={[styles.text, active && styles.activeText]}>
              {ART_STYLES[key].label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 6
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  activeChip: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(192,96,255,0.18)"
  },
  text: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  activeText: {
    color: theme.colors.text
  }
});