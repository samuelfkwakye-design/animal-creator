import AsyncStorage from "@react-native-async-storage/async-storage";

export type AchievementId =
  | "FIRST_ANIMAL"
  | "FIVE_ANIMALS"
  | "FIRST_AVATAR"
  | "FIRST_BATTLE";

export type Achievement = {
  id: AchievementId;
  title: string;
  emoji: string;
  description: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "FIRST_ANIMAL",
    title: "First Animal",
    emoji: "🐣",
    description: "You created your first animal!"
  },
  {
    id: "FIVE_ANIMALS",
    title: "Zoo Star",
    emoji: "🌟",
    description: "You saved 5 animals!"
  },
  {
    id: "FIRST_AVATAR",
    title: "Avatar Hero",
    emoji: "👑",
    description: "You picked your first avatar!"
  },
  {
    id: "FIRST_BATTLE",
    title: "Battle Starter",
    emoji: "⚔️",
    description: "You started your first battle!"
  }
];

const KEY = "JASON_ACHIEVEMENTS";

export async function getUnlockedAchievements(): Promise<AchievementId[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function unlockAchievement(
  id: AchievementId
): Promise<Achievement | null> {
  const unlocked = await getUnlockedAchievements();

  if (unlocked.includes(id)) {
    return null;
  }

  const next = [...unlocked, id];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));

  return ACHIEVEMENTS.find((achievement) => achievement.id === id) || null;
}

export async function hasAchievement(id: AchievementId): Promise<boolean> {
  const unlocked = await getUnlockedAchievements();
  return unlocked.includes(id);
}
