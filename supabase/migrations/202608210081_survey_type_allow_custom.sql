-- The survey builder can publish surveys at any slug, but survey_responses.survey_type was
-- CHECK-constrained to only 'general'/'pastor_elder' — so every custom-survey submission
-- violated the constraint and was silently lost. Drop the constraint so any published
-- survey's responses save. (survey_type is still validated at the API layer against
-- published forms.)
alter table public.survey_responses drop constraint if exists survey_responses_survey_type_check;
