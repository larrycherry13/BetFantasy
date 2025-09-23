import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OddsData, OddsService } from '@/utils/oddsApi';

export default function TestOddsScreen() {
  const [odds, setOdds] = useState<OddsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchOdds = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const nflOdds = await OddsService.getNFLOdds(forceRefresh);
      console.log('Fetched odds:', nflOdds);
      setOdds(nflOdds.slice(0, 5)); // Show first 5 games
      setLastUpdated(new Date().toLocaleTimeString());
      setIsFromCache(!forceRefresh && nflOdds.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch odds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdds();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>🎯 Live NFL Odds Test</ThemedText>
      
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
          onPress={() => fetchOdds(false)}
          disabled={loading}
        >
          <Text style={styles.refreshText}>
            {loading ? 'Loading...' : '📦 Load (Cache)'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.forceRefreshButton, { flex: 1 }]}
          onPress={() => fetchOdds(true)}
          disabled={loading}
        >
          <Text style={styles.forceRefreshText}>
            {loading ? 'Loading...' : '🌐 Force Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {odds.map((game) => (
          <View key={game.id} style={styles.gameCard}>
            <ThemedText style={styles.gameTitle}>
              {game.away_team} @ {game.home_team}
            </ThemedText>
            <ThemedText style={styles.gameTime}>
              {new Date(game.commence_time).toLocaleString()}
            </ThemedText>
            
            {game.bookmakers.length > 0 && (
              <View style={styles.oddsContainer}>
                <ThemedText style={styles.bookmakerTitle}>
                  {game.bookmakers[0].title}
                </ThemedText>
                
                {game.bookmakers[0].markets.map((market) => (
                  <View key={market.key} style={styles.marketContainer}>
                    <ThemedText style={styles.marketTitle}>
                      {market.key === 'h2h' ? 'Moneyline' : 
                       market.key === 'spreads' ? 'Spread' : 
                       market.key === 'totals' ? 'Over/Under' : market.key}
                    </ThemedText>
                    
                    {market.outcomes.map((outcome, index) => (
                      <View key={index} style={styles.outcomeContainer}>
                        <ThemedText style={styles.outcomeName}>
                          {outcome.name} {outcome.point ? `(${outcome.point})` : ''}
                        </ThemedText>
                        <Text style={styles.outcomePrice}>
                          {OddsService.formatOdds(outcome.price)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        
        {odds.length === 0 && !loading && !error && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No games found. This might be off-season or no games scheduled.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  cacheStatus: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    padding: 12,
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
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    padding: 15,
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
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gameTime: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 15,
  },
  oddsContainer: {
    marginTop: 10,
  },
  bookmakerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00ff41',
  },
  marketContainer: {
    marginBottom: 15,
  },
  marketTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffff00',
  },
  outcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  outcomeName: {
    fontSize: 14,
  },
  outcomePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ff41',
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
