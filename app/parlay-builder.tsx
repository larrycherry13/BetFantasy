import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BetFantasyLogo } from '@/components/betfantasy-logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/utils/auth';
import { OddsService } from '@/utils/oddsApi';

// Template data (same as explore page)
const parlayTemplates = [
  {
    id: 1,
    name: "Easy — Beginner Boost",
    difficulty: "🟢",
    legs: 2,
    picks: [
      { template: "[Team] Moneyline", options: ["Chiefs", "Bills", "Cowboys", "49ers", "Eagles"] },
      { template: "Over 52.5 Total Points", options: ["Chiefs vs Bills", "Cowboys vs Giants", "49ers vs Rams"] }
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
      { template: "[Player] Over 75 Rushing Yards", options: ["Derrick Henry", "Josh Jacobs", "Christian McCaffrey", "Saquon Barkley"] },
      { template: "[Team] Moneyline", options: ["Titans", "Raiders", "Panthers", "Giants"] }
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
      { template: "[Player] Anytime Touchdown", options: ["Travis Kelce", "Tyreek Hill", "Davante Adams", "Cooper Kupp"] },
      { template: "[Quarterback] Over 275 Passing Yards", options: ["Patrick Mahomes", "Josh Allen", "Aaron Rodgers", "Tom Brady"] },
      { template: "[Team] Over 24.5 Points", options: ["Chiefs", "Bills", "Packers", "Bucs"] }
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
      { template: "[Underdog Team] Spread (+7.5)", options: ["Lions +7.5", "Jets +7.5", "Commanders +7.5"] },
      { template: "[Player] Over 85 Receiving Yards", options: ["Stefon Diggs", "DeAndre Hopkins", "Mike Evans"] },
      { template: "Game Total Over 48.5", options: ["Bills vs Jets O48.5", "Bucs vs Saints O48.5"] }
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
      { template: "[Team] Moneyline", options: ["Chiefs", "Bills", "Eagles", "49ers"] },
      { template: "[Player] Anytime Touchdown", options: ["Travis Kelce", "Stefon Diggs", "A.J. Brown", "Christian McCaffrey"] },
      { template: "[Quarterback] Over 22.5 Completions", options: ["Patrick Mahomes", "Josh Allen", "Jalen Hurts", "Brock Purdy"] },
      { template: "Game Total Over 45.5", options: ["Chiefs vs Chargers O45.5", "Bills vs Dolphins O45.5"] }
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
      { template: "[Player] Over 100 Rushing Yards", options: ["Derrick Henry", "Josh Jacobs", "Christian McCaffrey"] },
      { template: "[Player] Anytime Touchdown", options: ["Travis Kelce", "Tyreek Hill", "Davante Adams"] },
      { template: "[Quarterback] Over 300 Passing Yards", options: ["Patrick Mahomes", "Josh Allen", "Aaron Rodgers"] },
      { template: "[Team] Spread (-3.5)", options: ["Chiefs -3.5", "Bills -3.5", "Eagles -3.5"] },
      { template: "Total Points Over 50.5", options: ["Chiefs vs Bills O50.5", "Cowboys vs Eagles O50.5"] }
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
      { template: "[Quarterback] Over 2.5 Passing TDs", options: ["Patrick Mahomes", "Josh Allen", "Joe Burrow"] },
      { template: "[Player] 100+ Rushing Yards", options: ["Derrick Henry", "Christian McCaffrey", "Josh Jacobs"] },
      { template: "[Player] 100+ Receiving Yards", options: ["Tyreek Hill", "Davante Adams", "Cooper Kupp"] },
      { template: "[Team] Moneyline", options: ["Chiefs", "Bills", "Bengals"] },
      { template: "Total Points Over 55.5", options: ["Chiefs vs Bills O55.5", "Bengals vs Ravens O55.5"] },
      { template: "[Defense] 1+ Interception", options: ["Chiefs Defense", "Bills Defense", "49ers Defense"] }
    ],
    description: "Big 6-leg parlay designed to feel like the \"jackpot card.\"",
    color: "#ff00ff",
    riskLevel: "Extreme"
  }
];

export default function ParlayBuilder() {
  const { templateId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const neonColor = colorScheme === 'dark' ? '#00ff41' : '#39ff14';
  
  const template = parlayTemplates.find(t => t.id === parseInt(templateId as string)) || parlayTemplates[0];
  const [selectedPicks, setSelectedPicks] = useState<{ [key: number]: string }>({});
  const [pickOdds, setPickOdds] = useState<{ [key: number]: { odds: number; description: string } }>({});
  const [parlayPayout, setParlayPayout] = useState<{
    totalOdds: number;
    payout: number;
    profit: number;
    formattedOdds: string;
  } | null>(null);
  const [loadingOdds, setLoadingOdds] = useState<{ [key: number]: boolean }>({});
  
  const handlePickSelection = async (legIndex: number, pick: string) => {
    setSelectedPicks(prev => ({
      ...prev,
      [legIndex]: pick
    }));
    
    // Fetch real-time odds for this pick
    setLoadingOdds(prev => ({ ...prev, [legIndex]: true }));
    
    try {
      const pickTemplate = template.picks[legIndex].template;
      const oddsData = await OddsService.getPickOdds(pickTemplate, pick);
      
      if (oddsData) {
        setPickOdds(prev => {
          const updatedOdds = {
            ...prev,
            [legIndex]: oddsData
          };
          
          // Recalculate parlay payout with updated odds
          const allOdds = Object.values(updatedOdds).map(pick => pick.odds);
          if (allOdds.length === template.picks.length) {
            const payoutResult = OddsService.calculateParlayPayout(allOdds, 100);
            setParlayPayout(payoutResult);
          }
          
          return updatedOdds;
        });
      }
    } catch (error) {
      console.error('Failed to fetch pick odds:', error);
    } finally {
      setLoadingOdds(prev => ({ ...prev, [legIndex]: false }));
    }
  };
  
  const formatFinalPick = (pickTemplate: any, selectedOption: string) => {
    if (!selectedOption) return pickTemplate.template;
    
    let result = pickTemplate.template;
    
    // Replace [Player], [Team], [Quarterback], etc. with selected option
    result = result.replace(/\[Player\]|\[Team\]|\[Quarterback\]|\[Underdog Team\]|\[Defense\]/g, selectedOption);
    
    return result;
  };
  
  const isReadyToSubmit = Object.keys(selectedPicks).length === template.picks.length;
  
  const handleSubmitParlay = async () => {
    if (!isReadyToSubmit) {
      Alert.alert("Incomplete Parlay", "Please make all your picks before submitting!");
      return;
    }
    
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      Alert.alert("Error", "Please log in to submit parlays");
      return;
    }
    
    const finalParlay = template.picks.map((pick, index) => ({
      template: pick.template,
      selection: selectedPicks[index],
      final: formatFinalPick(pick, selectedPicks[index]),
      odds: pickOdds[index]?.odds || OddsService.getEstimatedOdds(pick.template),
      oddsDescription: pickOdds[index]?.description || `${selectedPicks[index]} (Estimated)`
    }));
    
    // Save parlay to storage
    const success = await AuthService.saveParlay({
      userId: currentUser.id,
      week: "Week 4", // TODO: Make this dynamic based on current week
      templateId: template.id,
      templateName: template.name,
      status: 'pending',
      points: 0,
      picks: finalParlay
    });
    
    if (success) {
      const payoutText = parlayPayout 
        ? `\n\nPotential Payout: $${parlayPayout.payout} (Profit: $${parlayPayout.profit})\nOdds: ${parlayPayout.formattedOdds}`
        : '';
      
      Alert.alert(
        "Parlay Submitted! 🎉",
        `Your ${template.name} parlay has been created!\n\nPicks:\n${finalParlay.map(p => `• ${p.final} (${OddsService.formatOdds(p.odds)})`).join('\n')}${payoutText}\n\nResults will be updated after games complete.`,
        [
          { text: "View Profile", onPress: () => router.push('/(tabs)/profile') },
          { text: "Build Another", onPress: () => router.back() }
        ]
      );
    } else {
      Alert.alert("Error", "Failed to save parlay. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BetFantasyLogo size={60} />
      </ThemedView>

      {/* Template Info */}
      <ThemedView style={[styles.templateHeader, { borderColor: template.color }]}>
        <Text style={styles.difficultyIcon}>{template.difficulty}</Text>
        <ThemedText style={styles.templateName}>{template.name}</ThemedText>
        <ThemedText style={styles.templateDescription}>{template.description}</ThemedText>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: template.color }]}>
            {Object.keys(selectedPicks).length}/{template.legs} picks made
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: template.color,
                  width: `${(Object.keys(selectedPicks).length / template.legs) * 100}%`
                }
              ]} 
            />
          </View>
        </View>
      </ThemedView>

      {/* Pick Builder */}
      <ThemedView style={styles.picksContainer}>
        <ThemedText style={styles.sectionTitle}>Build Your Parlay</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Choose your players and teams. All numbers are pre-set for you!
        </ThemedText>

        {template.picks.map((pick, index) => (
          <View key={index} style={[styles.pickCard, { borderColor: template.color }]}>
            <View style={styles.pickHeader}>
              <Text style={[styles.pickNumber, { backgroundColor: template.color }]}>
                {index + 1}
              </Text>
              <ThemedText style={styles.pickTemplate}>
                {pick.template}
              </ThemedText>
            </View>
            
            <View style={styles.optionsContainer}>
              {pick.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionButton,
                    selectedPicks[index] === option && { 
                      backgroundColor: template.color,
                      borderColor: template.color 
                    }
                  ]}
                  onPress={() => handlePickSelection(index, option)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedPicks[index] === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedPicks[index] && (
              <View style={[styles.previewContainer, { backgroundColor: `${template.color}20` }]}>
                <View style={styles.previewHeader}>
                  <ThemedText style={styles.previewLabel}>Your Pick:</ThemedText>
                  {loadingOdds[index] ? (
                    <ThemedText style={styles.loadingOdds}>Loading odds...</ThemedText>
                  ) : pickOdds[index] ? (
                    <Text style={[styles.oddsText, { color: template.color }]}>
                      {OddsService.formatOdds(pickOdds[index].odds)}
                    </Text>
                  ) : null}
                </View>
                <ThemedText style={[styles.previewText, { color: template.color }]}>
                  {formatFinalPick(pick, selectedPicks[index])}
                </ThemedText>
              </View>
            )}
          </View>
        ))}
      </ThemedView>

      {/* Parlay Summary */}
      {parlayPayout && (
        <ThemedView style={[styles.parlaySummary, { borderColor: template.color }]}>
          <ThemedText style={styles.summaryTitle}>📊 Parlay Summary</ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Total Odds:</ThemedText>
            <Text style={[styles.summaryValue, { color: template.color }]}>
              {parlayPayout.formattedOdds}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Bet Amount:</ThemedText>
            <Text style={styles.summaryValue}>$100.00</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Potential Payout:</ThemedText>
            <Text style={[styles.summaryValueLarge, { color: template.color }]}>
              ${parlayPayout.payout}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Potential Profit:</ThemedText>
            <Text style={[styles.summaryValueLarge, { color: '#00ff41' }]}>
              ${parlayPayout.profit}
            </Text>
          </View>
        </ThemedView>
      )}

      {/* Submit Button */}
      <ThemedView style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: isReadyToSubmit ? template.color : '#666',
              opacity: isReadyToSubmit ? 1 : 0.5
            }
          ]}
          onPress={handleSubmitParlay}
          disabled={!isReadyToSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isReadyToSubmit 
              ? parlayPayout 
                ? `🚀 Submit Parlay (Win $${parlayPayout.profit})` 
                : '🚀 Submit Parlay'
              : `Complete ${template.legs - Object.keys(selectedPicks).length} more picks`
            }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: 'bold',
  },
  templateHeader: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  templateName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  templateDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 15,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  picksContainer: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 25,
  },
  pickCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  pickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pickTemplate: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  selectedOptionText: {
    color: '#000',
    fontWeight: 'bold',
  },
  previewContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  previewLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  loadingOdds: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  oddsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  parlaySummary: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryValueLarge: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    paddingVertical: 18,
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