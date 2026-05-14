import { MatchCard } from '@/components/MatchCard';
import { MatchItem, getActiveMatchesPage } from '@/services/matches';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function MatchesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const isLoadingMoreRef = useRef(false);

  const pageSize = 10;
  const contentMaxWidth = useMemo(() => (width >= 900 ? 760 : undefined), [width]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  const loadPage = useCallback(async (requestedPage: number, mode: 'initial' | 'refresh' | 'more') => {
    if (mode === 'more' && (isLoadingMoreRef.current || !hasMoreRef.current)) {
      return;
    }

    if (mode === 'refresh') {
      setIsRefreshing(true);
    } else if (mode === 'more') {
      setIsLoadingMore(true);
      isLoadingMoreRef.current = true;
    } else {
      setIsInitialLoading(true);
    }

    try {
      const response = await getActiveMatchesPage(requestedPage, pageSize);

      pageRef.current = requestedPage;
      setHasMore(response.hasMore);
      hasMoreRef.current = response.hasMore;
      setErrorMessage(null);
      setMatches((currentMatches) => {
        if (requestedPage === 1) {
          return response.items;
        }

        const knownIds = new Set(currentMatches.map((match) => match.id));
        return [...currentMatches, ...response.items.filter((match) => !knownIds.has(match.id))];
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load matches.');
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPage(1, 'initial');
  }, [loadPage]);

  const handleRefresh = useCallback(() => {
    loadPage(1, 'refresh');
  }, [loadPage]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isInitialLoading || isLoadingMore || isRefreshing) {
      return;
    }

    loadPage(pageRef.current + 1, 'more');
  }, [hasMore, isInitialLoading, isLoadingMore, isRefreshing, loadPage]);

  const header = (
    <View style={styles.headerCard}>
      <Text style={styles.label}>Matches Dashboard</Text>
      <Text style={styles.title}>Active matches</Text>
      <Text style={styles.description}>Browse the live match list and open any card for details.</Text>
      <Pressable style={styles.secondaryButton} onPress={() => router.push('/')}>
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MatchCard match={item} />}
        contentContainerStyle={[styles.listContent, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}
        ListHeaderComponent={header}
        ListEmptyComponent={
          isInitialLoading ? null : errorMessage ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Could not load matches</Text>
              <Text style={styles.emptyText}>{errorMessage}</Text>
              <Pressable style={styles.retryButton} onPress={() => loadPage(1, 'initial')}>
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No active matches</Text>
              <Text style={styles.emptyText}>Active matches will appear here when they are available.</Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color="#0B6CF2" />
            </View>
          ) : hasMore && matches.length > 0 ? (
            <Pressable style={styles.loadMoreButton} onPress={handleLoadMore}>
              <Text style={styles.loadMoreButtonText}>Load more matches</Text>
            </Pressable>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#0B6CF2" />}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
      />

      {isInitialLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0B6CF2" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  listContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    gap: 14,
    alignSelf: 'center',
    width: '100%',
  },
  headerCard: {
    backgroundColor: '#102033',
    borderRadius: 24,
    padding: 22,
    gap: 12,
    shadowColor: '#12304A',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  label: {
    color: '#8FD3FF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  description: {
    color: '#D9E5F0',
    fontSize: 16,
    lineHeight: 24,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#102033',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D9E5F0',
    padding: 20,
    gap: 10,
  },
  emptyTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: '#5D7285',
    fontSize: 14,
    lineHeight: 21,
  },
  retryButton: {
    backgroundColor: '#0B6CF2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loadMoreButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8D5E3',
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadMoreButtonText: {
    color: '#102033',
    fontSize: 15,
    fontWeight: '700',
  },
  footerLoading: {
    paddingVertical: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 248, 252, 0.55)',
  },
});