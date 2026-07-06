import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius } from '../../src/constants/theme';
import { apiGetTopics, ApiTopic } from '../../src/services/api';
import { useUserStore } from '../../src/store/userStore';

// Static fallback shown when the backend is unreachable — mirrors the one
// real topic seeded today so the app still opens something to a child offline.
const FALLBACK_TOPICS: ApiTopic[] = [
  {
    _id: 'local-alphabet',
    slug: 'arabic-alphabet',
    title_en: 'Arabic Alphabet',
    title_ar: 'الحروف العربية',
    description_en: 'Learn to read and write the 28 letters.',
    description_ar: 'تعلم قراءة وكتابة الحروف العربية.',
    icon: '📖',
    color: 'tileGreen',
    min_age: 4,
    max_age: 8,
    is_free: true,
    lesson_count: 28,
    completed_count: 0,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { name } = useUserStore();

  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchTopics = useCallback(async () => {
    try {
      const data = await apiGetTopics();
      setTopics(data);
      setError(false);
    } catch {
      setError(true);
      setTopics(FALLBACK_TOPICS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const onRefresh = () => { setRefreshing(true); fetchTopics(); };

  const renderTopic = ({ item }: { item: ApiTopic }) => {
    const tileColor = (Colors as any)[item.color] ?? Colors.tileGreen;
    const done = item.completed_count > 0 && item.completed_count >= item.lesson_count;
    return (
      <TouchableOpacity
        style={[s.card, { backgroundColor: tileColor }]}
        onPress={() =>
          router.push({
            pathname: '/(main)/topic/[id]',
            params: { id: item._id, slug: item.slug, titleEn: item.title_en },
          })
        }
        activeOpacity={0.8}
      >
        <Text style={s.cardIcon}>{item.icon}</Text>
        <View style={s.cardBody}>
          <Text style={s.cardTitle}>{item.title_en}</Text>
          <Text style={s.cardMeta}>Ages {item.min_age}-{item.max_age}</Text>
          <Text style={s.cardProgress}>
            {done ? '✓ Complete' : `${item.completed_count} / ${item.lesson_count} lessons`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.greeting}>🌙 Hi, {name || 'there'}!</Text>
        <Text style={s.subtitle}>What do you want to learn today?</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.green} />
        </View>
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(item) => item._id}
          renderItem={renderTopic}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} />
          }
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontFamily: Fonts.extraBold,
    fontSize: 24,
    color: Colors.textDark,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMedium,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: 18,
    gap: 14,
  },
  cardIcon: {
    fontSize: 40,
  },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 18,
    color: Colors.textDark,
  },
  cardMeta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMedium,
  },
  cardProgress: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textDark,
    marginTop: 4,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
