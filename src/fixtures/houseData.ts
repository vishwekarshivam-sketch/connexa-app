import { colors } from '../tokens';

export interface HouseInfo {
  id: 'tinkerers' | 'wanderers' | 'strategists' | 'mavericks';
  nameEn: string;
  nameHi: string;
  ethos: string;
  primary: string;
  primaryDeep: string;
}

export const HOUSES: Record<string, HouseInfo> = {
  tinkerers: {
    id: 'tinkerers',
    nameEn: 'Tinkerers',
    nameHi: 'निर्माणकर्ता',
    ethos: 'You build before you explain. The prototype is the argument.',
    primary: colors.lake,
    primaryDeep: colors.lakeDeep,
  },
  wanderers: {
    id: 'wanderers',
    nameEn: 'Wanderers',
    nameHi: 'भटकनेवाले',
    ethos: 'You go slower on purpose. The detour is the point.',
    primary: colors.lichen,
    primaryDeep: colors.lichenDeep,
  },
  strategists: {
    id: 'strategists',
    nameEn: 'Strategists',
    nameHi: 'रणनीतिकार',
    ethos: 'You see three moves ahead. Execution is a form of respect.',
    primary: colors.ember,
    primaryDeep: colors.emberDeep,
  },
  mavericks: {
    id: 'mavericks',
    nameEn: 'Mavericks',
    nameHi: 'स्वतंत्र विचारक',
    ethos: 'You question the frame before you answer the question.',
    primary: colors.ink,
    primaryDeep: colors.inkSoft,
  },
};

export function scoreHouse(answers: string[]): HouseInfo {
  const tally: Record<string, number> = { 
    tinkerers: 0, 
    wanderers: 0, 
    strategists: 0, 
    mavericks: 0 
  };
  
  answers.forEach((h) => { 
    if (h in tally) tally[h]++; 
  });
  
  const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  return HOUSES[winner];
}
