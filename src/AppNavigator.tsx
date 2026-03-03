import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabs } from './navigation/BottomTabs';
import type { AppNavigatorProps } from './types/app';

export function AppNavigator(props: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <BottomTabs {...props} />
    </NavigationContainer>
  );
}