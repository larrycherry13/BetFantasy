import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OddsService } from '@/utils/oddsApi';

export default function TestPlayerTDScreen() {
  const [players, setPlayers] = useState<{ name: string; odds: number; team: string }[]>([]);
  const [popularPlayers, setPopularPlayers] = useState<string[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchTDOdds = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch touchdown odds
      const tdData = await OddsService.getPlayerTouchdownOdds(forceRefresh);
      const tdPlayers = OddsService.getTouchdownPlayers(tdData);
      
      console.log('Fetched TD players:', tdPlayers);
      
      // If no live data, use mock data for development
      if (tdPlayers.length === 0) {
        console.log('🎯 Using mock TD data for development');
        const mockPlayers = OddsService.getMockTDPlayers();
        setPlayers(mockPlayers);
        setLastUpdated(new Date().toLocaleTimeString());
        setIsFromCache(false);
        setError('Live TD data not available - showing mock data for development');
      } else {
        setPlayers(tdPlayers.slice(0, 20)); // Show top 20
        setLastUpdated(new Date().toLocaleTimeString());
        setIsFromCache(!forceRefresh && tdPlayers.length > 0);
        setError(null);
      }
      
      // Also get popular players for template use
      const popular = await OddsService.getPopularTDPlayers();
      setPopularPlayers(popular);
      
    } catch (err) {
      // Fallback to mock data on error
      console.log('🎯 API error - using mock TD data for development');
      const mockPlayers = OddsService.getMockTDPlayers();
      setPlayers(mockPlayers);
      setError('API Error - showing mock data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const checkAvailableMarkets = async () => {
    setLoading(true);
    try {
      const markets = await OddsService.getAvailableMarkets();
      setAvailableMarkets(markets);
      console.log('Available markets:', markets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTDOdds();
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <ThemedText style={styles.title}>🏈 Player TD Odds</ThemedText>
      </View>
      
      {/* Cache Status */}
      {lastUpdated && (
        <View style={styles.cacheStatus}>
          <ThemedText style={styles.cacheText}>
            {isFromCache ? '📦 From Cache' : '🌐 Fresh Data'} • Last updated: {lastUpdated}
          </ThemedText>
        </View>
      )}
      
      {/* Refresh Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.refreshButton, { flex: 1, marginRight: 10 }]}
          onPress={() => fetchTDOdds(false)}
          disabled={loading}
        >
          <Text style={styles.refreshText}>
            {loading ? 'Loading...' : '📦 Load (Cache)'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.forceRefreshButton, { flex: 1 }]}
          onPress={() => fetchTDOdds(true)}
          disabled={loading}
        >
          <Text style={styles.forceRefreshText}>
            {loading ? 'Loading...' : '🌐 Force Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug Button */}
      <View style={styles.debugContainer}>
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={checkAvailableMarkets}
          disabled={loading}
        >
          <Text style={styles.debugText}>
            🔍 Check Available Markets
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {/* Available Markets Section */}
        {availableMarkets.length > 0 && (
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>🔍 Available Markets</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Markets currently available in the API
            </ThemedText>
            
            <View style={styles.marketsGrid}>
              {availableMarkets.map((market, index) => (
                <View key={index} style={styles.marketChip}>
                  <ThemedText style={styles.marketText}>{market}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Popular Players Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>🌟 Popular TD Players</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Perfect for your parlay templates
          </ThemedText>
          
          <View style={styles.popularGrid}>
            {popularPlayers.map((player, index) => (
              <View key={index} style={styles.popularPlayer}>
                <ThemedText style={styles.popularPlayerText}>{player}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Live Odds Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>⚡ Live TD Odds</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Real-time anytime touchdown odds
          </ThemedText>
          
          {players.map((player, index) => (
            <View key={index} style={styles.playerCard}>
              <View style={styles.playerInfo}>
                <ThemedText style={styles.playerName}>{player.name}</ThemedText>
                <ThemedText style={styles.playerTeam}>{player.team}</ThemedText>
              </View>
              <View style={styles.oddsContainer}>
                <Text style={styles.oddsText}>
                  {OddsService.formatOdds(player.odds)}
                </Text>
                <ThemedText style={styles.oddsLabel}>Anytime TD</ThemedText>
              </View>
            </View>
          ))}
          
          {players.length === 0 && !loading && !error && (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No player TD odds found. This might be off-season or no games scheduled.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cacheStatus: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  cacheText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#00ff41',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  refreshText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  forceRefreshButton: {
    backgroundColor: '#ff8800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  forceRefreshText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  debugButton: {
    backgroundColor: '#8800ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  debugText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  marketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  marketChip: {
    backgroundColor: 'rgba(136, 0, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(136, 0, 255, 0.3)',
  },
  marketText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    margin: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  popularPlayer: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  popularPlayerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerTeam: {
    fontSize: 14,
    opacity: 0.8,
  },
  oddsContainer: {
    alignItems: 'center',
  },
  oddsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff41',
    marginBottom: 2,
  },
  oddsLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});
