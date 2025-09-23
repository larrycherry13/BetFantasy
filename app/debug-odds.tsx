import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function DebugOddsScreen() {
  const [rawData, setRawData] = useState<any>(null);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>('');

  const runFullDebug = async () => {
    setLoading(true);
    setError(null);
    setStep('Starting debug...');
    
    try {
      // Step 1: Check basic NFL odds
      setStep('Step 1: Fetching basic NFL odds...');
      const basicOdds = await fetch(
        `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=f700c3977eb5615ebf32b0a58de3c596&regions=us&oddsFormat=american&dateFormat=iso`
      );
      
      if (!basicOdds.ok) {
        throw new Error(`Basic odds API Error: ${basicOdds.status}`);
      }
      
      const basicData = await basicOdds.json();
      console.log('Basic NFL odds response:', basicData);
      
      setStep(`Step 1 Complete: Found ${basicData.length} games`);
      
      if (basicData.length === 0) {
        setStep('❌ No NFL games found - likely off-season or no upcoming games');
        setRawData({ step: 'no_games', data: basicData });
        return;
      }
      
      // Step 2: Analyze available markets
      setStep('Step 2: Analyzing available markets...');
      const markets = new Set<string>();
      const bookmakerInfo: any = {};
      
      for (const game of basicData) {
        for (const bookmaker of game.bookmakers) {
          if (!bookmakerInfo[bookmaker.title]) {
            bookmakerInfo[bookmaker.title] = new Set();
          }
          for (const market of bookmaker.markets) {
            markets.add(market.key);
            bookmakerInfo[bookmaker.title].add(market.key);
          }
        }
      }
      
      const allMarkets = Array.from(markets);
      setAvailableMarkets(allMarkets);
      setStep(`Step 2 Complete: Found ${allMarkets.length} market types`);
      
      // Step 3: Try to fetch player props with different approaches
      setStep('Step 3: Trying different player prop approaches...');
      
      const playerPropAttempts = [];
      
      // Attempt 1: Try all available markets that might contain player data
      const possiblePlayerMarkets = allMarkets.filter(market => 
        market.includes('player') || 
        market.includes('touchdown') || 
        market.includes('td') ||
        market.includes('scorer') ||
        market.includes('prop')
      );
      
      for (const market of possiblePlayerMarkets) {
        try {
          setStep(`Step 3.${possiblePlayerMarkets.indexOf(market) + 1}: Trying market "${market}"...`);
          const response = await fetch(
            `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=f700c3977eb5615ebf32b0a58de3c596&regions=us&markets=${market}&oddsFormat=american&dateFormat=iso`
          );
          
          if (response.ok) {
            const data = await response.json();
            playerPropAttempts.push({
              market,
              success: true,
              games: data.length,
              sampleData: data.slice(0, 1)
            });
            console.log(`Market "${market}" response:`, data);
          } else {
            playerPropAttempts.push({
              market,
              success: false,
              error: response.status
            });
          }
        } catch (err) {
          playerPropAttempts.push({
            market,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }
      
      // Step 4: Check if we can get event-specific odds
      setStep('Step 4: Checking event-specific odds...');
      let eventSpecificData = null;
      
      if (basicData.length > 0) {
        const firstGameId = basicData[0].id;
        try {
          const eventResponse = await fetch(
            `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/${firstGameId}/odds?apiKey=f700c3977eb5615ebf32b0a58de3c596&regions=us&oddsFormat=american`
          );
          
          if (eventResponse.ok) {
            eventSpecificData = await eventResponse.json();
            console.log('Event-specific odds:', eventSpecificData);
          }
        } catch (err) {
          console.log('Event-specific odds failed:', err);
        }
      }
      
      setStep('✅ Debug complete!');
      setRawData({
        step: 'complete',
        basicGames: basicData.length,
        availableMarkets: allMarkets,
        bookmakerInfo: Object.keys(bookmakerInfo).map(title => ({
          title,
          markets: Array.from(bookmakerInfo[title])
        })),
        playerPropAttempts,
        eventSpecificData,
        sampleGame: basicData[0]
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Debug failed');
      setStep('❌ Debug failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runFullDebug();
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <ThemedText style={styles.title}>🔍 Odds API Debug</ThemedText>
      </View>
      
      {/* Current Step */}
      <View style={styles.stepContainer}>
        <ThemedText style={styles.stepText}>
          {loading ? step : 'Debug Complete'}
        </ThemedText>
        {loading && (
          <ThemedText style={styles.loadingText}>Please wait...</ThemedText>
        )}
      </View>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={runFullDebug}
        disabled={loading}
      >
        <Text style={styles.refreshText}>
          {loading ? 'Running Debug...' : '🔄 Run Debug Again'}
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {/* Available Markets */}
        {availableMarkets.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>📊 Available Markets</ThemedText>
            <View style={styles.marketsGrid}>
              {availableMarkets.map((market, index) => (
                <View key={index} style={styles.marketChip}>
                  <ThemedText style={styles.marketText}>{market}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Raw Data Display */}
        {rawData && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>🔬 Debug Results</ThemedText>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {JSON.stringify(rawData, null, 2)}
              </Text>
            </View>
          </View>
        )}
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
  stepContainer: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 5,
  },
  refreshButton: {
    backgroundColor: '#00ff41',
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  marketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  marketChip: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  marketText: {
    fontSize: 12,
    fontWeight: '500',
  },
  codeBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#fff',
  },
});
