import { supabase } from '../lib/supabase'

const normalize = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, '-')

export async function searchTags(query) {
  if (!query.trim()) return []

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) throw error
  return data
}

export async function getVerseTags(verseId) {
  const { data, error } = await supabase
    .from('verse_tags')
    .select(`tag_id, tags(name)`)
    .eq('verse_id', verseId)

  if (error) throw error
  return data
}

export async function getOrCreateTag(tagName) {
  const clean = tagName.trim().toLowerCase()

  const { data: existing } = await supabase
    .from('tags')
    .select('*')
    .eq('name', clean)
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from('tags')
    .insert({ name: clean, normalized: normalize(clean) })
    .select()
    .single()

  if (error) throw error
  return created
}

export async function attachTagToVerse(verseId, tagId) {
  const { error } = await supabase
    .from('verse_tags')
    .insert({ verse_id: verseId, tag_id: tagId })

  if (error) throw error
}

export async function detachTagFromVerse(verseId, tagId) {
  const { error } = await supabase
    .from('verse_tags')
    .delete()
    .eq('verse_id', verseId)
    .eq('tag_id', tagId)

  if (error) throw error
}

export async function getPopularTags() {
  const { data, error } = await supabase
    .from('popular_tags')
    .select('*')

  if (error) throw error
  return data
}