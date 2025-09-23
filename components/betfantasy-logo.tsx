import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BetFantasyLogoProps {
  size?: number;
  style?: any;
}

export function BetFantasyLogo({ size = 200, style }: BetFantasyLogoProps) {
  const logoSize = size;
  const textSize = logoSize * 0.25;

  return (
    <View style={[styles.container, style]}>
      {/* Trophy and Football using Unicode symbols */}
      <View style={styles.iconContainer}>
        <Text style={[styles.trophyIcon, { fontSize: logoSize * 0.6 }]}>🏆</Text>
        <Text style={[styles.footballIcon, { fontSize: logoSize * 0.3 }]}>🏈</Text>
      </View>

      {/* BETFANTASY Text with Rainbow Gradient */}
      <View style={styles.textContainer}>
        <Text style={[styles.logoText, { fontSize: textSize }]}>
          <Text style={[styles.gradientText, { color: '#ff4444' }]}>BET</Text>
          <Text style={[styles.gradientText, { color: '#ff8800' }]}>FAN</Text>
          <Text style={[styles.gradientText, { color: '#ffff00' }]}>TA</Text>
          <Text style={[styles.gradientText, { color: '#00ff00' }]}>SY</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  trophyIcon: {
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  footballIcon: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textContainer: {
    marginTop: 5,
  },
  logoText: {
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  gradientText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
