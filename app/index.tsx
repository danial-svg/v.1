import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spade, Users, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  const handleJoin = () => {
    const name = playerName.trim();
    const room = roomNumber.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter your player name.');
      return;
    }
    if (!room) {
      Alert.alert('Room required', 'Please enter a room number.');
      return;
    }
    router.push({
      pathname: '/game',
      params: { roomNumber: room, playerName: name },
    });
  };

  return (
    <LinearGradient colors={['#3D0F0F', '#5C1A1A', '#2D0808']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        {/* Logo / Title */}
        <View style={styles.logoWrap}>
          <LinearGradient colors={['#F4D03F', '#F4A261']} style={styles.logoCircle}>
            <Spade color="#3D0F0F" size={48} />
          </LinearGradient>
          <Text style={styles.title}>HOKM</Text>
          <Text style={styles.subtitle}>Persian Card Game</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Player Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#A89090"
              value={playerName}
              onChangeText={setPlayerName}
              maxLength={20}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Room Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a room number"
              placeholderTextColor="#A89090"
              value={roomNumber}
              onChangeText={setRoomNumber}
              maxLength={10}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} activeOpacity={0.85}>
            <Users color="#3D0F0F" size={22} />
            <Text style={styles.joinBtnText}>Join Room</Text>
            <ArrowRight color="#3D0F0F" size={20} />
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Up to 4 players per room. First to join becomes the Host.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logoWrap: { alignItems: 'center', marginBottom: 48 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  title: {
    fontFamily: 'Inter-Bold', fontSize: 42, fontWeight: '700', color: '#F4D03F', letterSpacing: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular', fontSize: 16, color: '#D0C0C0', marginTop: 4, letterSpacing: 1,
  },
  form: { gap: 20 },
  inputGroup: {},
  inputLabel: {
    fontFamily: 'Inter-Bold', fontSize: 12, fontWeight: '700', color: '#D0C0C0',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 17, fontFamily: 'Inter-Regular', color: '#1D3557',
    borderWidth: 2, borderColor: 'rgba(244,208,63,0.3)',
  },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F4D03F', borderRadius: 28, paddingVertical: 18, marginTop: 8,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  joinBtnText: {
    fontFamily: 'Inter-Bold', fontSize: 18, fontWeight: '700', color: '#3D0F0F', letterSpacing: 1,
  },
  footer: { position: 'absolute', bottom: 32, left: 32, right: 32 },
  footerText: {
    fontFamily: 'Inter-Regular', fontSize: 13, color: '#A89090', textAlign: 'center', lineHeight: 19,
  },
});
