import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Big letter icon */}
        <View style={s.iconCircle}>
          <Text style={s.iconLetter}>ن</Text>
        </View>

        {/* Title */}
        <Text style={s.title}>Noor</Text>
        <Text style={s.subtitle}>Learn the Arabic Alphabet</Text>

        {/* CTA */}
        <TouchableOpacity
          style={s.btn}
          onPress={() => router.push('/(onboarding)/name')}
          activeOpacity={0.8}
        >
          <Text style={s.btnText}>Let's Start! 🌙</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
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
