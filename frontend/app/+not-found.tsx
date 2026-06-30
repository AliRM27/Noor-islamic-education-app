import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Colors, Fonts } from '../src/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={s.container}>
        <Text style={s.text}>Page not found</Text>
        <Link href="/(onboarding)/" style={s.link}>
          <Text style={s.linkText}>Go home</Text>
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
