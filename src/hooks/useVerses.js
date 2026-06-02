import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getVersesBySurah } from '../services/verseService'

export function useVerses(surahId) {
  const [verseNumber, setVerseNumber] = useState('')

  const { data: verses = [], isLoading } = useQuery({
    queryKey: ['verses', surahId],
    queryFn: () => getVersesBySurah(surahId),
    enabled: !!surahId,
  })

  const filtered = verseNumber.trim()
    ? verses.filter((v) => String(v.verse_id) === verseNumber.trim())
    : verses

  return { verses: filtered, isLoading, verseNumber, setVerseNumber }
}