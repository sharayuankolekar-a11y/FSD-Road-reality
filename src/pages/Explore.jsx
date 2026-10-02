import { useEffect, useState } from 'react';
import { Filter, LocateFixed, Plus, Search, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView';
import HazardCard from '../components/HazardCard';
import { getHazards, getNearbyHazards } from '../services/hazardService';
import { useUserLocation } from '../hooks/useUserLocation';

export default function Explore() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualError, setManualError] = useState(null);

  const {
    location: userLocation,
    latitude,
    longitude,
    placeName,
    loading: locLoading,
    manualLoading,
    requestLocation,
    setManualLocation
  } = useUserLocation(true);

  const loadHazards = async (lat = null, lng = null) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let res;
      if (lat && lng) {
        res = await getNearbyHazards(lat, lng, 50);
      } else {
        res = await getHazards();
      }
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load hazards:', err);
      setErrorMessage('Road Reality server is unavailable. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      loadHazards(latitude, longitude);
    } else {
      loadHazards();
    }
  }, [latitude, longitude]);

  const handleLocateMe = () => {
    requestLocation();
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setManualError(null);
    try {
      await setManualLocation(manualInput);
      setShowLocationModal(false);
      setManualInput('');
    } catch (err) {
      setManualError(err.message || "We couldn't find that location. Please try another city or address.");
    }
  };

  const filteredItems = items.filter((x) => {
    const matchesFilter = filter === 'all' || x.status === filter || x.rawStatus?.toLowerCase() === filter;
    const matchesSearch = searchQuery === '' ||
      (x.category && x.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (x.address && x.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (x.description && x.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="page relative bg-surface">
      <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[360px_1fr]">
        {/* Left Sidebar */}
        <aside className="order-2 lg:order-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900">Explore hazards</h1>
            {placeName && (
              <span className="text-xs font-bold text-brand bg-cyan-50 border border-brand/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <MapPin size={12} /> {placeName}
              </span>
            )}
          </div>

          {/* Search & Location Bar */}
          <div className="mt-4 flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search hazards</span>
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                className="input pl-9 text-sm"
                placeholder="Search category or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>

            <button
              onClick={handleLocateMe}
              disabled={locLoading}
              className="btn btn-secondary flex items-center justify-center min-w-[44px]"
              title="Use GPS current location"
            >
              <LocateFixed size={18} className={locLoading ? 'animate-spin text-brand' : ''} />
            </button>
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              className="btn btn-secondary text-xs font-bold px-3"
              title="Set location manually"
            >
              Location
            </button>
          </div>

          {/* Manual Location Modal/Form */}
          {showLocationModal && (
            <div className="mt-3 card p-3 border-brand/30 bg-cyan-50/50">
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <input
                  className="input py-1.5 px-3 text-xs flex-1 bg-white"
                  placeholder="Enter city or area (e.g. Mangaluru)..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  {manualLoading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
                </button>
              </form>
              {manualError && <p className="mt-1 text-xs text-red-600 font-medium">{manualError}</p>}
            </div>
          )}

          {/* Status Filter */}
          <div className="mt-3 flex gap-2 items-center">
            <Filter size={17} className="text-slate-600 shrink-0" />
            <select
              className="input text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {/* Count Header */}
          <p className="mt-4 text-sm font-bold text-slate-600">
            {loading ? (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Loader2 size={14} className="animate-spin" /> Loading hazard reports...
              </span>
            ) : (
              `${filteredItems.length} hazard${filteredItems.length === 1 ? '' : 's'} near ${placeName || 'selected area'}`
            )}
          </p>

          {/* Hazard List */}
          <div className="mt-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200" />
              ))
            ) : filteredItems.length === 0 ? (
              <div className="card p-6 text-center text-slate-500 text-sm">
                No hazard reports found matching your search.
              </div>
            ) : (
              filteredItems.map((h) => <HazardCard key={h.id} hazard={h} />)
            )}
          </div>
        </aside>

        {/* Map View Area */}
        <section className="order-1 h-[55vh] overflow-hidden rounded-2xl border bg-white lg:order-2 lg:h-[calc(100vh-100px)] relative">
          <MapView hazards={filteredItems} userLocation={userLocation} />
        </section>
      </div>

      {/* Floating Report Hazard Button */}
      <Link
        to="/report"
        className="btn btn-primary fixed bottom-5 right-5 z-[900] shadow-lg flex items-center gap-2 px-5 py-3 rounded-full"
      >
        <Plus size={18} />
        Report hazard
      </Link>
    </main>
  );
}