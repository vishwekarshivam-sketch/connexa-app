-- Trigger function to award points for reactions
CREATE OR REPLACE FUNCTION public.handle_reaction_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_house house_enum;
BEGIN
  -- Get the reactor's house
  SELECT house INTO v_house FROM users WHERE id = NEW.user_id;
  
  IF v_house IS NOT NULL THEN
    -- Award 2 points to the reactor
    PERFORM award_points(
      NEW.user_id, 
      v_house, 
      2, 
      'reaction_sent', 
      'reaction:' || NEW.id || ':' || NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply to house_messages reactions
DROP TRIGGER IF EXISTS on_message_reaction ON public.message_reactions;
CREATE TRIGGER on_message_reaction
  AFTER INSERT ON public.message_reactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_reaction_points();

-- Apply to prompt_responses reactions
DROP TRIGGER IF EXISTS on_prompt_reaction ON public.prompt_response_reactions;
CREATE TRIGGER on_prompt_reaction
  AFTER INSERT ON public.prompt_response_reactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_reaction_points();
