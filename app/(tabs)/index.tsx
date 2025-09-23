import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BetFantasyLogo } from '@/components/betfantasy-logo';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService, User } from '@/utils/auth';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [tapCount, setTapCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setCurrentUser(user);
  };

  // Continuous pulsing animation
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
    
    // Glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    glow.start();
    
    // Rotation animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    rotate.start();
    
    // Slide animation for rewards
    const slide = Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    slide.start();
  }, []);

  const handleTap = () => {
    setTapCount(tapCount + 1);
    setIsAnimating(true);
    
    // Tap animation
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
    ]).start(() => setIsAnimating(false));
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const neonColor = colorScheme === 'dark' ? '#00ff41' : '#39ff14';
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#000000', dark: '#000000' }}
      headerImage={
        <View style={styles.neonContainer}>
          {/* Animated background elements */}
          <Animated.View 
            style={[
              styles.rotatingElement,
              { transform: [{ rotate: rotation }] }
            ]}
          />
          
          {/* Main BetFantasy Logo */}
          <TouchableOpacity onPress={handleTap} activeOpacity={0.8}>
            <Animated.View
              style={[
                styles.neonWrapper,
                {
                  transform: [
                    { scale: pulseAnim },
                    { scale: scaleAnim }
                  ],
                },
              ]}
            >
              <BetFantasyLogo size={200} />
              
              {/* Tap counter */}
              {tapCount > 0 && (
                <Animated.Text
                  style={[
                    styles.tapCounter,
                    {
                      color: neonColor,
                      transform: [{ translateY: slideTransform }],
                    },
                  ]}
                >
                  +{tapCount * 100} points!
                </Animated.Text>
              )}
            </Animated.View>
          </TouchableOpacity>
          
          {/* Floating particles */}
          <View style={styles.particlesContainer}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.particle,
                  {
                    backgroundColor: neonColor,
                    left: Math.random() * width,
                    top: Math.random() * 200 + 50,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      }>
      
      {/* Hero Section */}
      <ThemedView style={styles.heroSection}>
        <ThemedText style={styles.heroHeadline}>🏈 BETFANTASY</ThemedText>
        <ThemedText style={styles.heroTagline}>
          Fantasy sports meets parlays. No money. Just bragging rights.
        </ThemedText>
        <TouchableOpacity style={[styles.heroCTA, { backgroundColor: neonColor }]}>
          <Text style={styles.heroCTAText}>Join the Beta →</Text>
        </TouchableOpacity>
      </ThemedView>

      {/* How It Works Section */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>How It Works (3 Steps)</ThemedText>
        
        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={[styles.stepNumberText, { color: neonColor }]}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Fill Your Card</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Each week, you get 5–7 parlay templates. Pick your favorite players and teams to complete the card.
            </ThemedText>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={[styles.stepNumberText, { color: neonColor }]}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Compete With Friends</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Go head-to-head in weekly matchups. Everyone starts fresh—no bankroll management, just pure picks.
            </ThemedText>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={[styles.stepNumberText, { color: neonColor }]}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Score Big</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Your gains = your points. Hit streaks, bonuses, and multipliers keep it exciting all season long.
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Features Grid */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Features Grid</ThemedText>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🔄</Text>
            <ThemedText style={styles.featureTitle}>Weekly Reset</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Everyone starts clean each week—new picks, new chances.
            </ThemedText>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <ThemedText style={styles.featureTitle}>Parlay Templates</ThemedText>
            <ThemedText style={styles.featureDescription}>
              No endless betting menus. Just fun, curated cards anyone can play.
            </ThemedText>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🔥</Text>
            <ThemedText style={styles.featureTitle}>Streak Bonuses</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Hit multiple parlays in a row and unlock extra points.
            </ThemedText>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🏆</Text>
            <ThemedText style={styles.featureTitle}>Badges & Multipliers</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Earn rewards and boosts for milestones like "Perfect Card" or "Underdog Slayer."
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Screenshots Section */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>See BetFantasy in Action</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Simple, addictive, and built for friendly competition.
        </ThemedText>
        <View style={styles.mockupPlaceholder}>
          <Text style={[styles.mockupText, { color: neonColor }]}>
            📱 App Mockups Coming Soon
          </Text>
        </View>
      </ThemedView>

      {/* Social Proof */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Loved by fans. Backed by players.</ThemedText>
        <View style={styles.testimonialCard}>
          <ThemedText style={styles.testimonialText}>
            "Finally—fantasy sports I can actually explain to my friends."
          </ThemedText>
          <ThemedText style={styles.testimonialAuthor}>– Early Tester</ThemedText>
        </View>
      </ThemedView>

      {/* Closing CTA Banner */}
      <ThemedView style={styles.closingCTASection}>
        <ThemedText style={styles.closingTitle}>Are you ready to play BetFantasy?</ThemedText>
        <ThemedText style={styles.closingSubtitle}>
          Sign up now for early access and get your first shot at a Perfect Card Bonus.
        </ThemedText>
        <TouchableOpacity style={[styles.closingCTA, { backgroundColor: neonColor }]}>
          <Text style={styles.closingCTAText}>Join the Beta →</Text>
        </TouchableOpacity>
        
        {currentUser?.isAdmin && (
          <>
            <TouchableOpacity 
              style={[styles.adminButton, { borderColor: '#ff0088' }]}
              onPress={() => router.push('/admin')}
            >
              <Text style={[styles.adminButtonText, { color: '#ff0088' }]}>
                👑 Admin Panel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.adminButton, { borderColor: '#00ff88', marginTop: 10 }]}
              onPress={() => router.push('/test-odds')}
            >
              <Text style={[styles.adminButtonText, { color: '#00ff88' }]}>
                🎯 Test Live Odds
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.adminButton, { borderColor: '#ff00ff', marginTop: 10 }]}
              onPress={() => router.push('/test-player-td')}
            >
              <Text style={[styles.adminButtonText, { color: '#ff00ff' }]}>
                🏈 Test Player TD Odds
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.adminButton, { borderColor: '#ff4444', marginTop: 10 }]}
              onPress={() => router.push('/debug-odds')}
            >
              <Text style={[styles.adminButtonText, { color: '#ff4444' }]}>
                🔍 Debug Odds API
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  neonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  rotatingElement: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(57, 255, 20, 0.2)',
    top: '50%',
    left: '50%',
    marginTop: -100,
    marginLeft: -100,
  },
  neonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
    textTransform: 'uppercase',
    shadowColor: '#39ff14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  tapCounter: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textShadowColor: 'currentColor',
    textShadowRadius: 10,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  addictiveSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    margin: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  addictiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'currentColor',
    textShadowRadius: 10,
  },
  addictiveSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  rewardsSection: {
    margin: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.1)',
  },
  rewardEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  rewardText: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  rewardDesc: {
    fontSize: 14,
    opacity: 0.8,
  },
  claimButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  claimText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  timerContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  timerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  ctaSection: {
    alignItems: 'center',
    padding: 20,
    margin: 10,
  },
  mainCTA: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  mainCTAText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryCTA: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(57, 255, 20, 0.5)',
  },
  secondaryCTAText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  socialProof: {
    margin: 10,
    padding: 15,
    backgroundColor: 'rgba(57, 255, 20, 0.03)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.1)',
  },
  socialText: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.9,
  },

  // New Landing Page Styles
  // Hero Section
  heroSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    margin: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 2,
  },
  heroTagline: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.9,
    lineHeight: 24,
  },
  heroCTA: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroCTAText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // General Section Styles
  section: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 20,
  },

  // How It Works Steps
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.1)',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.1)',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.9,
  },

  // Mockup Placeholder
  mockupPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(57, 255, 20, 0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  mockupText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Testimonial
  testimonialCard: {
    padding: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.1)',
    marginTop: 15,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  testimonialAuthor: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    opacity: 0.8,
  },

  // Closing CTA
  closingCTASection: {
    alignItems: 'center',
    padding: 30,
    margin: 15,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  closingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  closingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.9,
    lineHeight: 22,
  },
  closingCTA: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closingCTAText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  adminButton: {
    marginTop: 15,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
