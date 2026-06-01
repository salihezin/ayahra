import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [ayahs, setAyahs] = useState([])
  const [selectedAyah, setSelectedAyah] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [ayahTags, setAyahTags] = useState([])

  useEffect(() => {
    fetchAyahs()
  }, [])

  async function fetchAyahs() {
    const { data } = await supabase
      .from('verses')
      .select('*')
      .order('id')
      .limit(20)

    setAyahs(data || [])
  }

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

  async function attachTag(tagName) {
    const cleanTag = tagName.trim().toLowerCase()
    const normalized = normalize(cleanTag)
  
    const { data: existing, error: existingError } = await supabase
      .from('tags')
      .select('*')
      .eq('name', cleanTag)
      .maybeSingle()
  
    if (existingError) {
      console.error(existingError)
      return
    }
  
    let tagId
  
    if (existing) {
      tagId = existing.id
    } else {
      const { data: created, error: createError } = await supabase
        .from('tags')
        .insert({ name: cleanTag, normalized: normalized })
        .select()
        .single()
  
      if (createError) {
        console.error(createError)
        return
      }
  
      tagId = created.id
    }
  
    const { error: attachError } = await supabase
      .from('verse_tags')
      .insert({
        verse_id: selectedAyah.id,
        tag_id: tagId
      })
  
    if (attachError) {
      console.error(attachError)
      return
    }
  
    setTagInput('')
    setTags([])
    fetchAyahTags()
  }


  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      <div style={{ flex: 2, padding: 24 }}>
        <h1>Ayahra Admin</h1>

        {ayahs.map((ayah) => (
          <div
            key={ayah.id}
            onClick={() => setSelectedAyah(ayah)}
            style={{
              border: '1px solid #ddd',
              padding: 16,
              marginBottom: 12,
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            <strong>
              {ayah.surah_name} {ayah.verse_id}
            </strong>
            <p>{ayah.translation}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          borderLeft: '1px solid #ddd',
          padding: 24
        }}
      >
        {selectedAyah ? (
          <>
            <h2>Tag Yönet</h2>

            <p>
              <strong>
                {selectedAyah.surah_name} {selectedAyah.verse_id}
              </strong>
            </p>

            <p>{selectedAyah.translation}</p>

            <>
              <input
                value={tagInput}
                onChange={(e) => searchTags(e.target.value)}
                placeholder="Tag ara veya ekle"
                style={{
                  width: '100%',
                  padding: 12,
                  marginTop: 16
                }}
              />

              <div style={{ marginTop: 12 }}>
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => attachTag(tag.name)}
                    style={{
                      padding: 8,
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    {tag.name}
                  </div>
                ))}

                {tagInput && (
                  <div
                    onClick={() => attachTag(tagInput)}
                    style={{
                      padding: 8,
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    + Yeni oluştur: {tagInput}
                  </div>
                )}
              </div>

              <h3 style={{ marginTop: 24 }}>Bağlı Tagler</h3>

              {ayahTags.map((item, i) => (
                <div key={i}>{item.tags?.name}</div>
              ))}
            </>
          </>
        ) : (
          <p>Bir ayet seç</p>
        )}
      </div>
    </div>
  )
}

export default App