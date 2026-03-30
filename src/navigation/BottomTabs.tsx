import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { ProfileScreen } from '../screens/ProfileScreen/ProfileScreen';
import { CardsScreen } from '../screens/CardsScreen/CardsScreen';
import { AddWordButton } from '../components/AddWordButton';
import { AddWordModal } from '../components/AddWordModal/AddWordModal';
import { IconCards, IconProfile } from '../components/Icons';
import type { AppNavigatorProps } from '../types/app';

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
  addFolder,
  folders,
  selectedSet,
  setSelectedSet,
  updateStreak,
  retryTranscription,
}: AppNavigatorProps) {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [prefillWord, setPrefillWord] = useState('');
  const [prefillTranslation, setPrefillTranslation] = useState('');

  const openAddWordModal = (prefill?: { word?: string; translation?: string }) => {
    setPrefillWord(prefill?.word ?? '');
    setPrefillTranslation(prefill?.translation ?? '');
    setAddModalVisible(true);
  };
  
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 74,
            paddingBottom: 20,
            paddingTop: 6,
            paddingHorizontal: 30,
            borderTopWidth: 0,
            backgroundColor: palette.white,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 10,
          },
          tabBarActiveTintColor: palette.slate900,
          tabBarInactiveTintColor: palette.slate400,
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Cards"
          options={{
            title: 'Cards',
            tabBarIcon: ({ color, size }) => (
              <IconCards size={size} color={color} />
            ),
          }}
        >
          {() => (
            <CardsScreen
              words={words}
              updateStreak={updateStreak}
              palette={palette}
              isDark={isDark}
              toggleTheme={toggleTheme}
              editWord={editWord}
              folders={folders}
              selectedSet={selectedSet}
              setSelectedSet={setSelectedSet}
              retryTranscription={retryTranscription}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Add"
          component={View}
          options={{
            tabBarButton: () => (
              <View
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: [{ translateX: '-50%' }],
                }}
              >
                <AddWordButton onPress={() => openAddWordModal()} palette={palette} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <IconProfile size={size} color={color} />
            ),
          }}
        >
          {() => (
            <ProfileScreen
              words={words}
              stats={stats}
              deleteWord={deleteWord}
              editWord={editWord}
              addFolder={addFolder}
              folders={folders}
              palette={palette}
              onRequestAddWord={openAddWordModal}
              retryTranscription={retryTranscription}
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
        folders={folders}
        initialWord={prefillWord}
        initialTranslation={prefillTranslation}
      />
    </>
  );
}