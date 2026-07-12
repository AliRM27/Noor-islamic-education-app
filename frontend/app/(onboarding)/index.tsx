import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius } from '../../src/constants/theme';
import { t } from '../../src/i18n';
import { useUserStore } from '../../src/store/userStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const locale = useUserStore((s) => s.locale);
  const setLocale = useUserStore((s) => s.setLocale);

  return (
    <SafeAreaView style={s.safe}>
      {/* Language toggle */}
      <View style={s.langRow}>
        <TouchableOpacity
          style={[s.langPill, locale === 'en' && s.langPillActive]}
          onPress={() => setLocale('en')}
          activeOpacity={0.7}
        >
          <Text style={[s.langPillText, locale === 'en' && s.langPillTextActive]}>EN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.langPill, locale === 'de' && s.langPillActive]}
          onPress={() => setLocale('de')}
          activeOpacity={0.7}
        >
          <Text style={[s.langPillText, locale === 'de' && s.langPillTextActive]}>DE</Text>
        </TouchableOpacity>
      </View>

      <View style={s.container}>

        {/* Big letter icon */}
        <View style={s.iconCircle}>
          <Text style={s.iconLetter}>ن</Text>
        </View>

        {/* Title */}
        <Text style={s.title}>Noor</Text>
        <Text style={s.subtitle}>{t('welcomeSubtitle')}</Text>

        {/* CTA */}
        <TouchableOpacity
          style={s.btn}
          onPress={() => router.push('/(onboarding)/name')}
          activeOpacity={0.8}
        >
          <Text style={s.btnText}>{t('welcomeCta')}</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
  },
  langPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
  },
  langPillActive: {
    backgroundColor: Colors.green,
  },
  langPillText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textMedium,
  },
  langPillTextActive: {
    color: Colors.white,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.tileYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconLetter: {
    fontFamily: Fonts.arabicBold,
    fontSize: 72,
    color: Colors.textDark,
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 42,
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.textMedium,
    textAlign: 'center',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.xl,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.white,
  },
});
