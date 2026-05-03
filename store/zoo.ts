import AsyncStorage from "@react-native-async-storage/async-storage";

const ZOO_KEY = "zoo_animals_v1";

export interface Animal {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  style: string;
  createdAt: number;
}

export async function getAnimals(): Promise<Animal[]> {
  const raw = await AsyncStorage.getItem(ZOO_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveAnimal(
  animal: Omit<Animal, "id" | "createdAt">
): Promise<Animal> {
  const animals = await getAnimals();

  const newAnimal: Animal = {
    ...animal,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now()
  };

  await AsyncStorage.setItem(ZOO_KEY, JSON.stringify([newAnimal, ...animals]));
  return newAnimal;
}

export async function deleteAnimal(id: string): Promise<void> {
  const animals = await getAnimals();
  const updated = animals.filter((animal) => animal.id !== id);
  await AsyncStorage.setItem(ZOO_KEY, JSON.stringify(updated));
}

export async function clearZoo(): Promise<void> {
  await AsyncStorage.removeItem(ZOO_KEY);
}
