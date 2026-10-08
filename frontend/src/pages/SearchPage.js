import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { routeAPI } from '../services/api';
import {
  Filter, Bus, Star, Wifi, ChevronRight, AlertCircle,
  Search, MapPin, Calendar, Clock, ArrowRight, Sliders,
  Sparkles, TrendingDown, Users, Shield, Snowflake,
  Battery, CheckCircle2, RotateCcw, Sunrise, Moon,
  ArrowUpDown, Navigation, Sun, Sunset, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const cities = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Vellore', 'Pondicherry', 'Tirunelveli'];

const typeColors = {
  AC: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  'Non-AC': { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  Sleeper: { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  Volvo: { color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  Luxury: { color: '#eab308', bg: '#fefce8', border: '#fef08a' },
  'Semi-Sleeper': { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
};

const getTimeOfDay = (timeStr) => {
  if (!timeStr) return 'morning';
  const hour = parseInt(String(timeStr).split(':')[0], 10) || 0;
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const timeOfDayConfig = {
  morning: { icon: Sunrise, color: '#f59e0b' },
  afternoon: { icon: Sun, color: '#ea580c' },
  evening: { icon: Sunset, color: '#dc2626' },
  night: { icon: Moon, color: '#6366f1' },
};

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ busType: '', maxPrice: '2000', sortBy: 'price' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [sf, setSf] = useState({
    from: params.get('from') || '',
    to: params.get('to') || '',
    date: params.get('date') || new Date().toISOString().split('T')[0],
  });

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch on params change
  useEffect(() => {
    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const fetchRoutes = async () => {
    const from = params.get('from');
    const to = params.get('to');

    if (!from || !to) {
      setLoading(false);
      setRoutes([]);
      setError('Please select From and To cities to search buses.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await routeAPI.search({
        from, to,
        date: params.get('date'),
        busType: filters.busType,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
      });
      setRoutes(data.routes || []);
    } catch (err) {
      console.error('routeAPI.search failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch buses. Please try again.');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!sf.from || !sf.to) { toast.error('Select both cities'); return; }
    if (sf.from === sf.to) { toast.error('From and To must be different'); return; }
    navigate(`/search?from=${sf.from}&to=${sf.to}&date=${sf.date}`);
  };

  const swapCities = () => setSf({ ...sf, from: sf.to, to: sf.from });

  const resetFilters = () => {
    setFilters({ busType: '', maxPrice: '2000', sortBy: 'price' });
    toast.success('Filters reset');
  };

  const hasActiveFilters =
    filters.busType !== '' || filters.maxPrice !== '2000' || filters.sortBy !== 'price';

  // Filters sidebar component (reused for mobile + desktop)
  const FiltersPanel = () => (
    <div style={S.filterCard}>
      <div style={S.filterHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={S.filterIcon}>
            <Filter size={14} color="#f97316" strokeWidth={2.5} />
          </div>
          <div>
            <div style={S.filterTitle}>Filters</div>
            <div style={S.filterSub}>{routes.length} buses available</div>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            style={S.resetBtn}
            title="Reset all filters"
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {/* Bus Type */}
      <div style={S.filterSection}>
        <div style={S.filterLabel}>BUS TYPE</div>
        <div style={S.typeGrid}>
          {['AC', 'Non-AC', 'Sleeper', 'Volvo', 'Luxury', 'Semi-Sleeper'].map((type) => {
            const active = filters.busType === type;
            const tc = typeColors[type] || typeColors['Non-AC'];
            return (
              <button
                key={type}
                onClick={() => setFilters({ ...filters, busType: active ? '' : type })}
                style={{
                  ...S.typeChip,
                  background: active ? tc.bg : '#fff',
                  borderColor: active ? tc.border : '#e2e8f0',
                  color: active ? tc.color : '#475569',
                  fontWeight: active ? 800 : 600,
                  boxShadow: active ? `0 0 0 3px ${tc.bg}` : 'none',
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div style={S.filterSection}>
        <div style={S.filterRow}>
          <div style={S.filterLabel}>MAX PRICE</div>
          <div style={S.priceDisplay}>₹{filters.maxPrice}</div>
        </div>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          style={S.range}
        />
        <div style={S.rangeLabels}>
          <span>₹200</span>
          <span>₹2000</span>
        </div>
      </div>

      {/* Sort */}
      <div style={S.filterSection}>
        <div style={S.filterLabel}>SORT BY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { v: 'price', l: 'Lowest Price', icon: TrendingDown },
            { v: 'rating', l: 'Highest Rated', icon: Star },
            { v: 'duration', l: 'Fastest', icon: Zap },
          ].map(({ v, l, icon: Icon }) => {
            const active = filters.sortBy === v;
            return (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, sortBy: v })}
                style={{
                  ...S.sortBtn,
                  background: active ? '#fff7ed' : '#fff',
                  borderColor: active ? '#fed7aa' : '#e2e8f0',
                  color: active ? '#ea580c' : '#475569',
                  fontWeight: active ? 800 : 600,
                }}
              >
                <Icon size={13} />
                {l}
                {active && <CheckCircle2 size={13} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => {
          fetchRoutes();
          if (isMobile) setShowMobileFilters(false);
        }}
        style={S.applyBtn}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <Sparkles size={14} />
        Apply Filters
      </button>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />
      <div style={S.dotGrid} />

      {/* ============ SEARCH BAR ============ */}
      <div style={S.searchBarWrap}>
        <div style={S.searchBarInner}>
          <form onSubmit={handleSearch} style={S.searchForm}>
            <div style={S.searchField}>
              <div style={S.searchFieldLabel}>
                <MapPin size={11} color="#f97316" />
                FROM
              </div>
              <select
                value={sf.from}
                onChange={(e) => setSf({ ...sf, from: e.target.value })}
                style={S.searchSelect}
              >
                <option value="">Select city</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              type="button"
              onClick={swapCities}
              style={S.swapBtn}
              title="Swap cities"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(180deg) scale(1.05)';
                e.currentTarget.style.background = '#f97316';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#f97316';
              }}
            >
              <ArrowUpDown size={15} />
            </button>

            <div style={S.searchField}>
              <div style={S.searchFieldLabel}>
                <Navigation size={11} color="#f97316" />
                TO
              </div>
              <select
                value={sf.to}
                onChange={(e) => setSf({ ...sf, to: e.target.value })}
                style={S.searchSelect}
              >
                <option value="">Select city</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={S.searchField}>
              <div style={S.searchFieldLabel}>
                <Calendar size={11} color="#f97316" />
                DATE
              </div>
              <input
                type="date"
                value={sf.date}
                onChange={(e) => setSf({ ...sf, date: e.target.value })}
                style={S.searchSelect}
              />
            </div>

            <button
              type="submit"
              style={S.searchBtn}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(249,115,22,0.65)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(249,115,22,0.5)'; }}
            >
              <Search size={15} />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ============ MAIN LAYOUT ============ */}
      <div style={{
        ...S.container,
        gridTemplateColumns: isMobile ? '1fr' : '260px 1fr',
      }}>
        {/* Mobile filter toggle */}
        {isMobile && (
          <button
            style={S.mobileFilterToggle}
            onClick={() => setShowMobileFilters((v) => !v)}
          >
            <Sliders size={15} />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && <span style={S.filterDot} />}
          </button>
        )}

        {/* Filters - Desktop (always) or Mobile (when toggled) */}
        {(!isMobile || showMobileFilters) && (
          <aside style={isMobile ? { ...S.sidebar, position: 'static', top: 'auto' } : S.sidebar}>
            <FiltersPanel />
          </aside>
        )}

        {/* Results */}
        <main style={S.results}>
          {/* Header */}
          <div style={S.resultsHeader}>
            <div>
              <h2 style={S.resultsTitle}>
                {params.get('from') || 'From'}
                <ArrowRight size={18} style={{ margin: '0 8px', color: '#f97316' }} />
                {params.get('to') || 'To'}
              </h2>
              <div style={S.resultsSub}>
                {new Date(params.get('date') || Date.now()).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
                {' • '}
                <span style={{ color: '#f97316', fontWeight: 700 }}>{routes.length} buses</span>
              </div>
            </div>

            {routes.length > 0 && !isMobile && (
              <div style={S.quickStats}>
                <div>
                  <div style={S.quickStatLabel}>CHEAPEST</div>
                  <div style={S.quickStatValue}>
                    ₹{Math.min(...routes.map((r) => r.basePrice || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={S.quickStatDivider} />
                <div>
                  <div style={S.quickStatLabel}>FASTEST</div>
                  <div style={S.quickStatValue}>
                    {routes.reduce(
                      (a, b) => (parseInt(a.duration) < parseInt(b.duration) ? a : b),
                      routes[0]
                    )?.duration || '—'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={S.errorBanner}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={S.skeleton}>
                  <div style={{ ...S.skelLine, width: '40%' }} />
                  <div style={{ ...S.skelLine, width: '80%', height: '24px' }} />
                  <div style={{ ...S.skelLine, width: '60%' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && routes.length === 0 && !error && (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <div style={S.emptyIconGlow} />
                <div style={S.emptyIcon}>
                  <Bus size={40} color="#f97316" strokeWidth={1.5} />
                </div>
              </div>
              <h3 style={S.emptyTitle}>No Buses Found</h3>
              <p style={S.emptySub}>
                Try different cities, dates, or clear filters to see more options.
              </p>
              {hasActiveFilters && (
                <button onClick={resetFilters} style={S.primaryBtn}>
                  <RotateCcw size={14} /> Reset Filters
                </button>
              )}
            </div>
          )}

          {/* Routes */}
          {!loading && routes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {routes.map((route) => {
                const tc = typeColors[route.bus?.busType] || typeColors['Non-AC'];
                const tod = getTimeOfDay(route.departureTime);
                const TodIcon = timeOfDayConfig[tod].icon;

                return (
                  <div
                    key={route._id}
                    style={S.routeCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow =
                        '0 20px 40px -12px rgba(15,23,42,0.15), 0 4px 12px rgba(15,23,42,0.06)';
                      e.currentTarget.style.borderColor = '#fed7aa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.06)';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                    }}
                  >
                    <div style={{
                      ...S.routeAccent,
                      background: `linear-gradient(90deg, ${tc.color}, ${tc.color}00)`,
                    }} />

                    <div style={{
                      ...S.routeBody,
                      flexDirection: isMobile ? 'column' : 'row',
                    }}>
                      {/* LEFT */}
                      <div style={S.routeLeft}>
                        <div style={S.routeTopRow}>
                          <div style={S.routeNameRow}>
                            <div style={{
                              ...S.busAvatar,
                              background: tc.bg,
                              color: tc.color,
                              borderColor: tc.border,
                            }}>
                              <Bus size={18} strokeWidth={2.4} />
                            </div>
                            <div>
                              <h3 style={S.routeName}>
                                {route.bus?.busName || 'Bus Service'}
                              </h3>
                              <div style={S.routeBusNum}>
                                {route.bus?.busNumber || 'TN-XX-XX-0000'}
                              </div>
                            </div>
                          </div>

                          <div style={S.routeChips}>
                            <span style={{
                              ...S.typeBadge,
                              background: tc.bg,
                              color: tc.color,
                              borderColor: tc.border,
                            }}>
                              {route.bus?.busType || 'Non-AC'}
                            </span>

                            {route.bus?.rating > 0 && (
                              <span style={S.ratingBadge}>
                                <Star size={11} fill="#fbbf24" color="#fbbf24" />
                                {route.bus.rating.toFixed(1)}
                                {route.bus?.totalReviews > 0 && (
                                  <span style={S.ratingCount}>
                                    ({route.bus.totalReviews})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Journey */}
                        <div style={S.journeyRow}>
                          <div style={S.journeyPoint}>
                            <div style={S.journeyTimeRow}>
                              <TodIcon size={13} color={timeOfDayConfig[tod].color} />
                              <span style={S.journeyTime}>
                                {route.departureTime || '--:--'}
                              </span>
                            </div>
                            <div style={S.journeyCity}>{route.from}</div>
                            <div style={S.journeyLabel}>Departure</div>
                          </div>

                          <div style={S.journeyMiddle}>
                            <div style={S.journeyDuration}>
                              <Clock size={11} />
                              {route.duration || '—'}
                            </div>
                            <div style={S.journeyTrack}>
                              <div style={S.journeyDot} />
                              <div style={S.journeyLine} />
                              <div style={{
                                ...S.journeyDot,
                                background: '#f97316',
                                boxShadow: '0 0 0 3px rgba(249,115,22,0.15)',
                              }} />
                            </div>
                            {route.stops?.length > 0 && (
                              <div style={S.journeyStops}>
                                {route.stops.length} stop{route.stops.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>

                          <div style={{ ...S.journeyPoint, textAlign: 'right' }}>
                            <div style={{ ...S.journeyTimeRow, justifyContent: 'flex-end' }}>
                              <span style={S.journeyTime}>
                                {route.arrivalTime || '--:--'}
                              </span>
                            </div>
                            <div style={S.journeyCity}>{route.to}</div>
                            <div style={S.journeyLabel}>Arrival</div>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div style={S.amenitiesRow}>
                          {route.bus?.features?.wifi && (
                            <span style={S.amenity}>
                              <Wifi size={12} color="#3b82f6" /> WiFi
                            </span>
                          )}
                          {(route.bus?.features?.ac ||
                            route.bus?.busType === 'AC' ||
                            route.bus?.busType === 'Volvo') && (
                            <span style={S.amenity}>
                              <Snowflake size={12} color="#22c55e" /> AC
                            </span>
                          )}
                          {route.bus?.features?.charging && (
                            <span style={S.amenity}>
                              <Battery size={12} color="#fbbf24" /> Charging
                            </span>
                          )}
                          {route.bus?.totalSeats && (
                            <span style={{ ...S.amenity, color: '#10b981', fontWeight: 700 }}>
                              <Users size={12} /> {route.bus.totalSeats} seats
                            </span>
                          )}
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div style={{
                        ...S.routeRight,
                        alignItems: isMobile ? 'flex-start' : 'flex-end',
                        width: isMobile ? '100%' : 'auto',
                        borderTop: isMobile ? '1px solid #f1f5f9' : 'none',
                        paddingTop: isMobile ? '16px' : 0,
                      }}>
                        <div style={{ ...S.priceBlock, textAlign: isMobile ? 'left' : 'right' }}>
                          <div style={S.priceFromLabel}>Starting from</div>
                          <div style={{
                            ...S.priceValue,
                            justifyContent: isMobile ? 'flex-start' : 'flex-end',
                          }}>
                            <span style={S.priceCurrency}>₹</span>
                            <span style={S.priceNum}>
                              {(route.basePrice || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div style={S.pricePer}>per person</div>
                        </div>

                        <button
                          onClick={() => navigate(`/booking/${route._id}?date=${params.get('date')}`)}
                          style={S.bookBtn}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(249,115,22,0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(249,115,22,0.5)';
                          }}
                        >
                          Book Now
                          <ChevronRight size={15} strokeWidth={2.6} />
                        </button>

                        <div style={S.instantBadge}>
                          <Shield size={11} /> Instant Confirmation
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        html, body { overflow-x: hidden; }
      `}</style>
    </div>
  );
}

/* ==================== STYLES ==================== */
const S = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    position: 'relative',
    paddingTop: '80px',
    paddingBottom: '60px',
    fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    color: '#0f172a',
  },
  blob1: {
    position: 'absolute', top: '-200px', left: '-200px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  blob2: {
    position: 'absolute', bottom: '-200px', right: '-200px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  dotGrid: {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.05) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    maskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)',
    WebkitMaskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)',
  },

  /* ===== SEARCH BAR ===== */
  searchBarWrap: {
    position: 'sticky',
    top: '80px',
    zIndex: 40,
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid #f1f5f9',
  },
  searchBarInner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  searchForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    background: '#fff',
    border: '1px solid #f1f5f9',
    borderRadius: '16px',
    padding: '8px',
    boxShadow: '0 8px 32px -8px rgba(15,23,42,0.08)',
  },
  searchField: {
    flex: '1 1 130px',
    minWidth: '120px',
    padding: '8px 12px',
  },
  searchFieldLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '9px',
    fontWeight: 800,
    color: '#94a3b8',
    letterSpacing: '1.2px',
    marginBottom: '4px',
  },
  searchSelect: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: 0,
  },
  swapBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #fed7aa',
    background: '#fff',
    color: '#f97316',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    alignSelf: 'center',
    marginBottom: '4px',
    flexShrink: 0,
  },
  searchBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 22px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 8px 20px -6px rgba(249,115,22,0.5)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    flexShrink: 0,
    marginBottom: '4px',
  },

  /* ===== LAYOUT ===== */
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '28px 24px',
    display: 'grid',
    gap: '24px',
    position: 'relative',
    zIndex: 2,
    alignItems: 'start',
  },
  mobileFilterToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '12px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0f172a',
    cursor: 'pointer',
    fontFamily: 'inherit',
    position: 'relative',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
  },
  filterDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#f97316',
    boxShadow: '0 0 8px #f97316',
    position: 'absolute',
    top: '8px',
    right: '8px',
  },

  /* ===== SIDEBAR ===== */
  sidebar: {
    position: 'sticky',
    top: '190px',
    height: 'fit-content',
    alignSelf: 'start',
  },
  filterCard: {
    background: '#fff',
    border: '1px solid #f1f5f9',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  filterIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  filterTitle: {
    fontSize: '14px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  filterSub: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 500,
    marginTop: '1px',
  },
  resetBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#ef4444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  filterSection: {
    marginBottom: '20px',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  filterLabel: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#94a3b8',
    letterSpacing: '1.2px',
    marginBottom: '10px',
  },

  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
  },
  typeChip: {
    padding: '9px 10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.25s',
    background: '#fff',
    color: '#475569',
    textAlign: 'center',
  },

  priceDisplay: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#f97316',
    fontFamily: 'ui-monospace, monospace',
  },
  range: {
    width: '100%',
    accentColor: '#f97316',
    cursor: 'pointer',
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 600,
    marginTop: '4px',
  },

  sortBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.25s',
    textAlign: 'left',
  },
  applyBtn: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 8px 20px -6px rgba(249,115,22,0.5)',
    marginTop: '6px',
    transition: 'transform 0.2s',
  },

  /* ===== RESULTS ===== */
  results: {
    minWidth: 0,
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '20px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  resultsTitle: {
    fontSize: '22px',
    fontWeight: 800,
    margin: 0,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resultsSub: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '6px',
    fontWeight: 500,
  },
  quickStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 16px',
    background: '#fff',
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
  },
  quickStatLabel: {
    fontSize: '9px',
    color: '#94a3b8',
    fontWeight: 800,
    letterSpacing: '1px',
    marginBottom: '3px',
  },
  quickStatValue: {
    fontSize: '14px',
    fontWeight: 800,
    color: '#0f172a',
  },
  quickStatDivider: {
    width: '1px',
    height: '28px',
    background: '#f1f5f9',
  },

  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '14px',
    color: '#ea580c',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '18px',
  },

  skeleton: {
    padding: '24px',
    background: '#fff',
    borderRadius: '18px',
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  skelLine: {
    height: '14px',
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },

  empty: {
    textAlign: 'center',
    padding: '60px 24px',
    background: '#fff',
    border: '1px dashed #e2e8f0',
    borderRadius: '20px',
  },
  emptyIconWrap: {
    position: 'relative',
    width: '100px',
    height: '100px',
    margin: '0 auto 20px',
  },
  emptyIconGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.2), transparent 70%)',
    filter: 'blur(20px)',
  },
  emptyIcon: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 800,
    margin: '0 0 8px',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  emptySub: {
    color: '#64748b',
    fontSize: '14px',
    margin: '0 0 22px',
    maxWidth: '380px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6,
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 20px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 8px 20px -6px rgba(249,115,22,0.5)',
  },

  /* ===== ROUTE CARD ===== */
  routeCard: {
    position: 'relative',
    background: '#fff',
    border: '1px solid #f1f5f9',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
  },
  routeAccent: {
    height: '3px',
    width: '100%',
  },
  routeBody: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    padding: '22px 24px',
    flexWrap: 'wrap',
  },
  routeLeft: {
    flex: 1,
    minWidth: '280px',
  },
  routeRight: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '12px',
    minWidth: '180px',
  },

  routeTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  routeNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  busAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
    flexShrink: 0,
  },
  routeName: {
    fontSize: '16px',
    fontWeight: 800,
    margin: 0,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  routeBusNum: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 600,
    fontFamily: 'ui-monospace, monospace',
    marginTop: '2px',
  },
  routeChips: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.5px',
    border: '1px solid',
  },
  ratingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    borderRadius: '20px',
    background: '#fefce8',
    border: '1px solid #fef08a',
    fontSize: '11px',
    fontWeight: 800,
    color: '#a16207',
  },
  ratingCount: {
    color: '#ca8a04',
    fontWeight: 600,
    fontSize: '10px',
  },

  journeyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  journeyPoint: {
    flexShrink: 0,
    minWidth: '80px',
  },
  journeyTimeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  journeyTime: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  journeyCity: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: 700,
    marginTop: '4px',
  },
  journeyLabel: {
    fontSize: '9px',
    color: '#94a3b8',
    fontWeight: 600,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  journeyMiddle: {
    flex: 1,
    minWidth: '70px',
    position: 'relative',
    paddingTop: '22px',
  },
  journeyDuration: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: 800,
    color: '#475569',
    whiteSpace: 'nowrap',
  },
  journeyTrack: {
    display: 'flex',
    alignItems: 'center',
  },
  journeyDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    flexShrink: 0,
    boxShadow: '0 0 0 3px rgba(16,185,129,0.15)',
  },
  journeyLine: {
    flex: 1,
    height: '1px',
    background: 'repeating-linear-gradient(to right, #cbd5e1 0, #cbd5e1 4px, transparent 4px, transparent 8px)',
  },
  journeyStops: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 600,
    textAlign: 'center',
    marginTop: '4px',
  },

  amenitiesRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  amenity: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 600,
    padding: '4px 10px',
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
    borderRadius: '20px',
  },

  priceBlock: {
    textAlign: 'right',
  },
  priceFromLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 700,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  priceValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
    justifyContent: 'flex-end',
    lineHeight: 1,
  },
  priceCurrency: {
    fontSize: '18px',
    color: '#f97316',
    fontWeight: 700,
  },
  priceNum: {
    fontSize: '30px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.04em',
  },
  pricePer: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 600,
    marginTop: '4px',
  },
  bookBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '11px 20px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 16px -4px rgba(249,115,22,0.5)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    whiteSpace: 'nowrap',
  },
  instantBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#10b981',
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
};