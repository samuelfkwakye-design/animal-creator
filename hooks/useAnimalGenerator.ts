import { ART_STYLES } from "@/components/StylePicker";
import { Platform } from "react-native";

const API_URL =
  Platform.OS === "web"
    ? "/api/generate"
    : "https://api.anthropic.com/v1/messages";

export async function generateAnimal(
  name: string,
  style: keyof typeof ART_STYLES
) {
  const styleDesc = ART_STYLES[style].prompt;

  const prompt = `
A child is creating a magical animal called: "${name}"

Write exactly 2 short exciting sentences describing this creature. Use simple joyful words.
Make it magical and fun. No adult language.

Then on a new line write:
IMAGE: [detailed image generation prompt for: ${styleDesc}, the creature described,
no text, no humans, child-friendly, white or nature background, high detail]

Keep description under 40 words. Be enthusiastic!
`;

  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY as string;

  if (Platform.OS !== "web" && !apiKey) {
    throw new Error("Missing Anthropic API key");
  }

  const body =
    Platform.OS === "web"
      ? { prompt }
      : {
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }]
        };

  const headers: Record<string, string> =
    Platform.OS === "web"
      ? {
          "Content-Type": "application/json"
        }
      : {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        };

  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Animal generation failed");
  }

  const data = await res.json();

  const text =
    Platform.OS === "web" ? data.text : data.content?.[0]?.text || "";

  const [descriptionRaw, imagePartRaw] = text.split("IMAGE:");

  const description =
    descriptionRaw?.trim() ||
    `The ${name} is a magical creature full of colour and joy. It loves happy adventures and sparkling surprises.`;

  const imagePrompt = encodeURIComponent(
    `${imagePartRaw || name}, ${styleDesc}, cute magical animal, child-friendly, no humans, no text, no watermark`
  );

  const seed = Math.floor(Math.random() * 1000000);

  const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=512&height=512&nologo=true&seed=${seed}`;

  return {
    description,
    imageUrl
  };
}