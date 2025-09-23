import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BetFantasyLogo } from '@/components/betfantasy-logo';
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

export default function ParlayBuilderScreen() {
  const { templateId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [selectedPicks, setSelectedPicks] = useState({});
  const [tapCount, setTapCount] = useState(0);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const neonColor = colorScheme === 'dark' ? '#00ff41' : '#39ff14';
  
  // Find the selected template
  const selectedTemplate = parlayTemplates.find(t => t.id === parseInt(templateId as string));

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

  const handlePickSelection = (pickIndex: number, selection: string) => {
    setSelectedPicks(prev => ({
      ...prev,
      [pickIndex]: selection
    }));
  };

  const getPickOptions = (pick: string) => {
    if (pick.includes("Moneyline")) {
      return ["Chiefs", "Bills", "Dolphins", "Ravens", "Bengals", "Jaguars"];
    }
    if (pick.includes("Over/Under") || pick.includes("Total")) {
      return ["Over 45.5", "Under 45.5", "Over 48.5", "Under 48.5", "Over 52.5", "Under 52.5"];
    }
    if (pick.includes("Rushing Yards")) {
      return ["Over 75.5", "Under 75.5", "Over 100.5", "Under 100.5", "Over 125.5", "Under 125.5"];
    }
    if (pick.includes("Passing Yards")) {
      return ["Over 250.5", "Under 250.5", "Over 275.5", "Under 275.5", "Over 300.5", "Under 300.5"];
    }
    if (pick.includes("Touchdown")) {
      return ["Yes", "No"];
    }
    if (pick.includes("Spread")) {
      return ["+3.5", "+7.5", "+10.5", "-3.5", "-7.5", "-10.5"];
    }
    if (pick.includes("Completions")) {
      return ["Over 20.5", "Under 20.5", "Over 25.5", "Under 25.5", "Over 30.5", "Under 30.5"];
    }
    if (pick.includes("Receiving Yards")) {
      return ["Over 60.5", "Under 60.5", "Over 80.5", "Under 80.5", "Over 100.5", "Under 100.5"];
    }
    if (pick.includes("Interception")) {
      return ["Yes", "No"];
    }
    return ["Option 1", "Option 2", "Option 3"];
  };

  if (!selectedTemplate) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Template not found</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Logo */}
      <ThemedView style={styles.headerSection}>
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
            <BetFantasyLogo size={150} />
            
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
      </ThemedView>

      {/* Template Info */}
      <ThemedView style={styles.templateInfo}>
        <View style={styles.templateHeader}>
          <Text style={styles.difficultyIcon}>{selectedTemplate.difficulty}</Text>
          <View style={styles.templateDetails}>
            <ThemedText style={styles.templateName}>{selectedTemplate.name}</ThemedText>
            <ThemedText style={styles.templateDescription}>{selectedTemplate.description}</ThemedText>
          </View>
          <View style={[styles.legsBadge, { backgroundColor: selectedTemplate.color + '20' }]}>
            <Text style={[styles.legsText, { color: selectedTemplate.color }]}>
              {selectedTemplate.legs} Legs
            </Text>
          </View>
        </View>
      </ThemedView>

      {/* Pick Selection */}
      <ThemedView style={styles.picksSection}>
        <ThemedText style={styles.sectionTitle}>Customize Your Picks</ThemedText>
        
        {selectedTemplate.picks.map((pick, index) => (
          <View key={index} style={styles.pickContainer}>
            <ThemedText style={styles.pickLabel}>
              Pick {index + 1}: {pick}
            </ThemedText>
            
            <View style={styles.optionsGrid}>
              {getPickOptions(pick).map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: selectedPicks[index] === option 
                        ? selectedTemplate.color 
                        : 'rgba(0, 0, 0, 0.05)',
                      borderColor: selectedTemplate.color,
                    }
                  ]}
                  onPress={() => handlePickSelection(index, option)}
                >
                  <Text style={[
                    styles.optionText,
                    {
                      color: selectedPicks[index] === option ? '#000' : selectedTemplate.color,
                    }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ThemedView>

      {/* Bottom Actions */}
      <ThemedView style={styles.actionsSection}>
        <View style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>
            {Object.keys(selectedPicks).length} / {selectedTemplate.legs} picks selected
          </ThemedText>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                {
                  width: `${(Object.keys(selectedPicks).length / selectedTemplate.legs) * 100}%`,
                  backgroundColor: selectedTemplate.color,
                }
              ]}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton,
            {
              backgroundColor: Object.keys(selectedPicks).length === selectedTemplate.legs 
                ? selectedTemplate.color 
                : 'rgba(0, 0, 0, 0.2)',
            }
          ]}
          disabled={Object.keys(selectedPicks).length !== selectedTemplate.legs}
          onPress={() => {
            console.log('Submitting parlay:', selectedPicks);
            // TODO: Navigate to confirmation or submit
          }}
        >
          <Text style={styles.submitButtonText}>
            {Object.keys(selectedPicks).length === selectedTemplate.legs 
              ? '🚀 Submit Parlay' 
              : `Complete ${selectedTemplate.legs - Object.keys(selectedPicks).length} more picks`}
          </Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
  },
  logoWrapper: {
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
  templateInfo: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  templateDetails: {
    flex: 1,
  },
  templateName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  templateDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  legsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  legsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  picksSection: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickContainer: {
    marginBottom: 25,
  },
  pickLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionsSection: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 15,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  submitButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
