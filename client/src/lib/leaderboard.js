import { supabase } from './supabase'

export async function saveGameStart(username, isAnonymous) {
  if (!supabase) {
    console.warn('Supabase not available, skipping leaderboard save');
    localStorage.setItem('apexrank_session_id', 'local_' + Date.now());
    return null;
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert({ username, score: 0, plays: 1, is_anonymous: isAnonymous })
    .select()
    .single()

  if (error) {
    console.error('saveGameStart error:', error)
    return null
  }

  localStorage.setItem('apexrank_session_id', data.id)
  return data.id
}

export async function saveGameEnd(finalScore) {
  if (!supabase) return;

  const sessionId = localStorage.getItem('apexrank_session_id')
  if (!sessionId || sessionId.startsWith('local_')) return

  const { error } = await supabase
    .from('leaderboard')
    .update({ score: finalScore })
    .eq('id', sessionId)

  if (error) {
    console.error('saveGameEnd error (trying username fallback):', error.message)
    // fallback: update by username if ID fails
    const candidateName = localStorage.getItem('apex_candidate_name')
    if (candidateName) {
      const { error: e2 } = await supabase
        .from('leaderboard')
        .update({ score: finalScore })
        .eq('username', candidateName.replace(/\s+/g, '_').slice(0, 20))
      if (e2) console.error('saveGameEnd username fallback also failed:', e2.message)
    }
    return
  }

  localStorage.removeItem('apexrank_session_id')
}

export async function getLeaderboard(limit = 5) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leaderboard')
    .select('username, score, is_anonymous, plays')
    .order('score', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getLeaderboard error:', error)
    return []
  }

  return data
}
