import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { Mark } from '@/components/Mark';

const MOCK_HOUSE = HOUSES['tinkerers'];

export function HouseHomeScreen() {
  const insets = useSafeAreaInsets();

  const tiles = [
    { label: 'Members', value: '67', sub: 'in your house' },
    { label: 'Active today', value: '12', sub: 'online now' },
    { label: 'House Lore', value: MOCK_HOUSE.ethos, isText: true },
    { label: 'First Signal', value: '3', sub: 'waiting' },
    { label: 'This week', value: 'Intro\nNight' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: MOCK_HOUSE.primary, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ 
        padding: 24, 
        paddingBottom: 16, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        <View>
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 10.5, 
            fontWeight: '500', 
            textTransform: 'uppercase', 
            letterSpacing: 1.68, 
            color: 'rgba(239,231,214,0.75)', 
            marginBottom: 4 
          }}>
            Your House
          </Text>
          <Text style={{ 
            fontFamily: fonts.serif, 
            fontSize: 36, 
            fontWeight: '300', 
            color: colors.khadi, 
            lineHeight: 40 
          }}>
            {MOCK_HOUSE.nameEn}
          </Text>
        </View>
        <Mark width={48} color="rgba(239,231,214,0.3)" />
      </View>

      {/* Bento grid */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {tiles.slice(0, 2).map((tile) => (
            <TouchableOpacity 
              key={tile.label} 
              activeOpacity={0.85} 
              style={{
                flex: 1, 
                backgroundColor: 'rgba(239,231,214,0.08)',
                borderWidth: 1, 
                borderColor: 'rgba(239,231,214,0.12)', 
                padding: 20, 
                gap: 4,
              }}
            >
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 10.5, 
                fontWeight: '500', 
                textTransform: 'uppercase', 
                letterSpacing: 1.68, 
                color: 'rgba(239,231,214,0.5)' 
              }}>
                {tile.label}
              </Text>
              <Text style={{ 
                fontFamily: fonts.serif, 
                fontSize: 36, 
                fontWeight: '300', 
                color: colors.khadi 
              }}>
                {tile.value}
              </Text>
              {tile.sub && (
                <Text style={{ 
                  fontFamily: fonts.body, 
                  fontSize: 13, 
                  color: 'rgba(239,231,214,0.5)' 
                }}>
                  {tile.sub}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          activeOpacity={0.85} 
          style={{
            backgroundColor: 'rgba(239,231,214,0.06)', 
            borderWidth: 1, 
            borderColor: 'rgba(239,231,214,0.12)', 
            padding: 20,
          }}
        >
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 10.5, 
            fontWeight: '500', 
            textTransform: 'uppercase', 
            letterSpacing: 1.68, 
            color: 'rgba(239,231,214,0.5)', 
            marginBottom: 12 
          }}>
            House Lore
          </Text>
          <Text style={{ 
            fontFamily: fonts.body, 
            fontStyle: 'italic', 
            fontSize: 16, 
            color: 'rgba(239,231,214,0.75)', 
            lineHeight: 24 
          }}>
            {MOCK_HOUSE.ethos}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {tiles.slice(3).map((tile) => (
            <TouchableOpacity 
              key={tile.label} 
              activeOpacity={0.85} 
              style={{
                flex: 1, 
                backgroundColor: 'rgba(239,231,214,0.08)', 
                borderWidth: 1, 
                borderColor: 'rgba(239,231,214,0.12)', 
                padding: 20, 
                gap: 4,
              }}
            >
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 10.5, 
                fontWeight: '500', 
                textTransform: 'uppercase', 
                letterSpacing: 1.68, 
                color: 'rgba(239,231,214,0.5)' 
              }}>
                {tile.label}
              </Text>
              <Text style={{ 
                fontFamily: fonts.serif, 
                fontSize: 28, 
                fontWeight: '300', 
                color: colors.khadi, 
                lineHeight: 32 
              }}>
                {tile.value}
              </Text>
              {tile.sub && (
                <Text style={{ 
                  fontFamily: fonts.body, 
                  fontSize: 13, 
                  color: 'rgba(239,231,214,0.5)' 
                }}>
                  {tile.sub}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
