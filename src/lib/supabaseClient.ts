import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveBattleLog(matchId: string, round: number, turn: number, actor: string, actionType: string, diceRoll: number, resultText: string) {
  try {
    const { error } = await supabase.from('battle_logs').insert({
      match_id: matchId,
      round_number: round,
      turn_number: turn,
      actor_name: actor,
      action_type: actionType,
      dice_roll: diceRoll,
      result_text: resultText
    });
    
    if (error) throw error;
  } catch (e) {
    console.error('Failed to save log to Supabase', e);
  }
}
