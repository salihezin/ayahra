import { useState } from 'react'
import { useSurahs } from './hooks/useSurahs'
import { useVerses } from './hooks/useVerses'
import { useTags } from './hooks/useTags'

function SearchIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  )
}

function ChevronRight({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
    </svg>
  )
}

function ChevronLeft({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8" />
    </svg>
  )
}

function SkeletonList({ count = 6 }) {
  return (
    <div className="px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-3.5 border-b border-gray-100 dark:border-white/5">
          <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-full w-32 mb-2 animate-pulse" />
          <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-full w-16 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('surahs')
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [activeVerse, setActiveVerse] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [swipeStartY, setSwipeStartY] = useState(null)
  const [activeVerseIndex, setActiveVerseIndex] = useState(null)

  const { query, setQuery, surahs, isLoading: surahsLoading } = useSurahs()
  const { verses, isLoading: versesLoading, verseNumber, setVerseNumber } = useVerses(selectedSurah?.id)
  const { verseTags, searchResults, popularTags, tagInput, setTagInput, attachTag, removeTag } = useTags(activeVerse?.id)

  function selectSurah(surah) {
    setSelectedSurah(surah)
    setQuery('')
    setScreen('verses')
  }

  function openVerse(verse) {
    const index = verses.findIndex((v) => v.id === verse.id)
    setActiveVerseIndex(index)
    setActiveVerse(verse)
    setSheetOpen(true)
  }

  function goToVerse(index) {
    if (index < 0 || index >= verses.length) return
    const verse = verses[index]
    setActiveVerseIndex(index)
    setActiveVerse(verse)
  }

  function closeSheet() {
    setSheetOpen(false)
    setTagInput('')
  }

  function onSwipeStart(e) {
    setSwipeStartY(e.touches[0].clientY)
  }

  function onSwipeEnd(e) {
    if (swipeStartY === null) return
    const delta = e.changedTouches[0].clientY - swipeStartY
    if (delta > 60) closeSheet()
    setSwipeStartY(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e0e0f] flex flex-col max-w-lg mx-auto">

      {/* EKRAN 1 — Sure listesi */}
      {screen === 'surahs' && (
        <div className="flex flex-col flex-1">
          <div className="px-4 pt-12 pb-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Kuran</h1>
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5">
              <span className="text-gray-400 dark:text-white/30"><SearchIcon /></span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sure ara..."
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 outline-none"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          {surahsLoading ? (
            <SkeletonList count={8} />
          ) : (
            <div className="flex-1 overflow-y-auto px-4">
              {surahs.map((surah) => (
                <button
                  key={surah.id}
                  onClick={() => selectSurah(surah)}
                  className="w-full flex items-center justify-between py-3.5 border-b border-gray-100 dark:border-white/5 text-left active:bg-gray-100 dark:active:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-white bg-gray-300 dark:bg-white/15 rounded-md w-7 h-7 flex items-center justify-center shrink-0">
                      {surah.id}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{surah.name}</p>
                      <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{surah.total_verses} ayet</p>
                    </div>
                  </div>
                  <span className="text-gray-300 dark:text-white/20"><ChevronRight /></span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EKRAN 2 — Ayet listesi */}
      {screen === 'verses' && (
        <div className="flex flex-col flex-1">
          <div className="px-4 pt-12 pb-3 flex items-center gap-3">
            <button
              onClick={() => setScreen('surahs')}
              className="text-gray-400 dark:text-white/40 active:text-gray-600 dark:active:text-white/60"
            >
              <ChevronLeft />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedSurah?.name}</h1>
              <p className="text-xs text-gray-400 dark:text-white/30">{selectedSurah?.total_verses} ayet</p>
            </div>
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5">
              <span className="text-gray-400 dark:text-white/30"><FilterIcon /></span>
              <input
                value={verseNumber}
                onChange={(e) => setVerseNumber(e.target.value)}
                placeholder="Ayet no ile filtrele..."
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 outline-none"
                style={{ fontSize: '16px' }}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            {versesLoading ? (
              <SkeletonList count={6} />
            ) : verses.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-white/30 text-center mt-8">Ayet bulunamadı.</p>
            ) : (
              verses.map((verse) => (
                <button
                  key={verse.id}
                  onClick={() => openVerse(verse)}
                  className="w-full text-left py-3.5 border-b border-gray-100 dark:border-white/5 active:bg-gray-100 dark:active:bg-white/5"
                >
                  <p className="text-xs font-medium text-gray-400 dark:text-white/30 mb-1">Ayet {verse.verse_id}</p>
                  <p className="text-sm text-gray-800 dark:text-white/80 leading-relaxed">{verse.translation}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* BOTTOM SHEET */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 dark:bg-black/60 z-40" onClick={closeSheet} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1a1b] rounded-t-2xl max-w-lg mx-auto border-t border-gray-100 dark:border-white/10"
            onTouchStart={onSwipeStart}
            onTouchEnd={onSwipeEnd}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 bg-gray-200 dark:bg-white/15 rounded-full" />
            </div>

            {/* Navigasyon */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-white/5">
              <button
                onPointerDown={() => goToVerse(activeVerseIndex - 1)}
                disabled={activeVerseIndex === 0}
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40 disabled:opacity-20 active:text-gray-800 dark:active:text-white py-1 pr-3"
              >
                <ChevronLeft className="w-4 h-4" />
                Önceki
              </button>

              <span className="text-xs text-gray-400 dark:text-white/30">
                {activeVerse?.verse_id} / {selectedSurah?.total_verses}
              </span>

              <button
                onPointerDown={() => goToVerse(activeVerseIndex + 1)}
                disabled={activeVerseIndex === verses.length - 1}
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40 disabled:opacity-20 active:text-gray-800 dark:active:text-white py-1 pl-3"
              >
                Sonraki
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 pb-10 max-h-[85vh] overflow-y-auto">
              <p className="text-xs text-gray-400 dark:text-white/30 mt-2">
                {activeVerse?.surah_name} · Ayet {activeVerse?.verse_id}
              </p>
              <p className="text-sm text-gray-800 dark:text-white/80 leading-relaxed mt-1 mb-4">
                {activeVerse?.translation}
              </p>

              {/* Mevcut etiketler */}
              {verseTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {verseTags.map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full"
                    >
                      {item.tags?.name}
                      <button
                        onClick={() => removeTag(item.tag_id)}
                        className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag input */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 mb-3">
                <span className="text-gray-400 dark:text-white/30"><SearchIcon /></span>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Etiket ara veya ekle..."
                  className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 outline-none"
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Arama sonuçları veya popüler etiketler */}
              {tagInput.trim() ? (
                searchResults.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {searchResults.map((tag) => (
                      <button
                        key={tag.id}
                        onPointerDown={() => attachTag(tag.name)}
                        className="text-xs bg-gray-100 dark:bg-white/8 text-gray-700 dark:text-white/60 px-3 py-1 rounded-full active:bg-gray-200 dark:active:bg-white/15"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                popularTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {popularTags.map((tag) => (
                      <button
                        key={tag.id}
                        onPointerDown={() => attachTag(tag.name)}
                        className="text-xs bg-gray-100 dark:bg-white/8 text-gray-700 dark:text-white/60 px-3 py-1 rounded-full active:bg-gray-200 dark:active:bg-white/15"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )
              )}
              {/* Yeni etiket */}
              {tagInput.trim() && (
                <button
                  onPointerDown={() => attachTag(tagInput)}
                  className="text-xs bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full active:bg-blue-100 dark:active:bg-blue-500/25"
                >
                  + Yeni oluştur: {tagInput}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}