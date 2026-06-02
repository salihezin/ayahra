import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'
import {
  Box,
  Paper,
  TextField,
  Typography,
  Chip,
  Button,
  Drawer
} from '@mui/material'

function App() {
  const [selectedAyah, setSelectedAyah] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [ayahTags, setAyahTags] = useState([])
  const [surahs, setSurahs] = useState([])
  const [surahSearch, setSurahSearch] = useState('')
  const [filteredSurahs, setFilteredSurahs] = useState([])
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [verseNumber, setVerseNumber] = useState('')
  const [surahData, setSurahData] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeVerse, setActiveVerse] = useState(null)

  useEffect(() => {
    fetchSurahs()
  }, [])

  async function openVerse(verse) {
    setActiveVerse(verse)
    setSheetOpen(true)

    const { data } = await supabase
      .from('verse_tags')
      .select(`
        tag_id,
        tags(name)
      `)
      .eq('verse_id', verse.id)

    setAyahTags(data || [])
  }

  async function settingSurahData(surah) {
    setSurahData(null)

    const { data } = await supabase
      .from('verses')
      .select('*')
      .eq('surah_id', surah.id)
      .order('verse_id')

    setSurahData(data || [])
  }

  async function fetchSurahs() {
    const { data } = await supabase
      .from('surahs')
      .select('*')
      .order('id')

    console.log('data surahs', data)

    setSurahs(data || [])
  }

  async function loadVerse() {
    if (!selectedSurah || !verseNumber) return

    const { data } = await supabase
      .from('verses')
      .select('*')
      .eq('surah_id', selectedSurah.id)
      .eq('verse_id', Number(verseNumber))
      .maybeSingle()

    if (data) {
      setSelectedAyah(data)
    }
  }

  async function loadSurah() {
    if (!selectedSurah) return

    const { data } = await supabase
      .from('verses')
      .select('*')
      .eq('surah_id', selectedSurah.id)
      .order('verse_id')

    if (data) {
      setSurahData(data)
    }
  }

  console.log('surahData', surahData)

  useEffect(() => {
    if (selectedAyah) {
      fetchAyahTags()
    }
  }, [selectedAyah])

  async function fetchAyahTags() {
    const { data } = await supabase
      .from('verse_tags')
      .select(`
        tag_id,
        tags(name)
      `)
      .eq('verse_id', selectedAyah.id)

    setAyahTags(data || [])
  }

  async function searchTags(value) {
    setTagInput(value)

    if (!value.trim()) {
      setTags([])
      return
    }

    const { data } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${value}%`)
      .limit(10)

    setTags(data || [])
  }

  const normalize = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')

  async function attachTagToVerse(tagName) {
    if (!activeVerse) return

    const cleanTag = tagName.trim().toLowerCase()
    const normalized = normalize(cleanTag)

    let tagId

    const { data: existing } = await supabase
      .from('tags')
      .select('*')
      .eq('name', cleanTag)
      .maybeSingle()

    if (existing) {
      tagId = existing.id
    } else {
      const { data: created } = await supabase
        .from('tags')
        .insert({
          name: cleanTag,
          normalized
        })
        .select()
        .single()

      tagId = created.id
    }

    await supabase
      .from('verse_tags')
      .insert({
        verse_id: activeVerse.id,
        tag_id: tagId
      })

    setTagInput('')
    setTags([])

    openVerse(activeVerse)
  }

  function normalizeSearch(text) {
    return text
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
  }

  function searchSurah(value) {
    setSurahSearch(value)

    if (!value.trim()) {
      setFilteredSurahs([])
      return
    }

    const search = normalizeSearch(value)

    const result = surahs.filter((s) => {
      const name = normalizeSearch(s.name)

      return (
        name.includes(search) ||
        String(s.id).includes(search)
      )
    })

    setFilteredSurahs(result.slice(0, 10))
  }


  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      <div style={{ flex: 2, padding: 24 }}>
        <div style={{ marginBottom: 24 }}>

          <input
            value={surahSearch}
            onChange={(e) => searchSurah(e.target.value)}
            placeholder="Sure ara (Fatiha, Bakara, 99...)"
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 12
            }}
          />

          {filteredSurahs.map((surah) => (
            <div
              key={surah.id}
              onClick={() => {
                setSelectedSurah(surah)
                setSurahSearch(`${surah.id} - ${surah.name}`)
                setFilteredSurahs([])
                settingSurahData(surah)
              }}
              style={{
                padding: 8,
                borderBottom: '1px solid #eee',
                cursor: 'pointer'
              }}
            >
              {surah.id} - {surah.name}
            </div>
          ))}

          {selectedSurah && (
            <>
              <div style={{ marginTop: 16 }}>
                Seçilen Sure:
                <strong>
                  {' '}
                  {selectedSurah.id} - {selectedSurah.name}
                  ( {selectedSurah.total_verses} ayet)
                </strong>
              </div>

              <input
                value={verseNumber}
                onChange={(e) => setVerseNumber(e.target.value)}
                placeholder="Ayet No"
                style={{
                  width: '100%',
                  padding: 12,
                  marginTop: 12
                }}
              />

              <button
                onClick={loadVerse}
                style={{
                  marginTop: 12,
                  padding: 12
                }}
              >
                Ayeti Getir
              </button>
            </>
          )}
          {surahData && (
            <>
              <h2>Sure Verileri</h2>
              {surahData?.map((verse) => (
                <Paper
                  key={verse.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'pointer'
                  }}
                  onClick={() => openVerse(verse)}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {verse.verse_id}
                  </Typography>

                  <Typography>
                    {verse.translation}
                  </Typography>
                </Paper>
              ))}
            </>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          borderLeft: '1px solid #ddd',
          padding: 24
        }}
      >

      </div>
      <Drawer
        anchor="bottom"
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      >
        <Box
          sx={{
            p: 3,
            minHeight: '50vh'
          }}
        >
          {activeVerse && (
            <>
              <Typography variant="h6">
                {activeVerse.surah_name} {activeVerse.verse_id}
              </Typography>

              <Typography sx={{ mt: 2 }}>
                {activeVerse.translation}
              </Typography>

              <Typography sx={{ mt: 3 }}>
                Etiketler
              </Typography>

              <Box sx={{ mt: 2 }}>
                {ayahTags.map((item, i) => (
                  <Chip
                    key={i}
                    label={item.tags?.name}
                    sx={{
                      mr: 1,
                      mb: 1
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  value={tagInput}
                  onChange={(e) => searchTags(e.target.value)}
                  placeholder="Tag ara veya ekle"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    onClick={() => attachTagToVerse(tag.name)}
                    sx={{
                      mr: 1,
                      mb: 1
                    }}
                  />
                ))}
              </Box>
              {tagInput && (
                <Chip
                  color="primary"
                  label={`+ Yeni oluştur: ${tagInput}`}
                  onClick={() =>
                    attachTagToVerse(tagInput)
                  }
                />
              )}
            </>
          )}
        </Box>
      </Drawer>
    </div>
  )
}

export default App