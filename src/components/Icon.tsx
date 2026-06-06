import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Line, Rect, Circle, Polygon, Polyline, G } from 'react-native-svg';
import * as Lucide from 'lucide-react-native';
import { iconSizes } from '@/tokens';

export type IconName =
  | 'door' | 'chairs' | 'letter' | 'page' | 'lamp' | 'moon'
  | 'seal' | 'window' | 'upload' | 'check' | 'mark' | 'moreHorizontal'
  | 'navHouse' | 'navIntroductions' | 'navLeaderboard' | 'navDate' | 'navProfile'
  | 'chevronRight' | 'chevronLeft' | 'chevronDown' | 'arrowRight'
  | 'shield' | 'users' | 'messageSquare' | 'bookOpen' | 'flag' | 'shieldOff' | 'settings'
  | 'bell' | 'x' | 'fileText' | 'edit' | 'trash' | 'user' | 'moreVertical' | 'barChart2' | 'heart' | 'plus'
  | 'wifiOff' | 'alertTriangle';

export type IconSizeToken = keyof typeof iconSizes;

interface Props { 
  name: IconName; 
  size?: number | IconSizeToken; 
  color?: string; 
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

const STROKE = { 
  fill: 'none', 
  strokeLinecap: 'square' as const, 
  strokeLinejoin: 'miter' as const 
};

// Map custom names to Lucide components where applicable
const lucideMap: Partial<Record<IconName, any>> = {
  check: Lucide.Check,
  moreHorizontal: Lucide.MoreHorizontal,
  chevronRight: Lucide.ChevronRight,
  chevronLeft: Lucide.ChevronLeft,
  chevronDown: Lucide.ChevronDown,
  arrowRight: Lucide.ArrowRight,
  shield: Lucide.Shield,
  users: Lucide.Users,
  messageSquare: Lucide.MessageSquare,
  bookOpen: Lucide.BookOpen,
  flag: Lucide.Flag,
  shieldOff: Lucide.ShieldOff,
  settings: Lucide.Settings,
  bell: Lucide.Bell,
  x: Lucide.X,
  fileText: Lucide.FileText,
  edit: Lucide.Edit2,
  trash: Lucide.Trash2,
  user: Lucide.User,
  moreVertical: Lucide.MoreVertical,
  upload: Lucide.Upload,
  barChart2: Lucide.BarChart2,
  heart: Lucide.Heart,
  plus: Lucide.Plus,
  wifiOff: Lucide.WifiOff,
  alertTriangle: Lucide.AlertTriangle,
};

export function Icon({ name, size = 'md', color = 'currentColor', strokeWidth = 1.5, style }: Props) {
  const pixelSize = typeof size === 'number' ? size : iconSizes[size] || 20;

  // Use Lucide if mapped
  const LucideIcon = lucideMap[name];
  if (LucideIcon) {
    return <LucideIcon color={color} size={pixelSize} strokeWidth={strokeWidth} style={style} />;
  }

  // Custom Connexa Icons fallback
  const s = { stroke: color, strokeWidth };
  const props = { ...STROKE, ...s };

  const paths: Partial<Record<IconName, React.ReactNode>> = {
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
    navHouse: (
      <G {...props}>
        <Rect x="4" y="5" width="16" height="14" />
        <Line x1="4" y1="10" x2="20" y2="10" />
        <Line x1="12" y1="5" x2="12" y2="19" />
        <Line x1="7" y1="19" x2="17" y2="19" />
      </G>
    ),
    navIntroductions: (
      <G {...props}>
        <Rect x="4" y="3" width="13" height="18" />
        <Path d="M17 3 L20 5 L20 21 L17 21" />
        <Line x1="14" y1="12" x2="15" y2="12" />
      </G>
    ),
    navLeaderboard: (
      <G {...props}>
        <Rect x="5" y="3" width="14" height="18" />
        <Line x1="8" y1="8" x2="16" y2="8" />
        <Line x1="8" y1="12" x2="14" y2="12" />
        <Line x1="8" y1="16" x2="12" y2="16" />
        <Line x1="5" y1="6" x2="3" y2="6" />
        <Line x1="5" y1="10" x2="3" y2="10" />
        <Line x1="5" y1="14" x2="3" y2="14" />
      </G>
    ),
    navDate: (
      <G {...props}>
        <Line x1="3" y1="8" x2="3" y2="14" />
        <Line x1="3" y1="14" x2="7" y2="14" />
        <Line x1="3" y1="8" x2="7" y2="8" />
        <Line x1="7" y1="8" x2="7" y2="14" />
        <Line x1="3" y1="14" x2="3" y2="19" />
        <Line x1="7" y1="14" x2="7" y2="19" />
        <Line x1="21" y1="8" x2="21" y2="14" />
        <Line x1="17" y1="14" x2="21" y2="14" />
        <Line x1="17" y1="8" x2="21" y2="8" />
        <Line x1="17" y1="8" x2="17" y2="14" />
        <Line x1="17" y1="14" x2="17" y2="19" />
        <Line x1="21" y1="14" x2="21" y2="19" />
      </G>
    ),
    navProfile: (
      <G {...props}>
        <Rect x="4" y="5" width="16" height="14" />
        <Line x1="7" y1="10" x2="13" y2="10" />
        <Line x1="7" y1="14" x2="17" y2="14" />
        <Line x1="15" y1="9" x2="17" y2="9" />
        <Line x1="15" y1="11" x2="17" y2="11" />
      </G>
    ),
    mark: (
      <G {...props}>
        <Path d="M12 3 L20 8 V16 L12 21 L4 16 V8 Z" />
        <Path d="M8.5 12 L11 14.5 L15.8 9.5" />
      </G>
    ),
  };

  return (
    <Svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" style={style}>
      {paths[name]}
    </Svg>
  );
}
