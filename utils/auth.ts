import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  joinedDate: string;
  totalPoints: number;
  weeklyRank: number;
  overallRank: number;
  winStreak: number;
  perfectCards: number;
  level: string;
  badges: string[];
  inviteCode?: string;
}

export interface Parlay {
  id: string;
  userId: string;
  week: string;
  templateId: number;
  templateName: string;
  status: 'pending' | 'won' | 'lost';
  points: number;
  picks: {
    template: string;
    selection: string;
    final: string;
    odds?: number;
    oddsDescription?: string;
    result?: 'won' | 'lost';
  }[];
  submittedAt: string;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  ALL_USERS: 'allUsers',
  ALL_PARLAYS: 'allParlays',
  INVITE_CODES: 'inviteCodes',
};

// Initialize default admin user
const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  isAdmin: true,
  joinedDate: 'September 2024',
  totalPoints: 9999,
  weeklyRank: 1,
  overallRank: 1,
  winStreak: 10,
  perfectCards: 5,
  level: 'Founder',
  badges: ['👑 Admin', '🚀 Founder', '🔥 Legend'],
};

// Initialize default invite codes
const DEFAULT_INVITE_CODES = [
  'BETA2024',
  'FOUNDER',
  'PARLAY123',
  'MVPTEST',
  'FANTASY24'
];

export class AuthService {
  
  // Initialize the app with default data
  static async initialize() {
    try {
      // Check if users exist, if not create admin
      const users = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (!users) {
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify([DEFAULT_ADMIN]));
      }
      
      // Check if invite codes exist
      const inviteCodes = await AsyncStorage.getItem(STORAGE_KEYS.INVITE_CODES);
      if (!inviteCodes) {
        await AsyncStorage.setItem(STORAGE_KEYS.INVITE_CODES, JSON.stringify(DEFAULT_INVITE_CODES));
      }
      
      // Initialize empty parlays if needed
      const parlays = await AsyncStorage.getItem(STORAGE_KEYS.ALL_PARLAYS);
      if (!parlays) {
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_PARLAYS, JSON.stringify([]));
      }
      
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }
  
  // Login with username and password (or invite code for new users)
  static async login(username: string, passwordOrInvite: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const usersData = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      
      // Check if user exists
      const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (existingUser) {
        // Existing user login (for MVP, password is just 'password' or their username)
        if (passwordOrInvite === 'password' || passwordOrInvite === username || existingUser.isAdmin) {
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(existingUser));
          return { success: true, user: existingUser };
        } else {
          return { success: false, error: 'Invalid password' };
        }
      } else {
        // New user with invite code
        const inviteCodesData = await AsyncStorage.getItem(STORAGE_KEYS.INVITE_CODES);
        const inviteCodes: string[] = inviteCodesData ? JSON.parse(inviteCodesData) : [];
        
        if (!inviteCodes.includes(passwordOrInvite)) {
          return { success: false, error: 'Invalid invite code' };
        }
        
        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          username,
          isAdmin: false,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          totalPoints: 0,
          weeklyRank: users.length + 1,
          overallRank: users.length + 1,
          winStreak: 0,
          perfectCards: 0,
          level: 'Rookie',
          badges: ['🆕 New Player'],
          inviteCode: passwordOrInvite,
        };
        
        // Add to users list
        users.push(newUser);
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
        
        // Remove used invite code
        const remainingCodes = inviteCodes.filter(code => code !== passwordOrInvite);
        await AsyncStorage.setItem(STORAGE_KEYS.INVITE_CODES, JSON.stringify(remainingCodes));
        
        return { success: true, user: newUser };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }
  
  // Get current logged in user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }
  
  // Logout
  static async logout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  
  // Admin: Get all users
  static async getAllUsers(): Promise<User[]> {
    try {
      const usersData = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      return [];
    }
  }
  
  // Admin: Create invite code
  static async createInviteCode(code: string): Promise<boolean> {
    try {
      const inviteCodesData = await AsyncStorage.getItem(STORAGE_KEYS.INVITE_CODES);
      const inviteCodes: string[] = inviteCodesData ? JSON.parse(inviteCodesData) : [];
      
      if (!inviteCodes.includes(code)) {
        inviteCodes.push(code);
        await AsyncStorage.setItem(STORAGE_KEYS.INVITE_CODES, JSON.stringify(inviteCodes));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  
  // Admin: Get all invite codes
  static async getInviteCodes(): Promise<string[]> {
    try {
      const inviteCodesData = await AsyncStorage.getItem(STORAGE_KEYS.INVITE_CODES);
      return inviteCodesData ? JSON.parse(inviteCodesData) : [];
    } catch (error) {
      return [];
    }
  }
  
  // Save parlay
  static async saveParlay(parlay: Omit<Parlay, 'id' | 'submittedAt'>): Promise<boolean> {
    try {
      const parlaysData = await AsyncStorage.getItem(STORAGE_KEYS.ALL_PARLAYS);
      const parlays: Parlay[] = parlaysData ? JSON.parse(parlaysData) : [];
      
      const newParlay: Parlay = {
        ...parlay,
        id: `parlay-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
      
      parlays.push(newParlay);
      await AsyncStorage.setItem(STORAGE_KEYS.ALL_PARLAYS, JSON.stringify(parlays));
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Get user's parlays
  static async getUserParlays(userId: string): Promise<Parlay[]> {
    try {
      const parlaysData = await AsyncStorage.getItem(STORAGE_KEYS.ALL_PARLAYS);
      const allParlays: Parlay[] = parlaysData ? JSON.parse(parlaysData) : [];
      return allParlays.filter(p => p.userId === userId);
    } catch (error) {
      return [];
    }
  }
  
  // Admin: Get all parlays
  static async getAllParlays(): Promise<Parlay[]> {
    try {
      const parlaysData = await AsyncStorage.getItem(STORAGE_KEYS.ALL_PARLAYS);
      return parlaysData ? JSON.parse(parlaysData) : [];
    } catch (error) {
      return [];
    }
  }
  
  // Admin: Update parlay result
  static async updateParlayResult(parlayId: string, status: 'won' | 'lost', points: number): Promise<boolean> {
    try {
      const parlaysData = await AsyncStorage.getItem(STORAGE_KEYS.ALL_PARLAYS);
      const parlays: Parlay[] = parlaysData ? JSON.parse(parlaysData) : [];
      
      const parlayIndex = parlays.findIndex(p => p.id === parlayId);
      if (parlayIndex >= 0) {
        parlays[parlayIndex].status = status;
        parlays[parlayIndex].points = points;
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_PARLAYS, JSON.stringify(parlays));
        
        // Update user points
        await this.updateUserPoints(parlays[parlayIndex].userId, points);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  
  // Update user points
  private static async updateUserPoints(userId: string, pointsToAdd: number) {
    try {
      const usersData = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
        users[userIndex].totalPoints += pointsToAdd;
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
        
        // Update current user if it's the same
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          currentUser.totalPoints += pointsToAdd;
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        }
      }
    } catch (error) {
      console.error('Failed to update user points:', error);
    }
  }
}
