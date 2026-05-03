import { Onboarding } from "@/components/Onboarding";
import { theme } from "@/constants/theme";
import { useFirstLaunch } from "@/hooks/useFirstLaunch";
import { useFonts } from "expo-font";

import {
    Baloo2_700Bold,
    Baloo2_800ExtraBold
} from "@expo-google-fonts/baloo-2";
import {
    Nunito_400Regular,
    Nunito_700Bold
} from "@expo-google-fonts/nunito";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_700Bold
  });

  const { loading, isFirstLaunch, markLaunched } = useFirstLaunch();

  if (!fontsLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (isFirstLaunch) {
    return <Onboarding onDone={markLaunched} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0d1024",
            borderTopColor: theme.colors.border,
            height: 76,
            paddingTop: 8
          },
          tabBarActiveTintColor: theme.colors.primaryLight,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarLabelStyle: {
            fontFamily: theme.fonts.bodyBold,
            fontSize: 11
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Create",
            tabBarIcon: ({ color }) => <TabIcon icon="🐾" color={color} />
          }}
        />
        <Tabs.Screen
          name="zoo"
          options={{
            title: "Zoo",
            tabBarIcon: ({ color }) => <TabIcon icon="🦁" color={color} />
          }}
        />
        <Tabs.Screen
          name="battle"
          options={{
            title: "Battle",
            tabBarIcon: ({ color }) => <TabIcon icon="⚔️" color={color} />
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: "Badges",
            tabBarIcon: ({ color }) => <TabIcon icon="🏆" color={color} />
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />
          }}
        />
      </Tabs>
    </>
  );
}



function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ color, fontSize: 22 }}>{icon}</Text>;
}
