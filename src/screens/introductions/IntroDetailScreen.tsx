import { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IntroStackParamList, PublicIntroduction } from '@/types';
import { colors, fonts } from '@/tokens';
import { useAuth } from '@/context/AuthContext';
import { useIntroDetail, useToggleIntroReaction, useIntroComments, useAddIntroComment, useIntroCommentsRealtime } from '@/hooks/useIntroductions';
import { Icon } from '@/components/Icon';

type Props = NativeStackScreenProps<IntroStackParamList, 'IntroDetail'>;

export function IntroDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { introId } = route.params;
  const { user } = useAuth();
  
  console.log('[IntroDetail] Current User:', { 
    id: user?.id, 
    user_type: user?.user_type, 
    is_admin: user?.is_admin,
    status: user?.status
  });
  
  const { data: intro, isLoading: loadingIntro } = useIntroDetail(introId);
  const { data: comments = [], isLoading: isLoadingComments } = useIntroComments(introId);
  useIntroCommentsRealtime(introId);
  
  const reactMutation = useToggleIntroReaction();
  const addCommentMutation = useAddIntroComment();

  const [commentBody, setCommentBody] = useState('');

  const handleSendComment = () => {
    const trimmed = commentBody.trim();
    if (trimmed && !addCommentMutation.isPending) {
      addCommentMutation.mutate({ introId, body: trimmed }, {
        onSuccess: () => setCommentBody(''),
        onError: (err: any) => {
          const msg = err.message || 'Failed to post comment.';
          if (Platform.OS === 'web') {
            alert(msg);
          } else {
            Alert.alert('Error', msg);
          }
        }
      });
    }
  };

  const handleToggleReaction = () => {
    if (!reactMutation.isPending) {
      reactMutation.mutate(introId);
    }
  };

  if (loadingIntro) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (!intro) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.body, color: colors.inkMute }}>Introduction not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.ink, textDecorationLine: 'underline' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.khadi }}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.hairlineSoft }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <Icon name="chevronLeft" size={24} color={colors.ink} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fonts.label, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4, color: colors.ink, marginLeft: 8 }}>
            Introduction
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Hero Image */}
          <View style={{ width: '100%', aspectRatio: 1 }}>
            {intro.photo_url ? (
              <Image source={{ uri: intro.photo_url }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View style={{ width: '100%', height: '100%', backgroundColor: colors.khadiDeep, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.serif, fontSize: 48, color: colors.khadi }}>{intro.display_name.slice(0, 2).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={{ padding: 24 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 32, color: colors.ink, marginBottom: 4 }}>{intro.display_name}</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 16, color: colors.inkMute,  marginBottom: 20 }}>
              {[intro.iit?.toUpperCase(), intro.branch, intro.hometown].filter(Boolean).join(' · ')}
            </Text>

            <View style={{ height: 1, backgroundColor: colors.hairlineSoft, marginBottom: 24 }} />

            <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink, marginBottom: 24, lineHeight: 32 }}>
              "{intro.one_liner}"
            </Text>

            {intro.interests && intro.interests.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {intro.interests.map((it: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{it}</Text>
                  </View>
                ))}
              </View>
            )}

            {intro.question && (
              <View style={styles.questionBlock}>
                <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.ink, lineHeight: 30 }}>
                  <Text style={{ color: colors.ember }}>❝</Text> {intro.question} <Text style={{ color: colors.ember }}>❞</Text>
                </Text>
              </View>
            )}

            {/* Interaction Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.hairlineSoft, marginBottom: 24 }}>
              <TouchableOpacity 
                onPress={handleToggleReaction} 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Icon name="heart" size={24} color={intro.user_has_reacted ? colors.ember : colors.ink} />
                <Text style={{ fontFamily: fonts.label, fontSize: 12, color: colors.ink }}>{intro.reaction_count || 0} resonated</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="messageSquare" size={24} color={colors.ink} />
                <Text style={{ fontFamily: fonts.label, fontSize: 12, color: colors.ink }}>{intro.comment_count || 0} comments</Text>
              </View>
            </View>

            {/* Comments Section */}
            <Text style={{ fontFamily: fonts.label, fontSize: 12, textTransform: 'uppercase', color: colors.inkMute, marginBottom: 16 }}>Comments</Text>
            
            {isLoadingComments ? (
              <ActivityIndicator color={colors.ink} style={{ marginVertical: 20 }} />
            ) : (
              <View style={{ gap: 20 }}>
                {comments.map((comment) => (
                  <View key={comment.id} style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={styles.smallAvatar}>
                      {comment.photo_url ? (
                        <Image source={{ uri: comment.photo_url }} style={{ width: 32, height: 32 }} />
                      ) : (
                        <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.inkWhisper }}>{comment.display_name?.slice(0, 2).toUpperCase() || '?'}</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={{ fontFamily: fonts.serif, fontSize: 15, color: colors.ink }}>{comment.display_name || 'Anonymous'}</Text>
                        <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.inkWhisper }}>{new Date(comment.created_at).toLocaleDateString()}</Text>
                      </View>
                      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 20 }}>{comment.body}</Text>
                    </View>
                  </View>
                ))}
                {comments.length === 0 && (
                  <Text style={{ fontFamily: fonts.bodyItalic, fontStyle: 'italic', fontSize: 14, color: colors.inkWhisper }}>No comments yet. Be the first to say something!</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Sticky Comment Input (Now in flex flow) */}
        <View style={{
          backgroundColor: colors.khadi,
          borderTopWidth: 1,
          borderTopColor: colors.hairlineSoft,
          padding: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 12,
        }}>
          <TextInput
            style={styles.commentInput}
            placeholder="Say something..."
            value={commentBody}
            onChangeText={setCommentBody}
            maxLength={280}
            multiline
            onSubmitEditing={handleSendComment}
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            onPress={handleSendComment}
            disabled={!commentBody.trim() || addCommentMutation.isPending}
            style={[styles.sendButton, { opacity: commentBody.trim() ? 1 : 0.5 }]}
          >
            {addCommentMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.khadi} />
            ) : (
              <Icon name="chevronRight" size={20} color={colors.khadi} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  tagText: {
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.inkMute,
  },
  questionBlock: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairlineSoft,
    marginBottom: 24,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    backgroundColor: colors.lichen,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.khadi,
    borderTopWidth: 1,
    borderTopColor: colors.hairlineSoft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: fonts.body,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
