import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Card, Suit } from '@/lib/hokm/types';
import { CardView } from './CardView';
import { isLegal } from '@/lib/hokm/rules';

interface DraggableCardProps {
  card: Card;
  index: number;
  totalCards: number;
  isMyTurn: boolean;
  leadSuit: Suit | null;
  hand: Card[];
  onPlay: (card: Card) => void;
}

const CARD_W = 54;
const CARD_H = 78;
const OVERLAP = 34;
const LIFT = -32;

export function DraggableCard({
  card,
  index,
  totalCards,
  isMyTurn,
  leadSuit,
  hand,
  onPlay,
}: DraggableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const lifted = useSharedValue(0);

  const legal = isMyTurn && isLegal(card, hand, leadSuit);
  const baseX = (index - (totalCards - 1) / 2) * OVERLAP - CARD_W / 2;

  const pan = Gesture.Pan()
    .enabled(legal)
    .onBegin(() => {
      'worklet';
      zIndex.value = 100;
      scale.value = withSpring(1.12);
      lifted.value = withSpring(1);
    })
    .onUpdate((e) => {
      'worklet';
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      'worklet';
      const draggedUp = e.translationY < -60;
      const fastFlick = Math.abs(e.velocityY) > 400 && e.velocityY < 0;
      if (draggedUp || fastFlick) {
        runOnJS(onPlay)(card);
        translateY.value = withTiming(-220, { duration: 220 });
        scale.value = withTiming(0.6, { duration: 220 });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        lifted.value = withSpring(0);
        zIndex.value = 1;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const lift = lifted.value * LIFT;
    return {
      transform: [
        { translateX: baseX + translateX.value },
        { translateY: translateY.value + lift },
        { scale: scale.value },
      ],
      zIndex: zIndex.value,
      opacity: interpolate(
        translateY.value,
        [-220, -60, 0],
        [0, 1, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    lifted.value = 0;
    zIndex.value = 1;
  }, [card.id, totalCards]);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <CardView
          card={card}
          size="medium"
          dimmed={isMyTurn && !legal}
          highlight={isMyTurn && legal}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: CARD_W,
    height: CARD_H,
    marginLeft: -CARD_W / 2,
  },
});
