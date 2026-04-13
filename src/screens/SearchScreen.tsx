import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchTracks, getTrendingTracks } from '../services/search';
import { Track } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const ALBUM_SIZE = CARD_WIDTH - 16;

// Genre categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All', count: 20 },
  { id: 'trending', name: 'Trending', count: 10 },
  { id: 'new', name: 'New', count: 8 },
  { id: 'chill', name: 'Chill', count: 6 },
  { id: 'hiphop', name: 'Hip Hop', count: 12 },
  { id: 'electronic', name: 'EDM', count: 9 },
];

interface TrackCardProps {
  track: Track;
  onPlay: () => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay }) => {
  return (
    <View style={styles.trackCard}>
      <TouchableOpacity onPress={onPlay} style={styles.albumWrapper}>
        <Image
          source={{ uri: track.thumbnailUrl }}
          style={styles.albumArt}
          resizeMode="cover"
        />
        <View style={styles.playButtonOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.trackInfo}>
        <View style={styles.trackTextContainer}>
          <Text style={styles.artistName} numberOfLines={1}>
            {track.artist}
          </Text>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {track.title.split(' - ')[0].split('(')[0].trim()}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={18} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const SearchScreen: React.FC = () => {
  const { playTrack } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const loadData = async () => {
    try {
      const trendingData = await getTrendingTracks();
      setTracks(trendingData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      loadData();
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchTracks(query);
        setTracks(result.tracks);
      } catch (error) {
        console.error('Error searching:', error);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  const handlePlayTrack = useCallback((track: Track) => {
    playTrack(track, tracks);
  }, [playTrack, tracks]);

  const renderTrack = ({ item }: { item: Track }) => (
    <TrackCard
      track={item}
      onPlay={() => handlePlayTrack(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Black Header Section */}
      <SafeAreaView style={styles.headerSection} edges={['top']}>
        <View style={styles.headerIcons}>
          <View style={styles.leftPlaceholder} />
          <TouchableOpacity
            style={[styles.iconButtonCircle, showSearch && styles.iconButtonCircleActive]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Explore Tracks</Text>
          <Text style={styles.headerSubtitle}>
            Crate dig through new & old cuts
          </Text>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for songs..."
              placeholderTextColor="#888"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>

      {/* White Content Section */}
      <View style={styles.contentSection}>
        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.id && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
              <View
                style={[
                  styles.categoryCount,
                  selectedCategory === category.id && styles.categoryCountActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryCountText,
                    selectedCategory === category.id && styles.categoryCountTextActive,
                  ]}
                >
                  {category.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Track Grid */}
        {isSearching ? (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="large" color="#1a1a1a" />
          </View>
        ) : (
          <FlatList
            data={tracks}
            renderItem={renderTrack}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.gridRow}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header Section (Black)
  headerSection: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  leftPlaceholder: {
    flex: 1,
  },
  iconButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  // Content Section (White)
  contentSection: {
    flex: 1,
    paddingTop: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEBEB',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: 25,
    marginRight: 10,
    gap: 8,
  },
  categoryPillActive: {
    backgroundColor: '#1a1a1a',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryCount: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  categoryCountTextActive: {
    color: '#FFFFFF',
  },
  // Track Grid
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  trackCard: {
    width: CARD_WIDTH,
  },
  albumWrapper: {
    width: ALBUM_SIZE,
    height: ALBUM_SIZE,
    borderRadius: ALBUM_SIZE / 2,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#F0F0F0',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  trackTextContainer: {
    flex: 1,
  },
  artistName: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 4,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  menuButton: {
    padding: 4,
    marginTop: 2,
  },
});
