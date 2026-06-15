declare module 'react-native-confetti-cannon' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface ConfettiCannonProps extends ViewProps {
    count?: number;
    origin: { x: number; y: number };
    explosionSpeed?: number;
    fallSpeed?: number;
    colors?: string[];
    fadeOut?: boolean;
    autoStart?: boolean;
    autoStartDelay?: number;
    onAnimationStart?: () => void;
    onAnimationEnd?: () => void;
  }

  export default class ConfettiCannon extends Component<ConfettiCannonProps> {
    start(): void;
  }
}
