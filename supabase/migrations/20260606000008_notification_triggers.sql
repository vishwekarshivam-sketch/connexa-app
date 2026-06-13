-- Automated notification triggers for key events.
-- Follows spec #2026-05-31-notifications-design.md

-- 1. Helper to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_category notification_category_enum,
  p_title text,
  p_body text,
  p_deep_link text
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, category, title, body, deep_link)
  VALUES (p_user_id, p_category, p_title, p_body, p_deep_link)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 2. Mutual Match Notification
CREATE OR REPLACE FUNCTION public.handle_match_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_a_name text;
  v_user_b_name text;
BEGIN
  -- Only fire when state moves to 'mutual'
  IF (TG_OP = 'UPDATE' AND OLD.state <> 'mutual' AND NEW.state = 'mutual') THEN
    SELECT display_name INTO v_user_a_name FROM users WHERE id = NEW.from_user;
    SELECT display_name INTO v_user_b_name FROM users WHERE id = NEW.to_user;

    -- Notify User A about User B
    PERFORM create_notification(
      NEW.from_user,
      'mutual_match',
      'New Match',
      'You and ' || COALESCE(v_user_b_name, 'someone') || ' are both interested. Say hi!',
      '/date/matches/' || NEW.match_id
    );

    -- Notify User B about User A
    PERFORM create_notification(
      NEW.to_user,
      'mutual_match',
      'New Match',
      'You and ' || COALESCE(v_user_a_name, 'someone') || ' are both interested. Say hi!',
      '/date/matches/' || NEW.match_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_mutual_match ON public.interests;
CREATE TRIGGER on_mutual_match
  AFTER UPDATE ON public.interests
  FOR EACH ROW EXECUTE FUNCTION public.handle_match_notification();

-- 3. Reaction Notification (with batching logic)
CREATE OR REPLACE FUNCTION public.handle_reaction_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_recipient_id uuid;
  v_actor_name text;
  v_actor_id uuid;
  v_deep_link text;
  v_batch_exists boolean;
  v_batch_fired boolean;
BEGIN
  v_actor_id := NEW.user_id;
  SELECT display_name INTO v_actor_name FROM users WHERE id = v_actor_id;

  -- Determine recipient and deep link
  IF TG_TABLE_NAME = 'message_reactions' THEN
    SELECT user_id INTO v_recipient_id FROM house_messages WHERE id = NEW.message_id;
    v_deep_link := '/house/chat'; -- Simplified for now
  ELSE
    SELECT user_id INTO v_recipient_id FROM prompt_responses WHERE id = NEW.response_id;
    v_deep_link := '/house/profile'; -- Simplified for now
  END IF;

  -- Don't notify yourself
  IF v_recipient_id = v_actor_id THEN
    RETURN NEW;
  END IF;

  -- Check batch state
  SELECT EXISTS (
    SELECT 1 FROM notification_batch_state 
    WHERE user_id = v_recipient_id AND category = 'reaction' AND fired = false
  ) INTO v_batch_exists;

  IF NOT v_batch_exists THEN
    -- Start a new batch
    INSERT INTO notification_batch_state (user_id, category, batch_data, fire_at)
    VALUES (
      v_recipient_id, 
      'reaction', 
      jsonb_build_object('actors', jsonb_build_array(v_actor_name), 'deep_link', v_deep_link, 'count', 1),
      NOW() + INTERVAL '1 hour'
    );
  ELSE
    -- Update existing batch
    UPDATE notification_batch_state
    SET 
      batch_data = jsonb_build_object(
        'actors', (batch_data->'actors') || jsonb_build_array(v_actor_name),
        'deep_link', v_deep_link,
        'count', (batch_data->'count')::int + 1
      ),
      fire_at = CASE 
        WHEN (batch_data->'count')::int >= 9 THEN NOW() -- Fire immediately on 10th
        ELSE fire_at 
      END
    WHERE user_id = v_recipient_id AND category = 'reaction' AND fired = false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_msg_reaction_notif ON public.message_reactions;
CREATE TRIGGER on_msg_reaction_notif
  AFTER INSERT ON public.message_reactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_reaction_notification();

DROP TRIGGER IF EXISTS on_prompt_reaction_notif ON public.prompt_response_reactions;
CREATE TRIGGER on_prompt_reaction_notif
  AFTER INSERT ON public.prompt_response_reactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_reaction_notification();

-- 4. Batch firing function (to be called by cron or manually)
CREATE OR REPLACE FUNCTION public.process_notification_batches()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_batch RECORD;
  v_body text;
  v_actors jsonb;
  v_count int;
BEGIN
  FOR v_batch IN 
    SELECT * FROM notification_batch_state 
    WHERE fire_at <= NOW() AND fired = false
  LOOP
    v_actors := v_batch.batch_data->'actors';
    v_count := (v_batch.batch_data->'count')::int;

    IF v_count = 1 THEN
      v_body := (v_actors->>0) || ' reacted to your response.';
    ELSIF v_count = 2 THEN
      v_body := (v_actors->>0) || ' and ' || (v_actors->>1) || ' reacted to your response.';
    ELSE
      v_body := (v_actors->>0) || ' and ' || (v_count - 1) || ' others reacted to your response.';
    END IF;

    PERFORM create_notification(
      v_batch.user_id,
      'reaction',
      'New Reactions',
      v_body,
      v_batch.batch_data->>'deep_link'
    );

    UPDATE notification_batch_state SET fired = true WHERE user_id = v_batch.user_id AND category = v_batch.category;
  END LOOP;
END;
$$;
