import { ART_STYLES } from "@/components/StylePicker";
import { Platform } from "react-native";

const CLAUDE_URL =
  Platform.OS === "web"
    ? "/api/generate"
    : "https://api.anthropic.com/v1/messages";

/**
 * STEP 1: Get TEXT FIRST (FAST)
 */
export async function getAnimalText(
  name: string,
  style: keyof typeof ART_STYLES
) {
  const styleDesc = ART_STYLES[style].prompt;

  const prompt = `
A child is creating a magical animal called: "${name}"

Write exactly 2 short exciting sentences describing this creature. Use simple joyful words.
Make it magical and fun. No adult language.

Then on a new line write:
IMAGE: detailed image prompt for ${styleDesc}, cute magical creature, based on "${name}", no text, no humans, child-friendly, high quality, bright, joyful, clear subject, beautiful background

Keep description under 40 words. Be enthusiastic!
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
    `The ${name} is a magical creature full of colour and joy. It loves happy adventures and sparkling surprises.`;

  const imagePrompt = `
${imagePromptRaw || name}.
${styleDesc}.
Cute magical animal, beautiful children's book quality, polished digital art, clear full-body creature, joyful expression, rich colour, soft lighting, high detail, no text, no letters, no watermark, no humans.
`.trim();

  return {
    description,
    imagePrompt
  };
}

/**
 * STEP 2: Get IMAGE AFTER (SLOWER)
 */
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