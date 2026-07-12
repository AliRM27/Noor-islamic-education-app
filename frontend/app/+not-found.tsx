import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Colors, Fonts } from '../src/constants/theme';
import { t } from '../src/i18n';
import { useUserStore } from '../src/store/userStore';

export default function NotFoundScreen() {
  useUserStore((s) => s.locale); // re-render on language change
  return (
    <>
      <Stack.Screen options={{ title: t('notFoundTitle') }} />
      <View style={s.container}>
        <Text style={s.text}>{t('pageNotFound')}</Text>
        <Link href="/(onboarding)/" style={s.link}>
          <Text style={s.linkText}>{t('goHome')}</Text>
        </Link>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  text: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.textDark, marginBottom: 16 },
  link: {},
  linkText: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.green },
});
