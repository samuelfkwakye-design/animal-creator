import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const KEY = "has_launched_v1";

export function useFirstLaunch() {
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    async function check() {
      const value = await AsyncStorage.getItem(KEY);
      setIsFirstLaunch(value !== "true");
      setLoading(false);
    }

    check();
  }, []);

  async function markLaunched() {
    await AsyncStorage.setItem(KEY, "true");
    setIsFirstLaunch(false);
  }

  return { loading, isFirstLaunch, markLaunched };
}
