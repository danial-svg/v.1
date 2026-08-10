import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameScreen } from '@/components/GameScreen';

interface GameErrorBoundaryProps {
  children: React.ReactNode;
}

interface GameErrorBoundaryState {
  error: Error | null;
}

class GameErrorBoundary extends React.Component<GameErrorBoundaryProps, GameErrorBoundaryState> {
  state: GameErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): GameErrorBoundaryState {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorTitle}>Could not open the room</Text>
        <Text style={styles.errorMessage}>{this.state.error.message || 'Please return to the menu and try again.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => this.setState({ error: null })}>
          <Text style={styles.backButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default function GameRoute() {
  const params = useLocalSearchParams<{ roomNumber?: string | string[]; playerName?: string | string[] }>();
  const router = useRouter();
  const roomNumber = Array.isArray(params.roomNumber) ? params.roomNumber[0] : params.roomNumber || '';
  const playerName = Array.isArray(params.playerName) ? params.playerName[0] : params.playerName || '';

  if (!roomNumber || !playerName) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorTitle}>Room details are missing</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <Text style={styles.backButtonText}>Back to menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GameErrorBoundary>
      <GameScreen roomNumber={roomNumber} playerName={playerName} onExit={() => router.replace('/')} />
    </GameErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0A1A2E',
  },
  errorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#AABBCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#F4D03F',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#3D0F0F',
  },
});
