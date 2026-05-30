import Svg, { Path, Line, Rect, Circle, Polygon, Polyline, G } from 'react-native-svg';

export type IconName =
  | 'door' | 'chairs' | 'letter' | 'page' | 'lamp' | 'moon'
  | 'seal' | 'window' | 'upload' | 'check'
  | 'chevronRight' | 'chevronLeft' | 'chevronDown' | 'arrowRight';

interface Props { 
  name: IconName; 
  size?: number; 
  color?: string; 
  strokeWidth?: number;
}

const STROKE = { 
  fill: 'none', 
  strokeLinecap: 'square' as const, 
  strokeLinejoin: 'miter' as const 
};

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.5 }: Props) {
  const s = { stroke: color, strokeWidth };
  const props = { ...STROKE, ...s };

  const paths: Record<IconName, React.ReactNode> = {
    door: (
      <G {...props}>
        <Line x1="16.5" y1="4" x2="16.5" y2="20" />
        <Polygon points="7,5.4 14,4 14,19.4 7,20.6" />
        <Line x1="11.6" y1="12" x2="11.6" y2="13" />
        <Line x1="5" y1="20.6" x2="18.5" y2="20.6" />
      </G>
    ),
    chairs: (
      <G {...props}>
        <Path d="M6 7 V13 M6 13 H10 M6.6 13 V18 M9.4 13 V18" />
        <Path d="M18 7 V13 M14 13 H18 M14.6 13 V18 M17.4 13 V18" />
      </G>
    ),
    letter: (
      <G {...props}>
        <Rect x="4" y="6" width="16" height="12" />
        <Path d="M4 7 L12 13 L20 7" />
      </G>
    ),
    page: (
      <G {...props}>
        <Path d="M6 3 H15 L18 6 V21 H6 Z" />
        <Line x1="15" y1="3" x2="15" y2="6" />
        <Line x1="18" y1="6" x2="15" y2="6" />
        <Line x1="9" y1="11" x2="15" y2="11" />
        <Line x1="9" y1="14" x2="15" y2="14" />
        <Line x1="9" y1="17" x2="13" y2="17" />
      </G>
    ),
    lamp: (
      <G {...props}>
        <Line x1="12" y1="3" x2="12" y2="6" />
        <Path d="M7 13 L9.5 6 H14.5 L17 13 Z" />
        <Line x1="7" y1="13" x2="17" y2="13" />
        <Line x1="12" y1="13" x2="12" y2="21" />
      </G>
    ),
    moon: <Path {...props} d="M20 14.5 A8 8 0 1 1 11 4 A6.2 6.2 0 0 0 20 14.5 Z" />,
    seal: (
      <G {...props}>
        <Circle cx="12" cy="12" r="8" />
        <Path d="M8 12 L11 15 L16 9" />
      </G>
    ),
    window: (
      <G {...props}>
        <Rect x="5" y="4" width="14" height="16" />
        <Line x1="12" y1="4" x2="12" y2="20" />
        <Line x1="5" y1="12" x2="19" y2="12" />
      </G>
    ),
    upload: (
      <G {...props}>
        <Path d="M12 16 V5" />
        <Path d="M7.5 9.5 L12 5 L16.5 9.5" />
        <Path d="M5 16 V20 H19 V16" />
      </G>
    ),
    check: <Path {...props} d="M5 12.5 L10 17.5 L19 6.5" />,
    chevronRight: <Path {...props} d="M9 5 L16 12 L9 19" />,
    chevronLeft: <Path {...props} d="M15 5 L8 12 L15 19" />,
    chevronDown: <Path {...props} d="M5 9 L12 16 L19 9" />,
    arrowRight: (
      <G {...props}>
        <Line x1="4" y1="12" x2="20" y2="12" />
        <Path d="M14 6 L20 12 L14 18" />
      </G>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths[name]}
    </Svg>
  );
}
