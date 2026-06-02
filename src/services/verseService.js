import { supabase } from '../lib/supabase'

export async function getVersesBySurah(surahId) {
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('surah_id', surahId)
    .order('verse_id')

  if (error) throw error
  return data
}