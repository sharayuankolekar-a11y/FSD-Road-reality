import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../services/mockData';
import { createHazard } from '../services/hazardService';
import { useUserLocation } from '../hooks/useUserLocation';
import { useAuth } from '../context/AuthContext';
import { Navigation, AlertCircle, CheckCircle, Search, Loader2, ArrowLeft, Calendar, Clock } from 'lucide-react';

const steps = [
  'Category / Type',
  'Photo',
  'Date & Time',
  'Location',
  'Severity',
  'Traffic Impact',
  'Description (Optional)',
  'Review & Submit'
];

export default function ReportHazard() {
  const [s, setS] = useState(0);
  const { session } = useAuth();
  const {
    location,
    latitude: userLat,
    longitude: userLng,
    placeName: userPlaceName,
    loading: locLoading,
    manualLoading,
    requestLocation,
    setManualLocation
  } = useUserLocation(true);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);

  const [data, setData] = useState({
    category: '',
    imageUrl: '',
    date: todayStr,
    time: timeStr,
    latitude: null,
    longitude: null,
    address: '',
    severity: 'medium',
    trafficImpact: 'partial',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [manualQuery, setManualQuery] = useState('');
  const nav = useNavigate();

  // Update form data when location is detected or manually selected
  useEffect(() => {
    if (userLat && userLng) {
      setData((prev) => ({
        ...prev,
        latitude: userLat,
        longitude: userLng,
        address: userPlaceName || prev.address || `${userLat.toFixed(4)}°, ${userLng.toFixed(4)}°`
      }));
    }
  }, [userLat, userLng, userPlaceName]);

  const update = (k, v) => setData((prev) => ({ ...prev, [k]: v }));

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setFormError(null);
    try {
      const res = await setManualLocation(manualQuery);
      setData((prev) => ({
        ...prev,
        latitude: res.latitude,
        longitude: res.longitude,
        address: res.placeName
      }));
      setManualQuery('');
    } catch (err) {
      setFormError(err.message || "Could not find location. Please enter a valid city or address.");
    }
  };

  const next = () => {
    setFormError(null);

    // Step 0: Category / Report Type validation
    if (s === 0 && !data.category) {
      return setFormError('Category / Report Type is required. Please select a hazard type before continuing.');
    }

    // Step 1: Photo is optional (user can proceed)

    // Step 2: Date & Time validation
    if (s === 2) {
      if (!data.date) {
        return setFormError('Date is required. Please select the date when the hazard was observed.');
      }
      if (!data.time) {
        return setFormError('Time is required. Please select the time when the hazard was observed.');
      }
    }

    // Step 3: Location validation
    if (s === 3) {
      if (!data.latitude || !data.longitude || isNaN(Number(data.latitude)) || isNaN(Number(data.longitude)) || !data.address) {
        return setFormError('A valid location (GPS or manual search) is required to submit a report.');
      }
    }

    // Step 4: Severity validation
    if (s === 4 && !data.severity) {
      return setFormError('Severity level is required. Please select a severity option.');
    }

    // Step 5: Traffic Impact validation
    if (s === 5 && !data.trafficImpact) {
      return setFormError('Traffic impact selection is required.');
    }

    // Step 6: Description is explicitly OPTIONAL - no validation lock!

    setS(Math.min(7, s + 1));
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!data.category) {
      setS(0);
      return setFormError('Category / Report Type is required.');
    }
    if (!data.date || !data.time) {
      setS(2);
      return setFormError('Date and Time are required details.');
    }
    if (!data.latitude || !data.longitude || !data.address) {
      setS(3);
      return setFormError('Location is required. Please set location before submitting.');
    }

    setSubmitting(true);
    try {
      await createHazard(
        {
          category: data.category,
          date: data.date,
          time: data.time,
          description: data.description || '', // Description is optional
          latitude: data.latitude,
          longitude: data.longitude,
          severity: data.severity,
          trafficImpact: data.trafficImpact,
          imageUrl: data.imageUrl,
          address: data.address
        },
        session?.access_token
      );
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(err.message || 'Unable to submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="page grid place-items-center p-4 bg-surface">
        <div className="card max-w-lg p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl font-bold">
            <CheckCircle size={36} />
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Report submitted successfully.</h1>
          <p className="mt-3 text-slate-600">
            Your report at <b className="text-slate-800">{data.address}</b> has been received and added to the live road map.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <button className="btn btn-primary" onClick={() => nav('/my-reports')}>
              View my reports
            </button>
            <button className="btn btn-secondary" onClick={() => nav('/')}>
              Return to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page bg-surface">
      <div className="mx-auto max-w-3xl p-4 py-8">

        {/* Header with Back to Home Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => nav('/')}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <p className="text-xs font-extrabold tracking-wider text-brand uppercase">
            REPORT A HAZARD · STEP {s + 1} OF 8
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${((s + 1) / 8) * 100}%` }}
          />
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2 font-medium">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            {formError}
          </div>
        )}

        <div className="card mt-5 p-5 md:p-8 shadow-md">
          <h1 className="text-2xl font-black text-slate-900">{steps[s]}</h1>

          {/* STEP 0: Category / Type */}
          {s === 0 && (
            <>
              <p className="mt-1 text-slate-600">What did you notice on the road? <span className="text-red-500 font-bold">* Required</span></p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((c) => (
                  <button
                    type="button"
                    onClick={() => {
                      update('category', c);
                      setFormError(null);
                    }}
                    className={`rounded-xl border p-4 text-left font-bold transition ${
                      data.category === c
                        ? 'border-brand bg-cyan-50 text-brand shadow-sm ring-2 ring-brand/30'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                    key={c}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 1: Photo (Optional) */}
          {s === 1 && (
            <>
              <p className="mt-2 text-slate-600">Photos help verify hazards faster. <span className="text-slate-400 font-semibold">(Optional)</span></p>
              <input
                className="mt-5 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) update('imageUrl', URL.createObjectURL(f));
                }}
              />
              <p className="mt-3 text-xs text-slate-400">Or paste an image URL:</p>
              <input
                className="input mt-1 text-sm"
                placeholder="https://example.com/image.jpg"
                value={data.imageUrl}
                onChange={(e) => update('imageUrl', e.target.value)}
              />
              {data.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border">
                  <img className="h-48 w-full object-cover" src={data.imageUrl} alt="Hazard preview" />
                </div>
              )}
            </>
          )}

          {/* STEP 2: Date & Time (Required) */}
          {s === 2 && (
            <div className="mt-5 space-y-5">
              <p className="text-slate-600 text-sm">Specify when the hazard was observed. <span className="text-red-500 font-bold">* Required</span></p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar size={15} className="text-brand" /> Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input w-full text-sm font-semibold"
                    value={data.date}
                    onChange={(e) => {
                      update('date', e.target.value);
                      setFormError(null);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock size={15} className="text-brand" /> Time *
                  </label>
                  <input
                    type="time"
                    required
                    className="input w-full text-sm font-semibold"
                    value={data.time}
                    onChange={(e) => {
                      update('time', e.target.value);
                      setFormError(null);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location (Required) */}
          {s === 3 && (
            <div className="mt-5 space-y-4">
              <p className="text-slate-600 text-sm">Detect your GPS coordinates or enter place name manually. <span className="text-red-500 font-bold">* Required</span></p>

              {/* Detected Place Box */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hazard Location</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {locLoading ? (
                      'Finding location...'
                    ) : manualLoading ? (
                      'Resolving place name...'
                    ) : data.address ? (
                      data.address
                    ) : (
                      'No location selected'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locLoading}
                  className="btn btn-secondary text-xs flex items-center gap-1.5"
                >
                  <Navigation size={14} className={locLoading ? 'animate-spin' : ''} />
                  {locLoading ? 'Detecting...' : 'Use GPS'}
                </button>
              </div>

              {/* Manual Search Input */}
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <input
                  className="input py-2 px-3 text-sm flex-1"
                  placeholder="Or type city, street, or landmark..."
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="btn btn-secondary text-xs font-bold px-4 flex items-center gap-1"
                >
                  {manualLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Find
                </button>
              </form>

              {/* Custom Address Input */}
              <label className="block text-xs font-bold text-slate-700">
                Detailed Street Address / Landmark *
                <input
                  className="input mt-1 text-sm"
                  placeholder="e.g. Near Light House Hill Road"
                  value={data.address}
                  onChange={(e) => {
                    update('address', e.target.value);
                    setFormError(null);
                  }}
                />
              </label>
            </div>
          )}

          {/* STEP 4: Severity */}
          {s === 4 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {['low', 'medium', 'high', 'critical'].map((x) => (
                <button
                  type="button"
                  key={x}
                  onClick={() => {
                    update('severity', x);
                    setFormError(null);
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    data.severity === x ? 'border-brand bg-cyan-50 shadow-sm ring-2 ring-brand/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <b className="capitalize text-slate-900">{x}</b>
                  <p className="mt-1 text-sm text-slate-600">
                    {x === 'critical'
                      ? 'Immediate serious risk to all vehicles'
                      : x === 'high'
                      ? 'Dangerous for road users, swerving required'
                      : x === 'medium'
                      ? 'Needs attention soon, moderate slowdown'
                      : 'Minor concern'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* STEP 5: Traffic Impact */}
          {s === 5 && (
            <div className="mt-5 flex flex-col gap-3">
              {[
                ['yes', 'Yes, traffic is affected (lane blocked or heavy slowdown)'],
                ['partial', 'Partially affected (slight slowdown)'],
                ['no', 'No significant impact on traffic flow']
              ].map(([v, t]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => {
                    update('trafficImpact', v);
                    setFormError(null);
                  }}
                  className={`rounded-xl border p-4 text-left font-medium transition ${
                    data.trafficImpact === v ? 'border-brand bg-cyan-50 text-slate-900 ring-2 ring-brand/30' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* STEP 6: Description (EXPLICITLY OPTIONAL) */}
          {s === 6 && (
            <div className="mt-5">
              <label className="block text-sm font-bold text-slate-700">
                Provide additional details <span className="text-slate-400 font-semibold">(Optional)</span>
                <textarea
                  className="input mt-2 min-h-36"
                  value={data.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="e.g. Large pothole near the left lane. (Optional field, you may skip this)"
                />
              </label>
              <p className="mt-2 text-xs text-slate-500">
                You can leave this description field blank and continue to submit your report.
              </p>
            </div>
          )}

          {/* STEP 7: Review */}
          {s === 7 && (
            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-5 text-sm border">
              <p><b className="text-slate-900">Hazard Type:</b> {data.category || <span className="text-red-500">Missing</span>}</p>
              <p><b className="text-slate-900">Date & Time:</b> {data.date} at {data.time}</p>
              <p><b className="text-slate-900">Place Name / Location:</b> {data.address || <span className="text-red-500">Missing</span>}</p>
              <p><b className="text-slate-900">Severity:</b> <span className="capitalize font-bold text-brand">{data.severity}</span></p>
              <p><b className="text-slate-900">Traffic Affected:</b> {data.trafficImpact === 'yes' ? 'Yes' : data.trafficImpact === 'partial' ? 'Partially' : 'No'}</p>
              <p><b className="text-slate-900">Description:</b> {data.description ? data.description : <span className="text-slate-500 italic">None provided (Optional)</span>}</p>
            </div>
          )}

          {/* Buttons Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              disabled={!s}
              type="button"
              className="btn btn-secondary disabled:opacity-40"
              onClick={() => setS(s - 1)}
            >
              Previous step
            </button>

            {s < 7 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting report...' : 'Submit report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}