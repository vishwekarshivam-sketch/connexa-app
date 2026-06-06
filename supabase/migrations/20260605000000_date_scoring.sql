-- Scoring utility functions for Date matching engine

-- Calculate slider similarity (1 - distance)
CREATE OR REPLACE FUNCTION date_slider_sim(a float, b float)
RETURNS float AS $$
BEGIN
  IF a IS NULL OR b IS NULL THEN RETURN 0.5; END IF; -- Neutral if missing
  RETURN 1.0 - ABS(a - b);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate basic Jaccard similarity for tags
CREATE OR REPLACE FUNCTION date_jaccard_sim(a text[], b text[])
RETURNS float AS $$
DECLARE
  v_intersect_count int;
  v_union_count int;
BEGIN
  IF a IS NULL OR b IS NULL OR array_length(a, 1) IS NULL OR array_length(b, 1) IS NULL THEN
    RETURN 0.0;
  END IF;
  
  SELECT COUNT(*) INTO v_intersect_count
  FROM (
    SELECT unnest(a) INTERSECT SELECT unnest(b)
  ) s;
  
  SELECT COUNT(*) INTO v_union_count
  FROM (
    SELECT unnest(a) UNION SELECT unnest(b)
  ) s;
  
  IF v_union_count = 0 THEN RETURN 0.0; END IF;
  RETURN v_intersect_count::float / v_union_count::float;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Main scoring function
CREATE OR REPLACE FUNCTION calculate_date_score(p_user_id uuid, p_candidate_id uuid)
RETURNS float AS $$
DECLARE
  v_u_profile date_profiles%ROWTYPE;
  v_c_profile date_profiles%ROWTYPE;
  v_u_answers jsonb;
  v_c_answers jsonb;
  v_u_looking_for text;
  v_c_looking_for text;
  
  v_value_sim float := 0;
  v_interest_sim float := 0;
  v_comm_sim float := 0;
  v_context_score float := 0;
  v_final_score float := 0;
  
  v_q1_sim float; v_q2_sim float; v_q3_sim float; v_q4_sim float;
  v_q5_sim float; v_q6_sim float; v_q7_sim float; v_q8_sim float;
  v_q9_sim float; v_q10_sim float; v_q11_sim float;
BEGIN
  -- Load profiles
  SELECT * INTO v_u_profile FROM date_profiles WHERE user_id = p_user_id;
  SELECT * INTO v_c_profile FROM date_profiles WHERE user_id = p_candidate_id;
  
  -- Load answers into a convenient format
  SELECT jsonb_object_agg(question_id, 
    jsonb_build_object('slider', value_slider, 'tags', value_tags, 'enum', value_enum)
  ) INTO v_u_answers FROM date_questionnaire_answers WHERE user_id = p_user_id;
  
  SELECT jsonb_object_agg(question_id, 
    jsonb_build_object('slider', value_slider, 'tags', value_tags, 'enum', value_enum)
  ) INTO v_c_answers FROM date_questionnaire_answers WHERE user_id = p_candidate_id;

  -- 1. ValueSim (w_v = 0.36)
  v_q1_sim := date_slider_sim((v_u_answers->'Q1'->>'slider')::float, (v_c_answers->'Q1'->>'slider')::float);
  v_q2_sim := date_slider_sim((v_u_answers->'Q2'->>'slider')::float, (v_c_answers->'Q2'->>'slider')::float);
  v_q3_sim := date_jaccard_sim(
    ARRAY(SELECT jsonb_array_elements_text(v_u_answers->'Q3'->'tags')),
    ARRAY(SELECT jsonb_array_elements_text(v_c_answers->'Q3'->'tags'))
  );
  v_q4_sim := date_slider_sim((v_u_answers->'Q4'->>'slider')::float, (v_c_answers->'Q4'->>'slider')::float);
  
  v_value_sim := (v_q1_sim + v_q2_sim + v_q3_sim + v_q4_sim) / 4.0;

  -- 2. InterestSim (w_i = 0.30)
  v_q5_sim := date_jaccard_sim(
    ARRAY(SELECT jsonb_array_elements_text(v_u_answers->'Q5'->'tags')),
    ARRAY(SELECT jsonb_array_elements_text(v_c_answers->'Q5'->'tags'))
  );
  v_q6_sim := date_jaccard_sim(
    ARRAY(SELECT jsonb_array_elements_text(v_u_answers->'Q6'->'tags')),
    ARRAY(SELECT jsonb_array_elements_text(v_c_answers->'Q6'->'tags'))
  );
  v_q7_sim := date_slider_sim((v_u_answers->'Q7'->>'slider')::float, (v_c_answers->'Q7'->>'slider')::float);
  v_q8_sim := date_slider_sim((v_u_answers->'Q8'->>'slider')::float, (v_c_answers->'Q8'->>'slider')::float);
  
  v_interest_sim := (v_q5_sim * 0.45 + v_q6_sim * 0.35 + v_q7_sim * 0.12 + v_q8_sim * 0.08);

  -- 3. CommSim (w_c = 0.22)
  v_q9_sim := date_slider_sim((v_u_answers->'Q9'->>'slider')::float, (v_c_answers->'Q9'->>'slider')::float);
  v_q10_sim := date_slider_sim((v_u_answers->'Q10'->>'slider')::float, (v_c_answers->'Q10'->>'slider')::float);
  v_q11_sim := date_slider_sim((v_u_answers->'Q11'->>'slider')::float, (v_c_answers->'Q11'->>'slider')::float);
  
  v_comm_sim := (v_q9_sim + v_q10_sim + v_q11_sim) / 3.0;
  -- Humor clash cap
  IF ABS((v_u_answers->'Q10'->>'slider')::float - (v_c_answers->'Q10'->>'slider')::float) >= 0.75 THEN
    v_comm_sim := LEAST(v_comm_sim, 0.5);
  END IF;

  -- 4. ContextScore (w_l = 0.12)
  -- Same IIT
  IF v_u_profile.iit = v_c_profile.iit THEN v_context_score := v_context_score + 0.45;
  ELSE v_context_score := v_context_score + 0.20;
  END IF;
  
  -- Year gap (assume years are strings like '2026', '2025' etc.)
  -- If not numeric, we'll just skip this part or handle specific cases
  BEGIN
    DECLARE
      v_u_yr int := v_u_profile.year::int;
      v_c_yr int := v_c_profile.year::int;
      v_gap int := ABS(v_u_yr - v_c_yr);
    BEGIN
      IF v_gap <= 1 THEN v_context_score := v_context_score + 0.35;
      ELSIF v_gap = 2 THEN v_context_score := v_context_score + 0.20;
      ELSIF v_gap = 3 THEN v_context_score := v_context_score + 0.05;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Fallback if year is not int (e.g. 'fresher')
      IF v_u_profile.year = v_c_profile.year THEN v_context_score := v_context_score + 0.35; END IF;
    END;
  END;

  -- Same branch
  IF v_u_profile.branch = v_c_profile.branch THEN v_context_score := v_context_score + 0.20; END IF;
  
  v_context_score := GREATEST(0, LEAST(1, v_context_score));

  -- 5. Combine
  v_final_score := (v_value_sim * 0.36) + (v_interest_sim * 0.30) + (v_comm_sim * 0.22) + (v_context_score * 0.12);

  -- 6. "Looking for" multiplier (Q12)
  v_u_looking_for := v_u_answers->'Q12'->>'enum';
  v_c_looking_for := v_c_answers->'Q12'->>'enum';
  
  IF v_u_looking_for IS NOT NULL AND v_c_looking_for IS NOT NULL THEN
    -- Simplified matrix
    IF v_u_looking_for = v_c_looking_for THEN v_final_score := v_final_score * 1.0;
    ELSIF (v_u_looking_for = 'serious' AND v_c_looking_for = 'friends_first') OR (v_u_looking_for = 'friends_first' AND v_c_looking_for = 'serious') THEN
      v_final_score := v_final_score * 0.55;
    ELSE
      v_final_score := v_final_score * 0.85;
    END IF;
  END IF;

  RETURN GREATEST(0, LEAST(1, v_final_score));
END;
$$ LANGUAGE plpgsql STABLE;
