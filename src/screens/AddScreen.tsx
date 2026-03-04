import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TMDBMovie } from '../types';
import { searchMovies, getPosterUrl } from '../services/tmdb';
import { TicketStorage } from '../services/storage';
import { colors, spacing, borderRadius, typography } from '../theme';
import { MainTabScreenProps } from '../navigation/types';

type AddScreenProps = MainTabScreenProps<'Add'>;

interface SearchResult extends TMDBMovie {
  selected?: boolean;
}

export const AddScreen: React.FC<AddScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await TicketStorage.getSearchHistory();
      setSearchHistory(history);
    };
    loadHistory();
  }, []);

  const handleSearch = useCallback(async (searchText?: string | any) => {
    if (searchText && typeof searchText === 'object' && 'nativeEvent' in searchText) {
      searchText = query;
    }
    const searchQuery = searchText ?? query;
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      await TicketStorage.addSearchHistory(searchQuery.trim());
      const history = await TicketStorage.getSearchHistory();
      setSearchHistory(history);
      
      const data = await searchMovies(searchQuery);
      setResults(data.results.map((m: TMDBMovie) => ({ ...m, selected: false })));
    } catch (error) {
      Alert.alert('搜索失败', '请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.trim() === '') {
      setResults([]);
    }
  };

  const handleClearQuery = () => {
    setQuery('');
    setResults([]);
    setSelectedMovie(null);
  };

  const handleSelectMovie = (movie: SearchResult) => {
    const updated = results.map((m: SearchResult) => 
      m.id === movie.id ? { ...m, selected: true } : { ...m, selected: false }
    );
    setResults(updated);
    setSelectedMovie({ ...movie, selected: true });
  };

  const handleConfirmSelect = () => {
    if (selectedMovie) {
      navigation.navigate('AddDetail', { movie: selectedMovie });
    }
  };

  const handleHistoryPress = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  const handleRemoveHistory = async (text: string) => {
    await TicketStorage.removeSearchHistory(text);
    const history = await TicketStorage.getSearchHistory();
    setSearchHistory(history);
  };

  const renderSearchItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.movieItem, item.selected && styles.movieItemSelected]}
      onPress={() => handleSelectMovie(item)}
    >
      <Image
        source={{ uri: getPosterUrl(item.poster_path, 'w92') || undefined }}
        style={styles.moviePoster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitleItem} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.movieDate}>{item.release_date?.split('-')[0] || '未知'}</Text>
        {item.overview && (
          <Text style={styles.movieOverview} numberOfLines={2}>{item.overview}</Text>
        )}
      </View>
      {item.selected && <Text style={styles.checkMark}>✓</Text>}
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryPress(item)}
    >
      <Text style={styles.historyText}>🕐 {item}</Text>
      <TouchableOpacity onPress={() => handleRemoveHistory(item)}>
        <Text style={styles.historyRemove}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.searchBar}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索电影..."
              placeholderTextColor={colors.gray[400]}
              value={query}
              onChangeText={handleQueryChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearQuery}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>搜索</Text>
          </TouchableOpacity>
        </View>

        {query === '' && searchHistory.length > 0 ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>搜索历史</Text>
            <FlatList
              data={searchHistory}
              keyExtractor={(item: string) => item}
              renderItem={renderHistoryItem}
            />
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item: SearchResult) => item.id.toString()}
            renderItem={renderSearchItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>搜索电影添加到您的票夹</Text>
            }
          />
        )}
      </View>

      {selectedMovie && (
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom > 0 ? 8 : 8 }]}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSelect}>
            <Text style={styles.confirmButtonText}>确认选择</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    height: 44,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingRight: 40,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    width: 24,
    height: 44,
  },
  clearButtonText: {
    color: colors.gray[400],
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    height: 44,
  },
  searchButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    padding: spacing.md,
  },
  historyContainer: {
    padding: spacing.md,
  },
  historyTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  historyText: {
    ...typography.body,
    color: colors.text.primary,
  },
  historyRemove: {
    color: colors.gray[400],
    fontSize: 16,
    padding: spacing.xs,
  },
  movieItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  movieItemSelected: {
    borderColor: colors.accent,
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[200],
  },
  movieInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  movieTitleItem: {
    ...typography.h3,
    color: colors.text.primary,
  },
  movieDate: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: 2,
  },
  movieOverview: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  checkMark: {
    fontSize: 20,
    color: colors.accent,
    fontWeight: 'bold',
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
});

export default AddScreen;
