import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BetFantasyLogo } from '@/components/betfantasy-logo';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService, Parlay, User } from '@/utils/auth';
import { OddsService } from '@/utils/oddsApi';


export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [selectedWeek, setSelectedWeek] = useState("Week 4");
  const [tapCount, setTapCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userParlays, setUserParlays] = useState<Parlay[]>([]);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const neonColor = colorScheme === 'dark' ? '#00ff41' : '#39ff14';

  // Check authentication and load data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setCurrentUser(user);
    
    const parlays = await AuthService.getUserParlays(user.id);
    setUserParlays(parlays);
    
    // Set initial selected week to most recent
    if (parlays.length > 0) {
      const weeks = [...new Set(parlays.map(p => p.week))];
      setSelectedWeek(weeks[0]);
    }
  };

  // Logo animation (same as other pages)
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
  }, []);

  const handleLogoTap = () => {
    setTapCount(tapCount + 1);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'won': return '#00ff41';
      case 'lost': return '#ff4444';
      case 'pending': return '#ffff00';
      default: return '#666';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch(status) {
      case 'won': return '🏆';
      case 'lost': return '💔';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const weeklyParlays = userParlays.filter(p => p.week === selectedWeek);
  const uniqueWeeks = [...new Set(userParlays.map(p => p.week))];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#000000', dark: '#000000' }}
      headerImage={
        <View style={styles.headerContainer}>
          {/* Animated Logo */}
          <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.8}>
            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  transform: [
                    { scale: pulseAnim },
                    { scale: scaleAnim }
                  ],
                },
              ]}
            >
              <BetFantasyLogo size={120} />
              
              {tapCount > 0 && (
                <Animated.Text style={[styles.tapCounter, { color: neonColor }]}>
                  +{tapCount * 50} XP!
                </Animated.Text>
              )}
            </Animated.View>
          </TouchableOpacity>
          
          {/* User Info */}
          <View style={styles.userInfo}>
            <ThemedText style={styles.username}>
              {currentUser?.username || 'Loading...'}
            </ThemedText>
            <ThemedText style={styles.userLevel}>
              {currentUser?.level || 'Loading...'}
            </ThemedText>
          </View>
        </View>
      }>
      
      {/* Stats Overview */}
      <ThemedView style={styles.statsSection}>
        <ThemedText style={styles.sectionTitle}>📊 Your Stats</ThemedText>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: neonColor }]}>
            <Text style={[styles.statNumber, { color: neonColor }]}>{currentUser?.totalPoints || 0}</Text>
            <ThemedText style={styles.statLabel}>Total Points</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#ff8800' }]}>#{currentUser?.weeklyRank || '--'}</Text>
            <ThemedText style={styles.statLabel}>Weekly Rank</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#ff00ff' }]}>{currentUser?.winStreak || 0}</Text>
            <ThemedText style={styles.statLabel}>Win Streak</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#00ff88' }]}>{currentUser?.perfectCards || 0}</Text>
            <ThemedText style={styles.statLabel}>Perfect Cards</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Badges */}
      <ThemedView style={styles.badgesSection}>
        <ThemedText style={styles.sectionTitle}>🏆 Achievements</ThemedText>
        <View style={styles.badgesContainer}>
          {currentUser?.badges.map((badge, index) => (
            <View key={index} style={[styles.badge, { borderColor: neonColor }]}>
              <ThemedText style={styles.badgeText}>{badge}</ThemedText>
            </View>
          )) || (
            <ThemedText style={styles.noBadgesText}>No badges yet - start playing to earn some!</ThemedText>
          )}
        </View>
      </ThemedView>

      {/* Weekly Parlays */}
      <ThemedView style={styles.parlaysSection}>
        <ThemedText style={styles.sectionTitle}>🎯 My Parlays</ThemedText>
        
        {/* Week Selector */}
        <View style={styles.weekSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {uniqueWeeks.map((week) => (
              <TouchableOpacity
                key={week}
                style={[
                  styles.weekButton,
                  selectedWeek === week && { 
                    backgroundColor: neonColor,
                    borderColor: neonColor 
                  }
                ]}
                onPress={() => setSelectedWeek(week)}
              >
                <Text style={[
                  styles.weekButtonText,
                  selectedWeek === week && styles.selectedWeekText
                ]}>
                  {week}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Parlay Cards */}
        {weeklyParlays.length > 0 ? (
          weeklyParlays.map((parlay) => (
            <View key={parlay.id} style={[styles.parlayCard, { borderColor: getStatusColor(parlay.status) }]}>
              <View style={styles.parlayHeader}>
                <View style={styles.parlayTitle}>
                  <Text style={styles.statusEmoji}>{getStatusEmoji(parlay.status)}</Text>
                  <ThemedText style={styles.parlayName}>{parlay.templateName}</ThemedText>
                </View>
                <View style={[styles.pointsBadge, { backgroundColor: getStatusColor(parlay.status) }]}>
                  <Text style={styles.pointsText}>+{parlay.points} pts</Text>
                </View>
              </View>
              
              <View style={styles.picksContainer}>
                {parlay.picks.map((pick, index) => (
                  <View key={index} style={styles.pickRow}>
                    <ThemedText style={styles.pickText}>
                      • {pick.final} {pick.result === 'won' ? '✅' : pick.result === 'lost' ? '❌' : '⏳'}
                    </ThemedText>
                    {pick.odds && (
                      <Text style={[styles.pickOdds, { color: getStatusColor(parlay.status) }]}>
                        {OddsService.formatOdds(pick.odds)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              
              {/* Parlay Payout Info */}
              {parlay.picks.every(p => p.odds) && (
                <View style={styles.payoutContainer}>
                  {(() => {
                    const allOdds = parlay.picks.map(p => p.odds!);
                    const payout = OddsService.calculateParlayPayout(allOdds, 100);
                    return (
                      <View style={styles.payoutRow}>
                        <ThemedText style={styles.payoutLabel}>
                          Parlay Odds: {payout.formattedOdds}
                        </ThemedText>
                        <ThemedText style={styles.payoutValue}>
                          $100 → ${payout.payout} (${payout.profit} profit)
                        </ThemedText>
                      </View>
                    );
                  })()}
                </View>
              )}
              
              <ThemedText style={styles.submittedDate}>
                Submitted: {new Date(parlay.submittedAt).toLocaleDateString()}
              </ThemedText>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <ThemedText style={styles.emptyTitle}>No parlays for {selectedWeek}</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Head to Explore to build your first parlay!
            </ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Account Info */}
      <ThemedView style={styles.accountSection}>
        <ThemedText style={styles.sectionTitle}>⚙️ Account</ThemedText>
        <View style={styles.accountInfo}>
          <ThemedText style={styles.accountText}>
            Member since: {currentUser?.joinedDate || 'Unknown'}
          </ThemedText>
          <ThemedText style={styles.accountText}>
            Overall Rank: #{currentUser?.overallRank || '--'}
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={[styles.settingsButton, { borderColor: neonColor }]}
          onPress={() => AuthService.logout().then(() => router.replace('/login'))}
        >
          <ThemedText style={[styles.settingsText, { color: neonColor }]}>
            Logout
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tapCounter: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'currentColor',
    textShadowRadius: 10,
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },

  // Stats Section
  statsSection: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },

  // Badges Section
  badgesSection: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Parlays Section
  parlaysSection: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
  },
  weekSelector: {
    marginBottom: 20,
  },
  weekButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  selectedWeekText: {
    color: '#000',
    fontWeight: 'bold',
  },
  parlayCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  parlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  parlayTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  parlayName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  pointsText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  picksContainer: {
    marginBottom: 10,
  },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  pickText: {
    fontSize: 14,
    flex: 1,
  },
  pickOdds: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  payoutContainer: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  payoutRow: {
    alignItems: 'center',
  },
  payoutLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  payoutValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ff41',
  },
  submittedDate: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },

  // Account Section
  accountSection: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
    marginBottom: 30,
  },
  accountInfo: {
    marginBottom: 20,
  },
  accountText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  settingsButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noBadgesText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
