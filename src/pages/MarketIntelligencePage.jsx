import { useState } from 'react'
import {
  Search,
  MapPin,
  TrendingUp,
  ExternalLink,
  Navigation,
  Sparkles,
  Loader2,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react'
import { fetchMandiPriceIntelligence, fetchGroundedSuppliers } from '../lib/intelligence'
import { db, handleFirestoreError, OperationType } from '../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/api'

const COMMODITY_PRESETS = [
  'Fortune Sunlite Sunflower Oil 15L Commercial Tin',
  'Daawat Rozana Super Basmati Rice 25kg',
  'Aashirvaad Shudh Chakki Atta 50kg',
  'Madhur Pure Crystal Sugar 50kg',
  'Tata Sampann High Protein Toor Dal 25kg',
]

const REGION_PRESETS = [
  'Vasai-Virar FMCG Cluster, Maharashtra',
  'Vashi APMC Agricultural Wholesale Market, Navi Mumbai',
  'Bhiwandi Warehousing & Distribution Hub, Thane',
  'Crawford Market & South Mumbai Wholesale Traders',
]

export default function MarketIntelligencePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('search') // 'search' | 'maps'

  // Search Grounding State
  const [commodity, setCommodity] = useState(COMMODITY_PRESETS[0])
  const [searchRegion, setSearchRegion] = useState(REGION_PRESETS[0])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState(null)
  const [searchSaved, setSearchSaved] = useState(false)

  // Maps Grounding State
  const [supplierQuery, setSupplierQuery] = useState('Wholesale edible oil depots and grain stockists')
  const [mapsRegion, setMapsRegion] = useState(REGION_PRESETS[0])
  const [userCoords, setUserCoords] = useState(null)
  const [locating, setLocating] = useState(false)
  const [mapsLoading, setMapsLoading] = useState(false)
  const [mapsResult, setMapsResult] = useState(null)
  const [mapsError, setMapsError] = useState(null)
  const [mapsSaved, setMapsSaved] = useState(false)

  // Handle Search Grounding Submit
  async function handleSearch(e) {
    if (e) e.preventDefault()
    setSearchLoading(true)
    setSearchError(null)
    setSearchSaved(false)
    try {
      const data = await fetchMandiPriceIntelligence(commodity, searchRegion)
      setSearchResult(data)

      // Optionally persist to Firestore
      try {
        const searchDocId = `srch_${Date.now()}`
        await setDoc(doc(db, 'market_searches', searchDocId), {
          id: searchDocId,
          commodity: data.commodity,
          marketSummary: data.summary.slice(0, 8000),
          sourcesCount: data.citations?.length || 0,
          citations: data.citations || [],
          queriedAt: data.queriedAt || new Date().toISOString(),
        })
        setSearchSaved(true)
      } catch (fsErr) {
        console.warn('Firestore cache notice:', fsErr)
      }
    } catch (err) {
      setSearchError(extractErrorMessage(err, 'Failed to fetch search grounded mandi rates'))
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle Geolocation
  function handleGetLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
        setLocating(false)
      },
      (err) => {
        console.warn('Location error:', err)
        setLocating(false)
        // Fallback default Vasai-Virar coords
        setUserCoords({ latitude: 19.3919, longitude: 72.8397 })
      },
      { timeout: 8000 }
    )
  }

  // Handle Maps Grounding Submit
  async function handleMaps(e) {
    if (e) e.preventDefault()
    setMapsLoading(true)
    setMapsError(null)
    setMapsSaved(false)
    try {
      const data = await fetchGroundedSuppliers(
        supplierQuery,
        userCoords?.latitude,
        userCoords?.longitude,
        mapsRegion
      )
      setMapsResult(data)

      // Persist place findings to Firestore
      if (data.placeSources?.length > 0) {
        try {
          const locDocId = `loc_${Date.now()}`
          await setDoc(doc(db, 'supplier_locations', locDocId), {
            id: locDocId,
            title: data.placeSources[0].title || data.query,
            mapsUri: data.placeSources[0].uri || 'https://maps.google.com',
            category: 'Wholesale Depot / Mandi',
            region: data.region || mapsRegion,
            queriedAt: new Date().toISOString(),
          })
          setMapsSaved(true)
        } catch (fsErr) {
          console.warn('Firestore map cache notice:', fsErr)
        }
      }
    } catch (err) {
      setMapsError(extractErrorMessage(err, 'Failed to fetch grounded supplier hubs'))
    } finally {
      setMapsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini 3.5 Flash Grounded
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database className="w-3 h-3" />
              Firestore Sync
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
            Wholesale Market & Supplier Intelligence
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time APMC mandi commodity price benchmarks and local supplier hub verification for regional cluster buyers.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-alt p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'search'
                ? 'bg-primary text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Mandi Price Intelligence (Search)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('maps')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'maps'
                ? 'bg-primary text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            Supplier & Mandi Finder (Maps)
          </button>
        </div>
      </div>

      {/* Tab 1: Google Search Grounding */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Live Wholesale Mandi Price Benchmarking
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Grounds wholesale spot prices, mill arrivals, and retail pricing trends directly from Google Search via Gemini 3.5 Flash.
            </p>

            {/* Quick Commodity Chips */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Quick Select Commodity:
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMODITY_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCommodity(p)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      commodity === p
                        ? 'bg-primary/20 border-primary text-primary-light font-medium'
                        : 'bg-surface-alt border-border text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Commodity & Packaging
                  </label>
                  <input
                    type="text"
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    placeholder="e.g. Fortune Sunflower Oil 15L Commercial Tin"
                    className="w-full px-3 py-2 text-sm bg-surface-alt border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Target Mandi / Region
                  </label>
                  <input
                    type="text"
                    value={searchRegion}
                    onChange={(e) => setSearchRegion(e.target.value)}
                    placeholder="e.g. Maharashtra, India (APMC Mumbai / Vashi / Vasai)"
                    className="w-full px-3 py-2 text-sm bg-surface-alt border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Powered by Google Search Grounding
                </span>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-sm transition-colors disabled:opacity-60"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Grounding Real-Time Market Data...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Fetch Mandi Benchmark
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Search Error */}
          {searchError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Market Query Error</p>
                <p className="mt-0.5 text-text-muted">{searchError}</p>
              </div>
            </div>
          )}

          {/* Search Result */}
          {searchResult && (
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {searchResult.commodity}
                  </h3>
                  <p className="text-xs text-text-muted">
                    Region: {searchResult.region} • Queried at: {new Date(searchResult.queriedAt).toLocaleTimeString()}
                  </p>
                </div>
                {searchSaved && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Persisted in Firestore
                  </span>
                )}
              </div>

              {/* Summary Body */}
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-text-primary whitespace-pre-line bg-surface-alt/50 p-4 rounded-lg border border-border/50">
                {searchResult.summary}
              </div>

              {/* Citations Grounding Sources */}
              {searchResult.citations && searchResult.citations.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    Grounded Web Sources & Mandi Bulletins ({searchResult.citations.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResult.citations.map((c, idx) => (
                      <a
                        key={idx}
                        href={c.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 bg-surface-alt hover:bg-surface-hover border border-border rounded-md text-xs text-text-primary transition-colors group"
                      >
                        <span className="truncate pr-2 group-hover:text-primary transition-colors font-medium">
                          {c.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-text-muted group-hover:text-primary shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Google Maps Grounding */}
      {activeTab === 'maps' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              Discover Nearby Wholesale FMCG Distributors & Mandis
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Grounds real physical supplier depots, grain mills, and wholesale APMC yards via Google Maps on Gemini 3.5 Flash.
            </p>

            <form onSubmit={handleMaps} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Supplier Category / Keyword
                  </label>
                  <input
                    type="text"
                    value={supplierQuery}
                    onChange={(e) => setSupplierQuery(e.target.value)}
                    placeholder="e.g. Wholesale edible oil depots, rice mills, FMCG distributors"
                    className="w-full px-3 py-2 text-sm bg-surface-alt border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Locality / Commercial Zone
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mapsRegion}
                      onChange={(e) => setMapsRegion(e.target.value)}
                      placeholder="e.g. Vasai-Virar, Thane / Mumbai, Maharashtra"
                      className="w-full px-3 py-2 text-sm bg-surface-alt border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locating}
                      title="Use My GPS Coordinates"
                      className="px-3 py-2 bg-surface-alt hover:bg-surface-hover border border-border rounded-md text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Navigation className={`w-3.5 h-3.5 text-sky-400 ${locating ? 'animate-spin' : ''}`} />
                      GPS
                    </button>
                  </div>
                  {userCoords && (
                    <span className="text-[11px] text-emerald-400 mt-1 block">
                      📍 Lat: {userCoords.latitude.toFixed(4)}, Lng: {userCoords.longitude.toFixed(4)} attached
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Region Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {REGION_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMapsRegion(r)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      mapsRegion === r
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-medium'
                        : 'bg-surface-alt border-border text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  Powered by Google Maps Grounding
                </span>
                <button
                  type="submit"
                  disabled={mapsLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-sm transition-colors disabled:opacity-60"
                >
                  {mapsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Locating Supplier Hubs...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      Search Nearby Mandis & Mills
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Maps Error */}
          {mapsError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Maps Query Error</p>
                <p className="mt-0.5 text-text-muted">{mapsError}</p>
              </div>
            </div>
          )}

          {/* Maps Result */}
          {mapsResult && (
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Verified Wholesale Suppliers & Mandis
                  </h3>
                  <p className="text-xs text-text-muted">
                    Query: "{mapsResult.query}" in {mapsResult.region}
                  </p>
                </div>
                {mapsSaved && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Persisted in Firestore
                  </span>
                )}
              </div>

              {/* Supplier Details Text */}
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-text-primary whitespace-pre-line bg-surface-alt/50 p-4 rounded-lg border border-border/50">
                {mapsResult.details}
              </div>

              {/* Grounded Google Maps Links */}
              {mapsResult.placeSources && mapsResult.placeSources.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    Verified Google Maps Locations ({mapsResult.placeSources.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {mapsResult.placeSources.map((loc, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-surface-alt border border-border rounded-lg flex flex-col justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-text-primary mb-1">
                            {loc.title}
                          </p>
                          <span className="text-[11px] text-text-muted">
                            Verified Wholesale Point
                          </span>
                        </div>
                        {loc.uri && (
                          <a
                            href={loc.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                          >
                            Open in Google Maps
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
