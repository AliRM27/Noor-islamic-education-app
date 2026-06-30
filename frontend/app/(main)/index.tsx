import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius, ARABIC_LETTERS } from '../../src/constants/theme';
import { apiGetLessons, ApiLesson } from '../../src/services/api';
import { useUserStore } from '../../src/store/userStore';

// Tile background colour cycling through 4 pastels
const TILE_COLORS = [
  Colors.tileYellow,
  Colors.tileGreen,
  Colors.tileBlue,
  Colors.tilePink,
];

export default function HomeScreen() {
  const router = useRouter();
  const { name, progress, logout } = useUserStore();

  const [lessons, setLessons] = useState<ApiLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchLessons = useCallback(async () => {
    try {
      const data = await apiGetLessons();
      setLessons(data);
      setError(false);
    } catch {
      // Backend offline — fall back to static letter list
      setError(true);
      setLessons([]); // will render static grid
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const onRefresh = () => { setRefreshing(true); fetchLessons(); };

  // Use backend data if available, otherwise static fallback
  const items = lessons.length > 0
    ? lessons.map((l, i) => ({
        id: l._id,
        position: l.position,
        letter: l.letter.letter,
        nameEn: l.letter.name_en,
        nameAr: l.letter.name_ar,
        isFree: l.is_free,
        stars: progress[l._id] ?? 0,
        tileColor: TILE_COLORS[(l.position - 1) % 4],
        lessonData: l,
      }))
    : ARABIC_LETTERS.map((l) => ({
        id: `local-${l.position}`,
        position: l.position,
        letter: l.letter,
        nameEn: l.nameEn,
        nameAr: l.nameAr,
        isFree: l.position <= 5,
        stars: 0,
        tileColor: Colors[l.color],
        lessonData: null,
      }));

  const completedCount = items.filter((i) => i.stars > 0).length;
  const greetingEmoji = completedCount === 0 ? '🌙' : completedCount < 14 ? '⭐' : '✨';

  const renderTile = ({ item }: { item: typeof items[0] }) => {
    const done = item.stars > 0;
    return (
      <TouchableOpacity
        style={[s.tile, { backgroundColor: item.tileColor }]}
        onPress={() =>
          router.push({
            pathname: '/(main)/lesson/[id]',
            params: {
              id: item.id,
              letter: item.letter,
              nameEn: item.nameEn,
              nameAr: item.nameAr,
              position: String(item.position),
            },
          })
        }
        activeOpacity={0.75}
      >
        {/* Star badge if completed */}
        {done && (
          <View style={s.starBadge}>
            <Text style={s.starBadgeText}>★</Text>
          </View>
        )}
        <Text style={s.tileArabic}>{item.letter}</Text>
        <Text style={s.tileNameEn}>{item.nameEn}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>
            {greetingEmoji} Hi, {name || 'there'}!
          </Text>
          <Text style={s.progress}>
            {completedCount} / 28 letters learned
          </Text>
        </View>
        {/* Progress pill */}
        <View style={s.pillWrap}>
          <View style={[s.pillFill, { width: `${(completedCount / 28) * 100}%` as any }]} />
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.green} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTile}
          numColumns={4}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} />
          }
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const TILE_SIZE = 80;

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
  progress: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMedium,
    marginTop: 2,
    marginBottom: 10,
  },
  pillWrap: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  pillFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
  },
  grid: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  row: { gap: 10, marginBottom: 10, justifyContent: 'flex-start' },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 2,
  },
  starBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  starBadgeText: {
    fontSize: 12,
    color: Colors.gold,
  },
  tileArabic: {
    fontFamily: Fonts.arabicBold,
    fontSize: 32,
    color: Colors.textDark,
    textAlign: 'center',
  },
  tileNameEn: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
