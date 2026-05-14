import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MatchDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match Details</Text>
      <Text style={styles.description}>This screen will show the selected match information.</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    color: '#102033',
    fontSize: 30,
    fontWeight: '800',
  },
  description: {
    color: '#526171',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
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