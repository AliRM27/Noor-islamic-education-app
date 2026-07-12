import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius } from '../../src/constants/theme';
import { apiCreateChild } from '../../src/services/api';
import { useUserStore } from '../../src/store/userStore';
import { t } from '../../src/i18n';

export default function NameScreen() {
  const router = useRouter();
  const { setTokens, setUser, setOnboarded } = useUserStore();
  useUserStore((s) => s.locale); // re-render on language change

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'name' | 'pin'>('name');

  const handleNext = async () => {
    if (step === 'name') {
      if (name.trim().length < 2) {
        Alert.alert('', t('alertEnterName'));
        return;
      }
      setStep('pin');
      return;
    }

    // PIN step
    if (pin.length !== 4) {
      Alert.alert('', t('alertPinLength'));
      return;
    }

    setLoading(true);
    try {
      const data = await apiCreateChild(name.trim(), pin);
      setTokens(data.accessToken, data.refreshToken);
      setUser({
        userId: data.child?.id ?? null,
        name: name.trim(),
      });
      setOnboarded(true);
      router.replace('/(main)/');
    } catch (err: any) {
      Alert.alert(t('alertErrorTitle'), err?.response?.data?.error ?? t('alertSomethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.container}>

          {/* Back button */}
          <TouchableOpacity
            style={s.back}
            onPress={() => step === 'pin' ? setStep('name') : router.back()}
          >
            <Ionicons name="arrow-back" size={26} color={Colors.textDark} />
          </TouchableOpacity>

          {step === 'name' ? (
            <>
              <Text style={s.emoji}>👋</Text>
              <Text style={s.title}>{t('whatsYourName')}</Text>
              <TextInput
                style={s.input}
                placeholder={t('yourNamePlaceholder')}
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={20}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />
            </>
          ) : (
            <>
              <Text style={s.emoji}>🔒</Text>
              <Text style={s.title}>{t('greeting', { name })}</Text>
              <Text style={s.subtitle}>
                {t('setPinSubtitle')}
              </Text>
              <TextInput
                style={[s.input, s.pinInput]}
                placeholder="● ● ● ●"
                placeholderTextColor={Colors.textLight}
                value={pin}
                onChangeText={(txt) => setPin(txt.replace(/\D/g, '').slice(0, 4))}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                autoFocus
                textAlign="center"
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </>
          )}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleNext}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.btnText}>
              {loading ? t('loading') : step === 'name' ? t('next') : t('letsGo')}
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  kav: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  back: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 56 },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 30,
    color: Colors.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 23,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textDark,
    borderWidth: 2,
    borderColor: Colors.answerBorder,
    marginTop: 4,
  },
  pinInput: {
    letterSpacing: 12,
    fontSize: 28,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.xl,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.white,
  },
});
