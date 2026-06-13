import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, TextInput } from 'react-native';
import { colors, fonts } from '@/tokens';
import { Icon } from '@/components/Icon';
import { ConnexaUser, House } from '@/types';
import { 
  getHouseLeaders,
  assignHouseLeader,
  removeHouseLeader,
  searchUsers
} from '@/lib/supabase';

export function HouseLeaders() {
  const [leaders, setLeaders] = useState<ConnexaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningHouse, setAssigningHouse] = useState<House | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ConnexaUser[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchLeaders = async () => {
    setLoading(true);
    const data = await getHouseLeaders();
    setLeaders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setSearching(false);
  };

  const handleAssign = async (user: ConnexaUser) => {
    if (!assigningHouse) return;
    Alert.alert(
      'Assign Leader',
      `Assign ${user.display_name} as leader of ${assigningHouse.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            const { error } = await assignHouseLeader(user.id);
            if (error) Alert.alert('Error', error);
            else {
              setAssigningHouse(null);
              setSearchQuery('');
              setSearchResults([]);
              fetchLeaders();
            }
          }
        }
      ]
    );
  };

  const handleRemove = async (leader: ConnexaUser) => {
    Alert.alert(
      'Remove Leader',
      `Remove ${leader.display_name} as leader of ${leader.house?.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await removeHouseLeader(leader.id);
            if (error) Alert.alert('Error', error);
            else fetchLeaders();
          }
        }
      ]
    );
  };

  const houses: House[] = ['tinkerers', 'wanderers', 'strategists', 'mavericks'];

  if (loading) return <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>House Leaders</Text>
        <Text style={{ fontFamily: fonts.body, color: colors.inkWhisper, marginTop: 4 }}>
          Assign and manage founding leaders for each house.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
        {houses.map((h) => {
          const leader = leaders.find(l => l.house === h);
          return (
            <View key={h} style={{ width: '50%', padding: 6 }}>
              <View style={{
                padding: 16,
                backgroundColor: colors.khadiLt,
                borderWidth: 1,
                borderColor: colors.hairline,
                borderRadius: 8,
                minHeight: 140,
                justifyContent: 'space-between',
              }}>
                <View>
                  <Text style={{ 
                    fontFamily: fonts.label, 
                    fontSize: 10, 
                    color: colors.inkWhisper, 
                    textTransform: 'uppercase', 
                    letterSpacing: 1.2 
                  }}>
                    {h}
                  </Text>
                  {leader ? (
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>{leader.display_name}</Text>
                      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkWhisper }}>
                        {leader.iit?.toUpperCase()} · {leader.branch}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontFamily: fonts.bodyItalic, fontStyle: 'italic', color: colors.inkWhisper, marginTop: 12 }}>
                      No leader assigned
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <TouchableOpacity 
                    onPress={() => setAssigningHouse(h)}
                    style={{ 
                      backgroundColor: colors.ink, 
                      paddingHorizontal: 12, 
                      paddingVertical: 6, 
                      borderRadius: 4,
                      marginRight: 8
                    }}
                  >
                    <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.khadi }}>{leader ? 'CHANGE' : 'ASSIGN'}</Text>
                  </TouchableOpacity>
                  {leader && (
                    <TouchableOpacity 
                      onPress={() => handleRemove(leader)}
                      style={{ 
                        backgroundColor: 'transparent', 
                        paddingHorizontal: 12, 
                        paddingVertical: 6, 
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: colors.hairline
                      }}
                    >
                      <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.inkWhisper }}>REMOVE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Modal visible={!!assigningHouse} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: 60 }}>
          <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 20 }}>Assign Leader for {assigningHouse?.toUpperCase()}</Text>
            <TouchableOpacity onPress={() => { setAssigningHouse(null); setSearchQuery(''); setSearchResults([]); }}>
              <Icon name="x" size={24} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <TextInput
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search by name or email..."
              style={{
                backgroundColor: colors.khadiLt,
                borderWidth: 1,
                borderColor: colors.hairline,
                borderRadius: 8,
                padding: 12,
                fontFamily: fonts.body,
              }}
            />
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }}>
            {searching ? (
              <ActivityIndicator color={colors.ink} />
            ) : searchResults.length > 0 ? (
              searchResults.map((u) => (
                <TouchableOpacity 
                  key={u.id} 
                  onPress={() => handleAssign(u)}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.hairlineSoft,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.khadiDk, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{u.display_name?.[0]}</Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: fonts.body, fontSize: 16 }}>{u.display_name}</Text>
                    <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkWhisper }}>{u.email}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : searchQuery.length >= 2 ? (
              <Text style={{ textAlign: 'center', color: colors.inkWhisper, marginTop: 20 }}>No results found.</Text>
            ) : (
              <Text style={{ textAlign: 'center', color: colors.inkWhisper, marginTop: 20 }}>Start typing to search...</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
