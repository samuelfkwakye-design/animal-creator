import { ART_STYLES } from "@/components/StylePicker";
import { Platform } from "react-native";

const CLAUDE_URL =
  Platform.OS === "web"
    ? "/api/generate"
    : "https://api.anthropic.com/v1/messages";

export async function getAnimalText(
  name: string,
  style: keyof typeof ART_STYLES
) {
  const styleDesc = ART_STYLES[style].prompt;

  const prompt = `
A child is creating a magical animal idea using words, emojis, or both.

Child's idea:
"${name}"

Important:
- If the idea contains emojis, understand what the emojis mean.
- Example: "🦁🔥" means a fire lion.
- Example: "🐘🌈" means a rainbow elephant.
- Example: "🤖🐯" means a robot tiger.
- Turn the child's words and emojis into one clear magical animal.
- Do not mention that emojis were used.

Write exactly 2 short exciting sentences describing this creature.
Use simple joyful words.
Make it magical and fun.
No adult language.
Keep the description under 40 words.

Then on a new line write:
IMAGE: detailed image prompt for ${styleDesc}, based on the child's idea "${name}", interpret any emojis as visual animal/theme clues, cute magical creature, no text, no humans, child-friendly, high quality, bright, joyful, clear full-body subject, beautiful background

Be enthusiastic!
`;

  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY as string;

  if (Platform.OS !== "web" && !apiKey) {
    throw new Error("Missing Anthropic API key");
  }

  const claudeBody =
    Platform.OS === "web"
      ? { prompt }
      : {
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }]
        };

  const claudeHeaders: Record<string, string> =
    Platform.OS === "web"
      ? { "Content-Type": "application/json" }
      : {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        };

  const claudeRes = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: claudeHeaders,
    body: JSON.stringify(claudeBody)
  });

  if (!claudeRes.ok) {
    throw new Error("Animal description generation failed");
  }

  const claudeData = await claudeRes.json();

  const text =
    Platform.OS === "web"
      ? claudeData.text
      : claudeData.content?.[0]?.text || "";

  const [descriptionRaw, imagePromptRaw] = text.split("IMAGE:");

  const description =
    descriptionRaw?.trim() ||
    `This magical animal is full of colour and joy. It loves happy adventures and sparkling surprises.`;

  const imagePrompt = `
${imagePromptRaw || name}.
${styleDesc}.
Interpret all emojis as visual clues for the creature, animal, powers, colours, mood, and background.
Cute magical animal, beautiful children's book quality, polished digital art, clear full-body creature, joyful expression, rich colour, soft lighting, high detail, no text, no letters, no watermark, no humans.
`.trim();

  return {
    description,
    imagePrompt
  };
}

export async function getAnimalImage(imagePrompt: string) {
  if (Platform.OS !== "web") {
    throw new Error(
      "fal image generation is currently wired through Vercel web API only"
    );
  }

  const imageRes = await fetch("/api/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: imagePrompt })
  });

  if (!imageRes.ok) {
    throw new Error("Image generation failed");
  }

  const imageData = await imageRes.json();

  return imageData.imageUrl;
}