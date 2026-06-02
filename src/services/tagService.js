import { supabase } from '../lib/supabase'

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
    .select(`
      tag_id,
      tags(name)
    `)
    .eq('verse_id', verseId)

  if (error) throw error
  return data
}

export async function getOrCreateTag(tagName, normalizeFn) {
  const clean = tagName.trim().toLowerCase()
  const normalized = normalizeFn(clean)

  const { data: existing } = await supabase
    .from('tags')
    .select('*')
    .eq('name', clean)
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from('tags')
    .insert({
      name: clean,
      normalized
    })
    .select()
    .single()

  if (error) throw error
  return created
}

export async function attachTagToVerse(verseId, tagId) {
  const { error } = await supabase
    .from('verse_tags')
    .insert({
      verse_id: verseId,
      tag_id: tagId
    })

  if (error) throw error
}