import { useEffect, useState } from 'react'
import './App.css'
import {
  Box,
  Paper,
  TextField,
  Typography,
  Chip,
  Drawer
} from '@mui/material'

import { getSurahs } from './services/surahService'
import { getVersesBySurah } from './services/verseService'
import {
  searchTags,
  getVerseTags,
  getOrCreateTag,
  attachTagToVerse as attachTag
} from './services/tagService'

const normalize = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')

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

function App() {
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
    getSurahs().then(setSurahs)
  }, [])

  async function settingSurahData(surah) {
    setSurahData(null)
    const data = await getVersesBySurah(surah.id)
    setSurahData(data)
  }

  async function openVerse(verse) {
    setActiveVerse(verse)
    setSheetOpen(true)
    const data = await getVerseTags(verse.id)
    setAyahTags(data)
  }

  async function searchTagsHandler(value) {
    setTagInput(value)
    if (!value.trim()) {
      setTags([])
      return
    }
    const data = await searchTags(value)
    setTags(data)
  }

  async function attachTagToVerseHandler(tagName) {
    if (!activeVerse) return
    const cleanTag = normalize(tagName)
    const tag = await getOrCreateTag(cleanTag)
    await attachTag(activeVerse.id, tag.id)
    setTagInput('')
    setTags([])
    openVerse(activeVerse)
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
      return name.includes(search) || String(s.id).includes(search)
    })
    setFilteredSurahs(result.slice(0, 10))
  }

  const filteredVerses = surahData
    ? verseNumber.trim()
      ? surahData.filter((v) => String(v.verse_id) === verseNumber.trim())
      : surahData
    : []

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 2, padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <input
            value={surahSearch}
            onChange={(e) => searchSurah(e.target.value)}
            placeholder="Sure ara (Fatiha, Bakara, 99...)"
            style={{ width: '100%', padding: 12, marginBottom: 12 }}
          />

          {filteredSurahs.map((surah) => (
            <div
              key={surah.id}
              onClick={() => {
                setSelectedSurah(surah)
                setSurahSearch(`${surah.id} - ${surah.name}`)
                setFilteredSurahs([])
                setVerseNumber('')
                settingSurahData(surah)
              }}
              style={{ padding: 8, borderBottom: '1px solid #eee', cursor: 'pointer' }}
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
                  {selectedSurah.id} - {selectedSurah.name} ({selectedSurah.total_verses} ayet)
                </strong>
              </div>

              <input
                value={verseNumber}
                onChange={(e) => setVerseNumber(e.target.value)}
                placeholder="Ayet No (boş bırakırsan tümü gelir)"
                style={{ width: '100%', padding: 12, marginTop: 12 }}
              />
            </>
          )}

          {surahData && (
            <>
              <h2>Sure Verileri</h2>
              {filteredVerses.length > 0 ? (
                filteredVerses.map((verse) => (
                  <Paper
                    key={verse.id}
                    sx={{ p: 2, mb: 2, cursor: 'pointer' }}
                    onClick={() => openVerse(verse)}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {verse.verse_id}
                    </Typography>
                    <Typography>{verse.translation}</Typography>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Bu numarada ayet bulunamadı.
                </Typography>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, borderLeft: '1px solid #ddd', padding: 24 }} />

      <Drawer anchor="bottom" open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Box sx={{ p: 3, minHeight: '50vh' }}>
          {activeVerse && (
            <>
              <Typography variant="h6">
                {activeVerse.surah_name} {activeVerse.verse_id}
              </Typography>

              <Typography sx={{ mt: 2 }}>
                {activeVerse.translation}
              </Typography>

              <Typography sx={{ mt: 3 }}>Etiketler</Typography>

              <Box sx={{ mt: 2 }}>
                {ayahTags.map((item, i) => (
                  <Chip key={i} label={item.tags?.name} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  value={tagInput}
                  onChange={(e) => searchTagsHandler(e.target.value)}
                  placeholder="Tag ara veya ekle"
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    onClick={() => attachTagToVerseHandler(tag.name)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              {tagInput && (
                <Chip
                  color="primary"
                  label={`+ Yeni oluştur: ${tagInput}`}
                  onClick={() => attachTagToVerseHandler(tagInput)}
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