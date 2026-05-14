import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Soccer Planner</Text>
        <Text style={styles.title}>Welcome back!</Text>
        {user && (
          <Text style={styles.userEmail}>{user.email}</Text>
        )}
        <Text style={styles.description}>
          View your groups, manage matches, and keep track of upcoming games.
        </Text>

        <Link href="/matches" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>View Matches</Text>
          </Pressable>
        </Link>

        <Pressable style={styles.secondaryButton} onPress={handleLogout}>
          <Text style={styles.secondaryButtonText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 14,
    shadowColor: '#12304A',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  label: {
    color: '#1D6FA3',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102033',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  userEmail: {
    color: '#526171',
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    color: '#526171',
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#0B6CF2',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  secondaryButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});