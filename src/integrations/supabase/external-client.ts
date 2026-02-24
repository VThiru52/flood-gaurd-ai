// External Supabase client for the user's own project with floodAI data
import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://ghyplaiaisscvadyugyy.supabase.co';
const EXTERNAL_SUPABASE_KEY = 'sb_publishable_m2j0NH0bDr5gusubdYFejA_27dTDxAT';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_KEY);
