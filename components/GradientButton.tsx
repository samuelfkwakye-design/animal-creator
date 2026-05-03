import { theme } from "@/constants/theme";
import { hapticLight } from "@/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    ViewStyle
} from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  icon?: ReactNode;
  style?: ViewStyle;
}

export function GradientButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  icon,
  style
}: Props) {
  const isPrimary = variant === "primary";

  async function handlePress() {
    if (disabled || loading) return;
    await hapticLight();
    onPress();
  }

  if (isPrimary) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.pressable, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>
              {icon} {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.flat,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "danger" && styles.danger,
        disabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.flatText}>
          {icon} {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: theme.radius.full,
    overflow: "hidden"
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.headingBold,
    fontSize: 18
  },
  flat: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card
  },
  secondary: {
    borderColor: theme.colors.accentBorder
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    borderColor: theme.colors.danger
  },
  flatText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  disabled: {
    opacity: 0.45
  }
});
