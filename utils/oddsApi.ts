// The Odds API Integration for BetFantasy
// Sign up at: https://the-odds-api.com/
// Free tier: 500 requests/month

import AsyncStorage from '@react-native-async-storage/async-storage';

const ODDS_API_KEY = 'f700c3977eb5615ebf32b0a58de3c596';
const BASE_URL = 'https://api.the-odds-api.com/v4';

// Cache settings
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const CACHE_KEYS = {
  NFL_ODDS: 'nfl_odds_cache',
  NFL_ODDS_TIMESTAMP: 'nfl_odds_timestamp',
  PLAYER_PROPS: 'player_props_cache',
  PLAYER_PROPS_TIMESTAMP: 'player_props_timestamp',
};

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export interface OddsData {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string; // 'h2h' (moneyline), 'spreads', 'totals', 'player_props'
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number; // American odds (e.g., +150, -200)
  point?: number; // For spreads/totals
}

export class OddsService {
  
  // Cache management methods
  static async isCacheValid(timestampKey: string): Promise<boolean> {
    try {
      const timestampStr = await AsyncStorage.getItem(timestampKey);
      if (!timestampStr) return false;
      
      const timestamp = parseInt(timestampStr);
      const now = Date.now();
      const isValid = (now - timestamp) < CACHE_DURATION;
      
      console.log(`Cache check: ${timestampKey}, age: ${(now - timestamp) / 1000 / 60} minutes, valid: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('Cache validation error:', error);
      return false;
    }
  }
  
  static async getCachedData<T>(cacheKey: string): Promise<T | null> {
    try {
      const cachedDataStr = await AsyncStorage.getItem(cacheKey);
      if (!cachedDataStr) return null;
      
      return JSON.parse(cachedDataStr);
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }
  
  static async setCachedData<T>(cacheKey: string, timestampKey: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(timestampKey, Date.now().toString());
      console.log(`Cached data for ${cacheKey}`);
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }
  
  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.NFL_ODDS,
        CACHE_KEYS.NFL_ODDS_TIMESTAMP,
        CACHE_KEYS.PLAYER_PROPS,
        CACHE_KEYS.PLAYER_PROPS_TIMESTAMP,
      ]);
      console.log('Cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
  
  // Get NFL games with odds (with caching)
  static async getNFLOdds(forceRefresh: boolean = false): Promise<OddsData[]> {
    // Check cache first (unless force refresh)
    if (!forceRefresh && await this.isCacheValid(CACHE_KEYS.NFL_ODDS_TIMESTAMP)) {
      const cachedData = await this.getCachedData<OddsData[]>(CACHE_KEYS.NFL_ODDS);
      if (cachedData) {
        console.log('📦 Using cached NFL odds');
        return cachedData;
      }
    }
    
    // Fetch fresh data
    console.log('🌐 Fetching fresh NFL odds from API (1 credit used)');
    try {
      const response = await fetch(
        `${BASE_URL}/sports/americanfootball_nfl/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the fresh data
      await this.setCachedData(CACHE_KEYS.NFL_ODDS, CACHE_KEYS.NFL_ODDS_TIMESTAMP, data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch NFL odds:', error);
      
      // Try to return cached data as fallback
      const cachedData = await this.getCachedData<OddsData[]>(CACHE_KEYS.NFL_ODDS);
      if (cachedData) {
        console.log('⚠️ API failed, using cached data as fallback');
        return cachedData;
      }
      
      return [];
    }
  }
  
  // Get available markets for debugging
  static async getAvailableMarkets(): Promise<string[]> {
    try {
      console.log('🔍 Checking available markets...');
      const response = await fetch(
        `${BASE_URL}/sports/americanfootball_nfl/odds/?apiKey=${ODDS_API_KEY}&regions=us&oddsFormat=american&dateFormat=iso`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      const markets = new Set<string>();
      
      for (const game of data) {
        for (const bookmaker of game.bookmakers) {
          for (const market of bookmaker.markets) {
            markets.add(market.key);
          }
        }
      }
      
      const availableMarkets = Array.from(markets);
      console.log('Available markets:', availableMarkets);
      return availableMarkets;
    } catch (error) {
      console.error('Failed to fetch available markets:', error);
      return [];
    }
  }

  // Get player touchdown odds (with caching) - Updated to try different market keys
  static async getPlayerTouchdownOdds(forceRefresh: boolean = false): Promise<OddsData[]> {
    // Check cache first (unless force refresh)
    if (!forceRefresh && await this.isCacheValid(CACHE_KEYS.PLAYER_PROPS_TIMESTAMP)) {
      const cachedData = await this.getCachedData<OddsData[]>(CACHE_KEYS.PLAYER_PROPS);
      if (cachedData) {
        console.log('📦 Using cached player TD odds');
        return cachedData;
      }
    }
    
    // First, let's check what markets are available
    const availableMarkets = await this.getAvailableMarkets();
    
    // Try different possible market keys for player touchdowns
    const possibleTDMarkets = [
      'player_anytime_td',
      'player_touchdown_scorer',
      'player_props',
      'anytime_touchdown_scorer',
      'first_touchdown_scorer'
    ];
    
    const tdMarket = possibleTDMarkets.find(market => availableMarkets.includes(market));
    
    if (!tdMarket) {
      console.log('⚠️ No player TD markets available. Available markets:', availableMarkets);
      // Return fallback data for now
      return [];
    }
    
    // Fetch fresh data with correct market
    console.log(`🌐 Fetching fresh player TD odds from API using market: ${tdMarket} (1 credit used)`);
    try {
      const response = await fetch(
        `${BASE_URL}/sports/americanfootball_nfl/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=${tdMarket}&oddsFormat=american&dateFormat=iso`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the fresh data
      await this.setCachedData(CACHE_KEYS.PLAYER_PROPS, CACHE_KEYS.PLAYER_PROPS_TIMESTAMP, data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch player TD odds:', error);
      
      // Try to return cached data as fallback
      const cachedData = await this.getCachedData<OddsData[]>(CACHE_KEYS.PLAYER_PROPS);
      if (cachedData) {
        console.log('⚠️ API failed, using cached player TD odds as fallback');
        return cachedData;
      }
      
      return [];
    }
  }

  // Get all player props (with caching) - keeping original for backwards compatibility
  static async getPlayerProps(forceRefresh: boolean = false): Promise<OddsData[]> {
    // Check cache first (unless force refresh)
    if (!forceRefresh && await this.isCacheValid(CACHE_KEYS.PLAYER_PROPS_TIMESTAMP)) {
      const cachedData = await this.getCachedData<OddsData[]>(CACHE_KEYS.PLAYER_PROPS);
      if (cachedData) {
        console.log('📦 Using cached player props');
        return cachedData;
      }
    }
    
    // Fetch fresh data
    console.log('🌐 Fetching fresh player props from API (1 credit used)');
    try {
      const response = await fetch(
        `${BASE_URL}/sports/americanfootball_nfl/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=player_pass_tds,player_pass_yds,player_rush_yds,player_receptions,player_anytime_td&oddsFormat=american`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the fresh data
      await this.setCachedData(CACHE_KEYS.PLAYER_PROPS, CACHE_KEYS.PLAYER_PROPS_TIMESTAMP, data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch player props:', error);
      
      // Try to return cached data as fallback
      const cachedData = await this.getCachedData<OddsData[]>(CACHE_KEYS.PLAYER_PROPS);
      if (cachedData) {
        console.log('⚠️ API failed, using cached player props as fallback');
        return cachedData;
      }
      
      return [];
    }
  }
  
  // Convert American odds to decimal for calculations
  static americanToDecimal(americanOdds: number): number {
    if (americanOdds > 0) {
      return (americanOdds / 100) + 1;
    } else {
      return (100 / Math.abs(americanOdds)) + 1;
    }
  }
  
  // Calculate parlay payout
  static calculateParlayPayout(odds: number[], betAmount: number = 100): number {
    const decimalOdds = odds.map(odd => this.americanToDecimal(odd));
    const combinedOdds = decimalOdds.reduce((acc, odd) => acc * odd, 1);
    return (betAmount * combinedOdds) - betAmount; // Profit
  }
  
  // Get best odds from multiple bookmakers
  static getBestOdds(bookmakers: Bookmaker[], marketKey: string, outcomeName: string): number | null {
    let bestOdds: number | null = null;
    
    for (const bookmaker of bookmakers) {
      const market = bookmaker.markets.find(m => m.key === marketKey);
      if (market) {
        const outcome = market.outcomes.find(o => o.name === outcomeName);
        if (outcome) {
          if (bestOdds === null || outcome.price > bestOdds) {
            bestOdds = outcome.price;
          }
        }
      }
    }
    
    return bestOdds;
  }
  
  // Format odds for display
  static formatOdds(odds: number): string {
    if (odds > 0) {
      return `+${odds}`;
    }
    return `${odds}`;
  }
  
  // Extract touchdown players and their best odds
  static getTouchdownPlayers(tdOddsData: OddsData[]): { name: string; odds: number; team: string }[] {
    const players: { name: string; odds: number; team: string }[] = [];
    
    // Possible TD market keys
    const tdMarketKeys = [
      'player_anytime_td',
      'player_touchdown_scorer', 
      'anytime_touchdown_scorer',
      'first_touchdown_scorer'
    ];
    
    for (const game of tdOddsData) {
      for (const bookmaker of game.bookmakers) {
        // Find any TD market
        const tdMarket = bookmaker.markets.find(m => tdMarketKeys.includes(m.key));
        if (tdMarket) {
          for (const outcome of tdMarket.outcomes) {
            // Check if player already exists, keep best odds
            const existingPlayerIndex = players.findIndex(p => p.name === outcome.name);
            if (existingPlayerIndex >= 0) {
              // Keep the better odds (higher value for positive odds, closer to 0 for negative)
              if (outcome.price > players[existingPlayerIndex].odds) {
                players[existingPlayerIndex].odds = outcome.price;
              }
            } else {
              // Determine team based on game context
              const team = game.home_team; // Could be refined to determine actual team
              players.push({
                name: outcome.name,
                odds: outcome.price,
                team: team
              });
            }
          }
        }
      }
    }
    
    // Sort by odds (best odds first for positive odds)
    return players.sort((a, b) => {
      // For positive odds, higher is better
      // For negative odds, closer to 0 is better (less negative)
      if (a.odds > 0 && b.odds > 0) {
        return b.odds - a.odds; // Higher positive odds first
      } else if (a.odds < 0 && b.odds < 0) {
        return a.odds - b.odds; // Less negative odds first  
      } else if (a.odds > 0 && b.odds < 0) {
        return -1; // Positive odds come first
      } else {
        return 1; // Positive odds come first
      }
    });
  }
  
  // Get popular touchdown players for templates
  static async getPopularTDPlayers(): Promise<string[]> {
    try {
      const tdData = await this.getPlayerTouchdownOdds();
      const players = this.getTouchdownPlayers(tdData);
      
      if (players.length > 0) {
        // Return top 10 players by best odds
        return players.slice(0, 10).map(p => p.name);
      } else {
        console.log('🎯 No live TD data available - using curated player list');
        // Fallback to current NFL stars (updated for 2025 season)
        return [
          'Travis Kelce',
          'Tyreek Hill', 
          'Davante Adams',
          'Cooper Kupp',
          'Christian McCaffrey',
          'Austin Ekeler',
          'Stefon Diggs',
          'Mike Evans',
          'DeAndre Hopkins',
          'Ja\'Marr Chase',
          'CeeDee Lamb',
          'Saquon Barkley',
          'Josh Jacobs',
          'Derrick Henry',
          'A.J. Brown'
        ];
      }
    } catch (error) {
      console.error('Failed to get popular TD players:', error);
      // Fallback to common NFL TD scorers
      return [
        'Travis Kelce',
        'Tyreek Hill', 
        'Davante Adams',
        'Cooper Kupp',
        'Christian McCaffrey',
        'Austin Ekeler',
        'Stefon Diggs',
        'Mike Evans',
        'DeAndre Hopkins',
        'Ja\'Marr Chase'
      ];
    }
  }

  // Get mock TD players with realistic odds for development
  static getMockTDPlayers(): { name: string; odds: number; team: string }[] {
    return [
      { name: 'Travis Kelce', odds: 140, team: 'Kansas City Chiefs' },
      { name: 'Christian McCaffrey', odds: 120, team: 'San Francisco 49ers' },
      { name: 'Tyreek Hill', odds: 180, team: 'Miami Dolphins' },
      { name: 'Cooper Kupp', odds: 160, team: 'Los Angeles Rams' },
      { name: 'Davante Adams', odds: 190, team: 'Las Vegas Raiders' },
      { name: 'Stefon Diggs', odds: 200, team: 'Buffalo Bills' },
      { name: 'CeeDee Lamb', odds: 170, team: 'Dallas Cowboys' },
      { name: 'A.J. Brown', odds: 185, team: 'Philadelphia Eagles' },
      { name: 'Mike Evans', odds: 220, team: 'Tampa Bay Buccaneers' },
      { name: 'Saquon Barkley', odds: 150, team: 'New York Giants' },
      { name: 'Josh Jacobs', odds: 130, team: 'Las Vegas Raiders' },
      { name: 'Derrick Henry', odds: 140, team: 'Tennessee Titans' },
      { name: 'Austin Ekeler', odds: 160, team: 'Los Angeles Chargers' },
      { name: 'DeAndre Hopkins', odds: 240, team: 'Arizona Cardinals' },
      { name: 'Ja\'Marr Chase', odds: 210, team: 'Cincinnati Bengals' }
    ];
  }
  
  // Get live games for current week (uses cached data by default)
  static async getCurrentWeekGames(forceRefresh: boolean = false): Promise<OddsData[]> {
    const allGames = await this.getNFLOdds(forceRefresh);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return allGames.filter(game => {
      const gameTime = new Date(game.commence_time);
      return gameTime >= now && gameTime <= weekFromNow;
    });
  }
  
  // Get odds for a specific pick type
  static async getPickOdds(pickTemplate: string, selection: string): Promise<{ odds: number; description: string } | null> {
    try {
      const games = await this.getCurrentWeekGames();
      const tdData = await this.getPlayerTouchdownOdds();
      
      // Handle different pick types
      if (pickTemplate.includes('Moneyline')) {
        // Find game with this team
        for (const game of games) {
          if (game.home_team === selection || game.away_team === selection) {
            const odds = this.getBestOdds(game.bookmakers, 'h2h', selection);
            if (odds) {
              return {
                odds,
                description: `${selection} Moneyline`
              };
            }
          }
        }
      }
      
      else if (pickTemplate.includes('Anytime Touchdown')) {
        // Check live TD data first
        const tdPlayers = this.getTouchdownPlayers(tdData);
        const player = tdPlayers.find(p => p.name === selection);
        if (player) {
          return {
            odds: player.odds,
            description: `${selection} Anytime TD`
          };
        }
        
        // Fallback to mock data
        const mockPlayers = this.getMockTDPlayers();
        const mockPlayer = mockPlayers.find(p => p.name === selection);
        if (mockPlayer) {
          return {
            odds: mockPlayer.odds,
            description: `${selection} Anytime TD`
          };
        }
      }
      
      else if (pickTemplate.includes('Over') && pickTemplate.includes('Total Points')) {
        // Find game and get over/under odds
        const matchingGame = games.find(game => 
          pickTemplate.includes(game.home_team) || pickTemplate.includes(game.away_team) ||
          pickTemplate.includes(`${game.away_team} vs ${game.home_team}`) ||
          pickTemplate.includes(`${game.home_team} vs ${game.away_team}`)
        );
        
        if (matchingGame) {
          const overOdds = this.getBestOdds(matchingGame.bookmakers, 'totals', 'Over');
          if (overOdds) {
            // Extract the total from template (e.g., "Over 52.5 Total Points" -> 52.5)
            const totalMatch = pickTemplate.match(/Over (\d+\.?\d*)/);
            const total = totalMatch ? totalMatch[1] : 'TBD';
            return {
              odds: overOdds,
              description: `Over ${total} Total Points`
            };
          }
        }
      }
      
      else if (pickTemplate.includes('Spread')) {
        // Handle spread bets
        for (const game of games) {
          if (game.home_team === selection || game.away_team === selection) {
            const spreadOdds = this.getBestOdds(game.bookmakers, 'spreads', selection);
            if (spreadOdds) {
              // Extract spread from template
              const spreadMatch = pickTemplate.match(/([+-]\d+\.?\d*)/);
              const spread = spreadMatch ? spreadMatch[1] : '';
              return {
                odds: spreadOdds,
                description: `${selection} ${spread}`
              };
            }
          }
        }
      }
      
      // Default fallback with estimated odds
      return {
        odds: this.getEstimatedOdds(pickTemplate),
        description: `${selection} (Estimated)`
      };
      
    } catch (error) {
      console.error('Failed to get pick odds:', error);
      return {
        odds: this.getEstimatedOdds(pickTemplate),
        description: `${selection} (Estimated)`
      };
    }
  }
  
  // Get estimated odds based on pick type (fallback)
  static getEstimatedOdds(pickTemplate: string): number {
    if (pickTemplate.includes('Anytime Touchdown')) return 180;
    if (pickTemplate.includes('Moneyline')) return -110;
    if (pickTemplate.includes('Over') || pickTemplate.includes('Under')) return -110;
    if (pickTemplate.includes('Spread')) return -110;
    if (pickTemplate.includes('Passing Yards')) return -115;
    if (pickTemplate.includes('Rushing Yards')) return -120;
    if (pickTemplate.includes('Receiving Yards')) return -115;
    if (pickTemplate.includes('Completions')) return -110;
    if (pickTemplate.includes('Passing TDs')) return 150;
    return -110; // Default
  }
  
  // Calculate total parlay odds and payout
  static calculateParlayPayout(individualOdds: number[], betAmount: number = 100): {
    totalOdds: number;
    payout: number;
    profit: number;
    formattedOdds: string;
  } {
    // Convert all odds to decimal
    const decimalOdds = individualOdds.map(odds => this.americanToDecimal(odds));
    
    // Calculate combined decimal odds
    const combinedDecimal = decimalOdds.reduce((acc, odds) => acc * odds, 1);
    
    // Convert back to American odds
    const americanOdds = combinedDecimal >= 2 
      ? Math.round((combinedDecimal - 1) * 100)
      : Math.round(-100 / (combinedDecimal - 1));
    
    // Calculate payout
    const totalPayout = betAmount * combinedDecimal;
    const profit = totalPayout - betAmount;
    
    return {
      totalOdds: americanOdds,
      payout: Math.round(totalPayout * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      formattedOdds: this.formatOdds(americanOdds)
    };
  }
  
  // Map template picks to real odds
  static async getTemplateOdds(templateId: number): Promise<any> {
    const games = await this.getCurrentWeekGames();
    
    // Example mapping for Template 1 (Easy - Beginner Boost)
    if (templateId === 1) {
      const sampleGame = games[0];
      if (!sampleGame) return null;
      
      return {
        moneylineOdds: {
          [sampleGame.home_team]: this.getBestOdds(sampleGame.bookmakers, 'h2h', sampleGame.home_team),
          [sampleGame.away_team]: this.getBestOdds(sampleGame.bookmakers, 'h2h', sampleGame.away_team)
        },
        totalOdds: {
          over: this.getBestOdds(sampleGame.bookmakers, 'totals', 'Over'),
          under: this.getBestOdds(sampleGame.bookmakers, 'totals', 'Under')
        },
        game: sampleGame
      };
    }
    
    return null;
  }
}

// Example usage:
/*
// In your component:
const [liveOdds, setLiveOdds] = useState(null);

useEffect(() => {
  const fetchOdds = async () => {
    const odds = await OddsService.getTemplateOdds(templateId);
    setLiveOdds(odds);
  };
  
  fetchOdds();
}, [templateId]);
*/
