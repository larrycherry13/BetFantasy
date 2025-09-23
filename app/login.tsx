import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BetFantasyLogo } from '@/components/betfantasy-logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/utils/auth';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState('');
  const [passwordOrInvite, setPasswordOrInvite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const neonColor = colorScheme === 'dark' ? '#00ff41' : '#39ff14';

  useEffect(() => {
    // Initialize auth system
    AuthService.initialize();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !passwordOrInvite.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await AuthService.login(username.trim(), passwordOrInvite.trim());
      
      if (result.success && result.user) {
        Alert.alert(
          'Welcome!',
          `Hello ${result.user.username}! ${result.user.isAdmin ? '(Admin)' : ''}`,
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert('Login Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showAdminInfo = () => {
    Alert.alert(
      'Admin Login',
      'Username: admin\nPassword: admin\n\n' +
      'Default invite codes:\n• BETA2024\n• FOUNDER\n• PARLAY123\n• MVPTEST\n• FANTASY24',
      [{ text: 'Got it' }]
    );
  };

  const showInviteInfo = () => {
    Alert.alert(
      'New User?',
      'If you\'re a new user, enter your desired username and an invite code.\n\n' +
      'Ask the admin for an invite code!',
      [{ text: 'Got it' }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <BetFantasyLogo size={150} />
        <ThemedText style={styles.title}>BetFantasy</ThemedText>
        <ThemedText style={styles.subtitle}>Fantasy meets parlays</ThemedText>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <ThemedText style={styles.formTitle}>
          {isNewUser ? 'Join BetFantasy' : 'Welcome Back'}
        </ThemedText>
        
        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Username</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: neonColor }]}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>
            {isNewUser ? 'Invite Code' : 'Password'}
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor: neonColor }]}
            value={passwordOrInvite}
            onChangeText={setPasswordOrInvite}
            placeholder={isNewUser ? 'Enter invite code' : 'Enter password'}
            placeholderTextColor="#666"
            secureTextEntry={!isNewUser}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: neonColor }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Please wait...' : (isNewUser ? 'Join Now' : 'Login')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsNewUser(!isNewUser)}
        >
          <ThemedText style={[styles.switchText, { color: neonColor }]}>
            {isNewUser ? 'Already have an account? Login' : 'New user? Join with invite code'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Helper Buttons */}
      <View style={styles.helpContainer}>
        <TouchableOpacity style={styles.helpButton} onPress={showAdminInfo}>
          <ThemedText style={styles.helpText}>👑 Admin Info</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpButton} onPress={showInviteInfo}>
          <ThemedText style={styles.helpText}>❓ Need Invite Code?</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Beta Notice */}
      <View style={styles.betaNotice}>
        <ThemedText style={styles.betaText}>
          🚀 Beta Version - Invite Only
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  helpButton: {
    padding: 10,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  betaNotice: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  betaText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
