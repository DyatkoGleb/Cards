#!/bin/bash
echo "Отключаем ENABLE_USER_SCRIPT_SANDBOXING для проекта и таргетов..."

# Для основного проекта
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES;/ENABLE_USER_SCRIPT_SANDBOXING = NO;/g' eng_cards_2.xcodeproj/project.pbxproj
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES;/ENABLE_USER_SCRIPT_SANDBOXING = NO;/g' Pods/Pods.xcodeproj/project.pbxproj

echo "Готово. Теперь запустите npx react-native run-ios"