import { MatchItem } from '@/services/matches';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface MatchCardProps {
  match: MatchItem;
}

function formatMatchTime(match: MatchItem) {
  const rawValue = match.startsAt || match.startTime;

  if (!rawValue) {
    return 'Time to be announced';
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return rawValue;
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function MatchCard({ match }: MatchCardProps) {
  const title = match.title || `${match.homeTeam || 'Home'} vs ${match.awayTeam || 'Away'}`;
  const subtitle = match.competition || match.round || 'Active match';
  const venue = match.venue || match.location || 'Venue unavailable';
  const capacityText = typeof match.joinedPlayers === 'number' && typeof match.maxPlayers === 'number'
    ? `${match.joinedPlayers}/${match.maxPlayers} joined`
    : undefined;

  return (
    <Link href={{ pathname: '/match-details', params: { matchId: match.id } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Active</Text>
          </View>
          <Text style={styles.timeText}>{formatMatchTime(match)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Venue</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {venue}
          </Text>
        </View>

        {capacityText ? <Text style={styles.capacityText}>{capacityText}</Text> : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D9E5F0',
    padding: 16,
    gap: 10,
    shadowColor: '#12304A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F7EE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#177245',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  timeText: {
    color: '#5D7285',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: '#102033',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#50708A',
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    gap: 2,
  },
  metaLabel: {
    color: '#7A8C9D',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    color: '#102033',
    fontSize: 14,
    fontWeight: '600',
  },
  capacityText: {
    color: '#1D6FA3',
    fontSize: 13,
    fontWeight: '700',
  },
});
