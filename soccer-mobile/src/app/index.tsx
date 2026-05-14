import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { user, logout, isSignedIn } = useAuth();
  const router = useRouter();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redirect to login if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/login');
    }
  }, [isSignedIn, router]);

  const performLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      setLogoutModalVisible(false);
      router.replace('/login');
    } catch {
      Alert.alert('Error', 'Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutPress = () => {
    if (Platform.OS === 'web') {
      setLogoutModalVisible(true);
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: performLogout,
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

        <Pressable
          style={[styles.secondaryButton, isLoggingOut && styles.buttonDisabled]}
          onPress={handleLogoutPress}
          disabled={isLoggingOut}>
          <Text style={styles.secondaryButtonText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isLogoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
                disabled={isLoggingOut}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton, isLoggingOut && styles.buttonDisabled]}
                onPress={performLogout}
                disabled={isLoggingOut}>
                <Text style={styles.confirmButtonText}>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 32, 51, 0.42)',
    padding: 24,
  },
  modalPanel: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#12304A',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  modalTitle: {
    color: '#102033',
    fontSize: 22,
    fontWeight: '800',
  },
  modalText: {
    color: '#526171',
    fontSize: 15,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 92,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#C8D5E3',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#102033',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
