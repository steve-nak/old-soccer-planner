import { getMatchById, joinMatch, leaveMatch, MatchComment, MatchItem, updateReserveSlots } from '@/services/matches';
import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MatchDetailsScreen() {
  const { matchId } = useLocalSearchParams<{ matchId?: string }>();
  const resolvedMatchId = Array.isArray(matchId) ? matchId[0] : matchId;
  const [match, setMatch] = useState<MatchItem | null>(null);
  const [reserveSlots, setReserveSlots] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const joinedPlayers = match?.joinedPlayers ?? match?.players?.length ?? 0;
  const maxPlayers = match?.maxPlayers ?? null;
  const reserveLimit = useMemo(() => {
    if (!maxPlayers) {
      return 9;
    }

    return Math.max(maxPlayers - joinedPlayers, 0);
  }, [joinedPlayers, maxPlayers]);

  const isJoined = !!match?.userJoined;
  const displayTitle = match?.title || `${match?.homeTeam || 'Home'} vs ${match?.awayTeam || 'Away'}`;
  const displayDate = formatDate(match?.startsAt || match?.startTime);
  const displayLocation = match?.venue || match?.location || 'Location not available';
  const displayState = match?.matchState || match?.status || 'active';
  const displayCapacity = maxPlayers ? `${joinedPlayers}/${maxPlayers}` : `${joinedPlayers}`;
  const comments = match?.comments ?? [];
  const players = match?.players ?? [];

  const loadMatch = useCallback(async () => {
    if (!resolvedMatchId) {
      setErrorMessage('Missing match identifier.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await getMatchById(resolvedMatchId);

      if (!response) {
        setMatch(null);
        setErrorMessage('Match not found.');
        return;
      }

      setMatch(response);
      setReserveSlots(response.reserveSlots ?? response.reservedSlots ?? 0);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load match details.');
    } finally {
      setIsLoading(false);
    }
  }, [resolvedMatchId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  const applyMatchUpdate = useCallback((updatedMatch: MatchItem) => {
    setMatch(updatedMatch);
    setReserveSlots(updatedMatch.reserveSlots ?? updatedMatch.reservedSlots ?? 0);
    setErrorMessage(null);
  }, []);

  const handleJoin = useCallback(async () => {
    if (!resolvedMatchId) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedMatch = await joinMatch(resolvedMatchId, reserveSlots);
      applyMatchUpdate(updatedMatch);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to join match.');
    } finally {
      setIsSaving(false);
    }
  }, [applyMatchUpdate, reserveSlots, resolvedMatchId]);

  const handleLeave = useCallback(async () => {
    if (!resolvedMatchId) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedMatch = await leaveMatch(resolvedMatchId);
      applyMatchUpdate(updatedMatch);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to leave match.');
    } finally {
      setIsSaving(false);
    }
  }, [applyMatchUpdate, resolvedMatchId]);

  const handleSaveReserveSlots = useCallback(async () => {
    if (!resolvedMatchId) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedMatch = await updateReserveSlots(resolvedMatchId, reserveSlots);
      applyMatchUpdate(updatedMatch);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update reserve slots.');
    } finally {
      setIsSaving(false);
    }
  }, [applyMatchUpdate, reserveSlots, resolvedMatchId]);

  const adjustReserveSlots = useCallback((delta: number) => {
    setReserveSlots((currentValue) => {
      const nextValue = currentValue + delta;
      return Math.max(0, Math.min(nextValue, reserveLimit));
    });
  }, [reserveLimit]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.label}>Match Details</Text>
        <Text style={styles.headerTitle}>{displayTitle}</Text>
        <Text style={styles.headerDescription}>Full match information, availability, and reserve slots.</Text>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#0B6CF2" />
          <Text style={styles.stateText}>Loading match details...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Unable to load match</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Pressable style={styles.primaryButton} onPress={loadMatch}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : match ? (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Overview</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{displayDate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{displayLocation}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>State</Text>
              <Text style={styles.infoValue}>{displayState}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capacity</Text>
              <Text style={styles.infoValue}>{displayCapacity}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Players joined</Text>
              <Text style={styles.infoValue}>{joinedPlayers}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Comments</Text>
              <Text style={styles.infoValue}>{comments.length}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <Text style={styles.bodyText}>
              {isJoined
                ? 'You are joined in this match. Adjust reserve slots for friends or leave the match.'
                : 'Join this match to confirm your place and manage reserve slots.'}
            </Text>

            {isJoined ? (
              <>
                <View style={styles.stepperCard}>
                  <Text style={styles.infoLabel}>Reserve slots</Text>
                  <View style={styles.stepperRow}>
                    <Pressable
                      style={[styles.stepperButton, reserveSlots <= 0 && styles.buttonDisabled]}
                      onPress={() => adjustReserveSlots(-1)}
                      disabled={reserveSlots <= 0 || isSaving}>
                      <Text style={styles.stepperButtonText}>-1</Text>
                    </Pressable>

                    <View style={styles.stepperValueBox}>
                      <Text style={styles.stepperValue}>{reserveSlots}</Text>
                    </View>

                    <Pressable
                      style={[styles.stepperButton, reserveSlots >= reserveLimit && styles.buttonDisabled]}
                      onPress={() => adjustReserveSlots(1)}
                      disabled={reserveSlots >= reserveLimit || isSaving}>
                      <Text style={styles.stepperButtonText}>+1</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.helperText}>
                    Reserve up to {reserveLimit} additional slot{reserveLimit === 1 ? '' : 's'}.
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.secondaryButton, isSaving && styles.buttonDisabled]}
                    onPress={handleLeave}
                    disabled={isSaving}>
                    <Text style={styles.secondaryButtonText}>{isSaving ? 'Saving...' : 'Leave'}</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
                    onPress={handleSaveReserveSlots}
                    disabled={isSaving}>
                    <Text style={styles.primaryButtonText}>Save reserve slots</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable
                style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
                onPress={handleJoin}
                disabled={isSaving}>
                <Text style={styles.primaryButtonText}>{isSaving ? 'Joining...' : 'Join'}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Players</Text>
            {players.length > 0 ? (
              players.map((player, index) => (
                <View key={`${player.id || player.email || index}`} style={styles.playerRow}>
                  <Text style={styles.playerName}>{player.name || player.email || `Player ${index + 1}`}</Text>
                  {player.isReserve ? <Text style={styles.playerTag}>Reserve</Text> : null}
                </View>
              ))
            ) : (
              <Text style={styles.bodyText}>No players have been listed for this match yet.</Text>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {comments.length > 0 ? (
              comments.map((comment, index) => {
                const commentText = formatComment(comment);
                const commentKey = getCommentKey(comment, index);

                return (
                  <View key={commentKey} style={styles.commentBubble}>
                    <Text style={styles.commentText}>{commentText}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.bodyText}>No comments yet.</Text>
            )}
          </View>
        </>
      ) : null}

      <View style={styles.footerLinks}>
        <Link href="/matches" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Back to Matches</Text>
          </Pressable>
        </Link>

        <Link href="/" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Back to Home</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return 'Date not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatComment(comment: string | MatchComment) {
  if (typeof comment === 'string') {
    return comment;
  }

  if (comment && typeof comment === 'object') {
    return comment.text || comment.user?.name || comment.user?.email || 'Comment';
  }

  return 'Comment';
}

function getCommentKey(comment: string | MatchComment, index: number) {
  if (typeof comment === 'string') {
    return `${index}-${comment}`;
  }

  if (comment && typeof comment === 'object') {
    return comment.id || `${index}-${comment.createdAt || comment.text || 'comment'}`;
  }

  return `${index}-comment`;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F8FC',
    padding: 20,
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#102033',
    borderRadius: 24,
    padding: 22,
    gap: 10,
  },
  label: {
    color: '#8FD3FF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  headerDescription: {
    color: '#D9E5F0',
    fontSize: 16,
    lineHeight: 24,
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D9E5F0',
    padding: 20,
    gap: 10,
    alignItems: 'center',
  },
  stateTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  stateText: {
    color: '#5D7285',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D9E5F0',
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: '#7A8C9D',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    color: '#102033',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  bodyText: {
    color: '#5D7285',
    fontSize: 14,
    lineHeight: 21,
  },
  stepperCard: {
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F5F8FC',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    minWidth: 56,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102033',
  },
  stepperButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  stepperValueBox: {
    minWidth: 72,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  stepperValue: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '700',
  },
  helperText: {
    color: '#5D7285',
    fontSize: 13,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#0B6CF2',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8D5E3',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#102033',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EEF5',
  },
  playerName: {
    color: '#102033',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  playerTag: {
    color: '#1D6FA3',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  commentBubble: {
    backgroundColor: '#F5F8FC',
    borderRadius: 16,
    padding: 14,
  },
  commentText: {
    color: '#102033',
    fontSize: 14,
    lineHeight: 21,
  },
  footerLinks: {
    gap: 10,
    paddingBottom: 8,
  },
  linkButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8D5E3',
    paddingVertical: 14,
    alignItems: 'center',
  },
  linkText: {
    color: '#102033',
    fontSize: 16,
    fontWeight: '700',
  },
});