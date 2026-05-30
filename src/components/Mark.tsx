import Svg, { Rect } from 'react-native-svg';
import { colors } from '../tokens';

interface Props { 
  width?: number; 
  color?: string;
}

export function Mark({ width = 132, color = colors.ink }: Props) {
  const h = (width / 100) * 10;
  return (
    <Svg width={width} height={h} viewBox="0 0 100 10">
      <Rect x="0" y="3" width="42" height="4" fill={color} />
      <Rect x="58" y="3" width="42" height="4" fill={color} />
    </Svg>
  );
}
