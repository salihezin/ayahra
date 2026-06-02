import { supabase } from '../lib/supabase'

export async function getSurahs() {
  const { data, error } = await supabase
    .from('surahs')
    .select('*')
    .order('id')

  if (error) throw error
  return data
}