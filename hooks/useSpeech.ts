import * as Speech from "expo-speech";
import { useState } from "react";

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  async function speak(text: string) {
    const currentlySpeaking = await Speech.isSpeakingAsync();

    if (currentlySpeaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);

    Speech.speak(text, {
      rate: 0.85,
      pitch: 1.1,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
  }

  function stop() {
    Speech.stop();
    setSpeaking(false);
  }

  return { speaking, speak, stop };
}
