import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSurahs } from '../services/surahService'

const normalizeSearch = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim()

export function useSurahs() {
  const [query, setQuery] = useState('')

  const { data: surahs = [], isLoading } = useQuery({
    queryKey: ['surahs'],
    queryFn: getSurahs,
  })

  const filtered = query.trim()
    ? surahs.filter((s) => {
        const name = normalizeSearch(s.name)
        const search = normalizeSearch(query)
        return name.includes(search) || String(s.id).includes(search)
      }).slice(0, 10)
    : surahs

    return { query, setQuery, surahs: filtered, isLoading }
}