import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Car, Flag, AlertCircle, ArrowLeft } from 'lucide-react';
import { getHazardById } from '../services/hazardService';
import { Badge } from '../components/Badges';
import { ago } from '../utils/formatters';
import MapView from '../components/MapView';

export default function HazardDetails() {
  const { id } = useParams();
  const [h, setH] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getHazardById(id)
      .then((x) => {
        setH(x.data);
      })
      .catch((err) => {
        console.error('Error fetching hazard details:', err);
        setError('Hazard report not found or server is unavailable.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="page grid place-items-center bg-surface p-4">
        <div className="text-slate-600 text-sm font-semibold flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          Loading hazard report...
        </div>
      </main>
    );
  }

  if (error || !h) {
    return (
      <main className="page grid place-items-center bg-surface p-4">
        <div className="card max-w-md p-8 text-center shadow-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle size={24} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Report Not Found</h1>
          <p className="mt-2 text-sm text-slate-600">{error || 'Unable to display details for this hazard report.'}</p>
          <Link to="/explore" className="btn btn-primary mt-6 inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Explore
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page bg-surface">
      <div className="mx-auto grid max-w-5xl gap-6 p-4 py-8 lg:grid-cols-[1.25fr_.75fr]">
        <section className="card overflow-hidden shadow-sm">
          {h.imageUrl ? (
            <img className="h-72 w-full object-cover" src={h.imageUrl} alt={`${h.category} at ${h.address}`} />
          ) : (
            <div className="h-48 w-full bg-slate-100 grid place-items-center text-slate-400 font-bold">
              No Photo Available
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="mr-auto text-3xl font-black text-slate-900">{h.category}</h1>
              <Badge value={h.severity} kind="severity" />
              <Badge value={h.status} />
            </div>

            <p className="mt-4 flex gap-2 text-slate-700 font-medium">
              <MapPin size={19} className="text-brand shrink-0 mt-0.5" />
              {h.address}
            </p>

            <p className="mt-4 leading-7 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {h.description || 'No detailed description provided.'}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-y py-4 text-sm">
              <div>
                <b className="text-slate-900">Traffic impact</b>
                <p className="mt-1 flex items-center gap-1.5 text-slate-600">
                  <Car size={16} />
                  {h.trafficImpact === 'yes'
                    ? 'Traffic affected'
                    : h.trafficImpact === 'partial'
                    ? 'Partially affected'
                    : 'Not affected'}
                </p>
              </div>
              <div>
                <b className="text-slate-900">Reported</b>
                <p className="mt-1 text-slate-600">{ago(h.reportedAt)}</p>
              </div>
            </div>

            <h2 className="mt-6 text-lg font-bold text-slate-900">Activity timeline</h2>
            <ol className="mt-3 space-y-4 border-l-2 border-slate-200 pl-5 text-sm">
              <li>
                <b className="text-slate-900">Report submitted</b>
                <p className="text-slate-500">{new Date(h.reportedAt).toLocaleString()}</p>
              </li>
              <li>
                <b className="text-slate-900">{h.verificationStatus}</b>
                <p className="text-slate-500">Last updated {ago(h.updatedAt)}</p>
              </li>
            </ol>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Location Map</h2>
            <div className="mt-3 h-56 overflow-hidden rounded-xl border">
              <MapView hazards={[h]} center={[h.latitude, h.longitude]} />
            </div>
            <Link to="/explore" className="btn btn-secondary mt-3 w-full justify-center">
              View on main map
            </Link>
          </div>
          <button
            onClick={() => alert('Thank you. Incorrect information flag submitted for review.')}
            className="btn btn-secondary w-full justify-center text-xs"
          >
            <Flag size={16} />
            Report incorrect information
          </button>
        </aside>
      </div>
    </main>
  );
}