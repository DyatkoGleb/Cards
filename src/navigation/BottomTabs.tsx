import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProfileScreen } from '../screens/ProfileScreen/ProfileScreen';
import { CardsScreen } from '../screens/CardsScreen/CardsScreen';
import { Stats, WordPair } from '../types/word';
import { AddWordButton } from '../components/AddWordButton';
import { View } from 'react-native';
import { AddWordModal } from '../components/AddWordModal/AddWordModal';

type Props = {
  words: any[];
  stats: any;
  palette: any;
  isDark: boolean;
  toggleTheme: () => void;
  addWord: (word: string, translation: string) => Promise<any>;
  deleteWord: (id: string) => Promise<void>;
  editWord: (id: string, word: string, translation: string) => Promise<void>;
  updateStreak: () => Promise<any>;
  replaceAll: (nextWords: WordPair[], nextStats: Stats) => Promise<void>;
};

const Tab = createBottomTabNavigator();

export function BottomTabs({
  words,
  stats,
  palette,
  isDark,
  toggleTheme,
  addWord,
  deleteWord,
  editWord,
  updateStreak,
  replaceAll,
}: Props) {
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 74,
            paddingBottom: 20,
            paddingTop: 6,
            borderTopWidth: 0,
            backgroundColor: palette.white,
          },
          tabBarActiveTintColor: palette.blue,
          tabBarInactiveTintColor: palette.slate400,
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen name="Cards" options={{ title: 'Cards' }}>
          {() => (
            <CardsScreen
              words={words}
              updateStreak={updateStreak}
              palette={palette}
              isDark={isDark}
              toggleTheme={toggleTheme}
              editWord={editWord}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Add"
          component={View}
          options={{
            tabBarItemStyle: {
              width: 0, 
            },
            tabBarButton: () => (
              <View
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: [{ translateX: '-50%' }],
                }}
              >
                <AddWordButton onPress={() => setAddModalVisible(true)} />
              </View>
            ),
          }}
        />

        <Tab.Screen name="Profile" options={{ title: 'Profile' }}>
          {() => (
            <ProfileScreen
              words={words}
              stats={stats}
              deleteWord={deleteWord}
              editWord={editWord}
              replaceAll={replaceAll}
              palette={palette}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
      
      <AddWordModal
        words={words}
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        palette={palette}
        addWord={addWord}
        editWord={editWord}
      />
    </>
  );
}