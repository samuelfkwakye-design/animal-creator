import { fal } from "@fal-ai/client";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const falKey = process.env.FAL_KEY as string;

  if (!falKey) {
    return res.status(500).json({ error: "Missing FAL_KEY" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    fal.config({
      credentials: falKey
    });

    const result: any = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: "square",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
        output_format: "jpeg"
      }
    });

    const imageUrl = result?.data?.images?.[0]?.url;

    if (!imageUrl) {
      return res.status(500).json({ error: "No image returned from fal" });
    }

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "fal image generation failed" });
  }
}