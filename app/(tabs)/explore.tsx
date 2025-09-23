import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BetFantasyLogo } from '@/components/betfantasy-logo';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

const parlayTemplates = [
  {
    id: 1,
    name: "Easy — Beginner Boost",
    difficulty: "🟢",
    legs: 2,
    picks: [
      "[Team] Moneyline",
      "Over/Under [X] Total Points"
    ],
    description: "Simple 2-leg pick, low barrier to entry.",
    color: "#00ff41",
    riskLevel: "Low"
  },
  {
    id: 2,
    name: "Classic Duo",
    difficulty: "🟡",
    legs: 2,
    picks: [
      "[Player] Over [X] Rushing Yards",
      "[Team] Moneyline"
    ],
    description: "Mix of player + team outcome.",
    color: "#ffff00",
    riskLevel: "Low"
  },
  {
    id: 3,
    name: "Triple Threat",
    difficulty: "🟠",
    legs: 3,
    picks: [
      "[Player] Anytime Touchdown",
      "[Quarterback] Over [X] Passing Yards",
      "[Team] Over [X] Points"
    ],
    description: "Three-leg combo, still straightforward.",
    color: "#ff8800",
    riskLevel: "Medium"
  },
  {
    id: 4,
    name: "Underdog Challenge",
    difficulty: "🟠",
    legs: 3,
    picks: [
      "[Underdog Team] Spread (+X.5)",
      "[Player] Over [X] Receiving Yards",
      "Game Total Over/Under [X]"
    ],
    description: "Rewards picking an underdog + player prop.",
    color: "#ff4444",
    riskLevel: "Medium"
  },
  {
    id: 5,
    name: "The Balanced 4-Pack",
    difficulty: "🔴",
    legs: 4,
    picks: [
      "[Team] Moneyline",
      "[Player] Anytime Touchdown",
      "[Quarterback] Over [X] Completions",
      "Game Total Over/Under [X]"
    ],
    description: "Well-rounded parlay with offense spread across positions.",
    color: "#ff0088",
    riskLevel: "High"
  },
  {
    id: 6,
    name: "The Risky 5-Layer",
    difficulty: "🔴",
    legs: 5,
    picks: [
      "[Player] Over [X] Rushing Yards",
      "[Player] Anytime Touchdown",
      "[Quarterback] Over [X] Passing Yards",
      "[Team] Spread (-X.5)",
      "Total Points Over/Under [X]"
    ],
    description: "Higher risk with 5 combined outcomes.",
    color: "#8800ff",
    riskLevel: "High"
  },
  {
    id: 7,
    name: "High-Roller Jackpot",
    difficulty: "🟣",
    legs: 6,
    picks: [
      "[Quarterback] Over [X] Passing TDs",
      "[Player] 100+ Rushing Yards",
      "[Player] 100+ Receiving Yards",
      "[Team] Moneyline",
      "Total Points Over [X]",
      "[Defense] 1+ Interception"
    ],
    description: "Big 6-leg parlay designed to feel like the \"jackpot card.\"",
    color: "#ff00ff",
    riskLevel: "Extreme"
  }
];

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  
  // Create refs for each template animation
  const dragAnimations = parlayTemplates.map(() => useRef(new Animated.Value(1)).current);
  
  // Animation values for the logo (same as home page)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const neonColor = colorScheme === 'dark' ? '#00ff41' : '#39ff14';

  // Logo animation (same as home page)
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
    ]).start();
  };

  const handleTemplatePress = (template: any, index: number) => {
    setSelectedTemplate(selectedTemplate === template.id ? null : template.id);
    
    // Bounce animation
    Animated.sequence([
      Animated.timing(dragAnimations[index], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dragAnimations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#000000', dark: '#000000' }}
      headerImage={
        <View style={styles.neonContainer}>
          {/* Animated background elements */}
          <Animated.View 
            style={[
              styles.rotatingElement,
              { transform: [{ rotate: '0deg' }] }
            ]}
          />
          
          {/* Main BetFantasy Logo */}
          <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.8}>
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
                    left: Math.random() * 300,
                    top: Math.random() * 200 + 50,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      }>
      
      {/* Header Section */}
      <ThemedView style={styles.headerSection}>
        <ThemedText style={styles.headerTitle}>🔹 Parlay Templates</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Choose your challenge level and start building winning parlays!
        </ThemedText>
      </ThemedView>

      {/* Templates Grid */}
      <ThemedView style={styles.templatesSection}>
        {parlayTemplates.map((template, index) => (
          <TouchableOpacity
            key={template.id}
            onPress={() => handleTemplatePress(template, index)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.templateCard,
                {
                  borderColor: template.color,
                  backgroundColor: selectedTemplate === template.id 
                    ? `${template.color}20` 
                    : 'rgba(0, 0, 0, 0.05)',
                  transform: [{ scale: dragAnimations[index] }],
                },
              ]}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.difficultyContainer}>
                  <Text style={styles.difficultyIcon}>{template.difficulty}</Text>
                  <Text style={[styles.riskLevel, { color: template.color }]}>
                    {template.riskLevel}
                  </Text>
                </View>
                <View style={styles.legsContainer}>
                  <Text style={[styles.legsText, { color: template.color }]}>
                    {template.legs} Legs
                  </Text>
                </View>
              </View>

              {/* Template Name */}
              <ThemedText style={styles.templateName}>{template.name}</ThemedText>

              {/* Picks List */}
              <View style={styles.picksContainer}>
                {template.picks.map((pick, pickIndex) => (
                  <View key={pickIndex} style={styles.pickItem}>
                    <Text style={[styles.pickBullet, { color: template.color }]}>•</Text>
                    <ThemedText style={styles.pickText}>{pick}</ThemedText>
                  </View>
                ))}
              </View>

              {/* Description */}
              <ThemedText style={styles.templateDescription}>
                {template.description}
              </ThemedText>

              {/* Action Button */}
              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  style={[styles.selectButton, { backgroundColor: template.color }]}
                  onPress={() => router.push(`/parlay-builder?templateId=${template.id}`)}
                >
                  <Text style={styles.selectButtonText}>
                    Build Parlay →
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Bottom CTA */}
      <ThemedView style={styles.bottomSection}>
        <ThemedText style={styles.bottomTitle}>Ready to Build Your Parlay?</ThemedText>
        <ThemedText style={styles.bottomSubtitle}>
          Start with an easy template and work your way up to the jackpot!
        </ThemedText>
        <TouchableOpacity 
          style={[styles.buildButton, { backgroundColor: neonColor }]}
          onPress={() => router.push('/parlay-builder?templateId=1')}
        >
          <Text style={styles.buildButtonText}>🚀 Build My Parlay</Text>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    left: -50,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  // Logo Animation Styles (same as home page)
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

  // Header Section
  headerSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    margin: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },

  // Templates Section
  templatesSection: {
    padding: 15,
  },

  // Template Cards
  templateCard: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  riskLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  legsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  legsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  templateName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  picksContainer: {
    marginBottom: 15,
  },
  pickItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 10,
  },
  pickBullet: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  pickText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  templateDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
    opacity: 0.8,
  },
  actionContainer: {
    alignItems: 'center',
  },
  selectButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    padding: 25,
    margin: 15,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  bottomTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  bottomSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
    lineHeight: 22,
  },
  buildButton: {
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buildButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
