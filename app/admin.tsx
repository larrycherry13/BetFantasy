import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService, Parlay, User } from '@/utils/auth';
import { OddsService } from '@/utils/oddsApi';

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [parlays, setParlays] = useState<Parlay[]>([]);
  const [inviteCodes, setInviteCodes] = useState<string[]>([]);
  const [newInviteCode, setNewInviteCode] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'parlays' | 'codes'>('users');
  
  const neonColor = colorScheme === 'dark' ? '#00ff41' : '#39ff14';

  useEffect(() => {
    checkAdminAccess();
    loadData();
  }, []);

  const checkAdminAccess = async () => {
    const user = await AuthService.getCurrentUser();
    if (!user || !user.isAdmin) {
      Alert.alert('Access Denied', 'Admin access required', [
        { text: 'Go Back', onPress: () => router.back() }
      ]);
      return;
    }
    setCurrentUser(user);
  };

  const loadData = async () => {
    const [usersData, parlaysData, codesData] = await Promise.all([
      AuthService.getAllUsers(),
      AuthService.getAllParlays(),
      AuthService.getInviteCodes()
    ]);
    
    setUsers(usersData);
    setParlays(parlaysData);
    setInviteCodes(codesData);
  };

  const createInviteCode = async () => {
    if (!newInviteCode.trim()) {
      Alert.alert('Error', 'Please enter a code');
      return;
    }

    const success = await AuthService.createInviteCode(newInviteCode.trim().toUpperCase());
    if (success) {
      setNewInviteCode('');
      loadData();
      Alert.alert('Success', `Invite code "${newInviteCode.toUpperCase()}" created!`);
    } else {
      Alert.alert('Error', 'Code already exists');
    }
  };

  const clearOddsCache = async () => {
    Alert.alert(
      'Clear Odds Cache',
      'This will clear all cached odds data. Next odds request will use 1 API credit.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          style: 'destructive',
          onPress: async () => {
            await OddsService.clearCache();
            Alert.alert('Success', 'Odds cache cleared!');
          }
        }
      ]
    );
  };

  const updateParlayResult = async (parlayId: string, status: 'won' | 'lost') => {
    const parlay = parlays.find(p => p.id === parlayId);
    if (!parlay) return;

    // Calculate points based on template difficulty
    const points = status === 'won' ? calculatePoints(parlay.templateId) : 0;
    
    const success = await AuthService.updateParlayResult(parlayId, status, points);
    if (success) {
      loadData();
      Alert.alert('Updated', `Parlay marked as ${status} (+${points} points)`);
    }
  };

  const calculatePoints = (templateId: number): number => {
    // Points based on difficulty level
    const pointsMap: { [key: number]: number } = {
      1: 100,  // Easy
      2: 150,  // Classic Duo
      3: 250,  // Triple Threat
      4: 300,  // Underdog Challenge
      5: 400,  // Balanced 4-Pack
      6: 500,  // Risky 5-Layer
      7: 750,  // High-Roller Jackpot
    };
    return pointsMap[templateId] || 100;
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={[styles.card, { borderColor: item.isAdmin ? '#ff0088' : neonColor }]}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>
          {item.username} {item.isAdmin && '👑'}
        </ThemedText>
        <Text style={[styles.pointsText, { color: neonColor }]}>
          {item.totalPoints} pts
        </Text>
      </View>
      <ThemedText style={styles.cardSubtitle}>
        Level: {item.level} • Joined: {item.joinedDate}
      </ThemedText>
      <ThemedText style={styles.cardSubtitle}>
        Streak: {item.winStreak} • Perfect Cards: {item.perfectCards}
      </ThemedText>
    </View>
  );

  const renderParlay = ({ item }: { item: Parlay }) => (
    <View style={[styles.card, { borderColor: getStatusColor(item.status) }]}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>
          {item.templateName} ({item.week})
        </ThemedText>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      
      <ThemedText style={styles.cardSubtitle}>
        User: {users.find(u => u.id === item.userId)?.username || 'Unknown'}
      </ThemedText>
      
      <View style={styles.picksContainer}>
        {item.picks.map((pick, index) => (
          <ThemedText key={index} style={styles.pickText}>
            • {pick.final}
          </ThemedText>
        ))}
      </View>
      
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#00ff41' }]}
            onPress={() => updateParlayResult(item.id, 'won')}
          >
            <Text style={styles.actionButtonText}>✅ Won</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ff4444' }]}
            onPress={() => updateParlayResult(item.id, 'lost')}
          >
            <Text style={styles.actionButtonText}>❌ Lost</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ThemedText style={styles.cardDate}>
        Submitted: {new Date(item.submittedAt).toLocaleString()}
      </ThemedText>
    </View>
  );

  const renderInviteCode = ({ item }: { item: string }) => (
    <View style={[styles.codeCard, { borderColor: neonColor }]}>
      <Text style={[styles.codeText, { color: neonColor }]}>{item}</Text>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'won': return '#00ff41';
      case 'lost': return '#ff4444';
      case 'pending': return '#ffff00';
      default: return '#666';
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: neonColor }]}>← Back</Text>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>👑 Admin Panel</ThemedText>
        <TouchableOpacity onPress={() => AuthService.logout().then(() => router.replace('/login'))}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['users', 'parlays', 'codes'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: neonColor, borderColor: neonColor }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cache Management */}
      <View style={styles.cacheContainer}>
        <TouchableOpacity 
          style={[styles.cacheButton, { borderColor: '#ff8800' }]}
          onPress={clearOddsCache}
        >
          <Text style={[styles.cacheButtonText, { color: '#ff8800' }]}>
            🗑️ Clear Odds Cache
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'users' && (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'parlays' && (
        <FlatList
          data={parlays.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())}
          renderItem={renderParlay}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'codes' && (
        <View style={styles.codesContainer}>
          <View style={styles.createCodeContainer}>
            <TextInput
              style={[styles.codeInput, { borderColor: neonColor }]}
              value={newInviteCode}
              onChangeText={setNewInviteCode}
              placeholder="Enter new invite code"
              placeholderTextColor="#666"
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: neonColor }]}
              onPress={createInviteCode}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={inviteCodes}
            renderItem={renderInviteCode}
            keyExtractor={(item) => item}
            numColumns={2}
            contentContainerStyle={styles.codesGrid}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  picksContainer: {
    marginVertical: 10,
  },
  pickText: {
    fontSize: 12,
    marginBottom: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'right',
  },
  codesContainer: {
    padding: 20,
  },
  createCodeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  codesGrid: {
    gap: 10,
  },
  codeCard: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cacheContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  cacheButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  cacheButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
