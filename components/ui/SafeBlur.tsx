import React from 'react';
import { Platform, View, ViewProps } from 'react-native';

let BlurViewComponent: React.ComponentType<{
  intensity?: number;
  tint?: string;
  style?: ViewProps['style'];
  children?: React.ReactNode;
}> = View;

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  BlurViewComponent = require('expo-blur').BlurView;
}

export function SafeBlur({
  intensity = 40,
  style,
  children,
}: {
  intensity?: number;
  style?: ViewProps['style'];
  children?: React.ReactNode;
}) {
  if (Platform.OS === 'web') {
    return <View style={style}>{children}</View>;
  }

  return (
    <BlurViewComponent intensity={intensity} tint="dark" style={style}>
      {children}
    </BlurViewComponent>
  );
}
