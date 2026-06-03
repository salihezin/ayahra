import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  searchTags,
  getVerseTags,
  getOrCreateTag,
  attachTagToVerse,
  detachTagFromVerse,
  getPopularTags,
} from '../services/tagService'

const normalize = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, '-')

export function useTags(verseId) {
  const [tagInput, setTagInput] = useState('')
  const queryClient = useQueryClient()

  const { data: verseTags = [] } = useQuery({
    queryKey: ['verseTags', verseId],
    queryFn: () => getVerseTags(verseId),
    enabled: !!verseId,
  })

  const { data: searchResults = [] } = useQuery({
    queryKey: ['tagSearch', tagInput],
    queryFn: () => searchTags(tagInput),
    enabled: tagInput.trim().length > 0,
  })

  const { mutate: attachTag } = useMutation({
    mutationFn: async (tagName) => {
      const tag = await getOrCreateTag(normalize(tagName))
      await attachTagToVerse(verseId, tag.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseTags', verseId] })
      queryClient.refetchQueries({ queryKey: ['verseTags', verseId] })
      setTagInput('')
    },
  })

  const { mutate: removeTag } = useMutation({
    mutationFn: (tagId) => detachTagFromVerse(verseId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verseTags', verseId] })
    },
  })

  const { data: popularTags = [] } = useQuery({
    queryKey: ['popularTags'],
    queryFn: getPopularTags,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
  })

  return { verseTags, searchResults, popularTags, tagInput, setTagInput, attachTag, removeTag }
}