import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Building2,
  AlertTriangle,
  GitCompareArrows,
  Search,
  Filter,
  Layers,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import { Institution } from '../../types';

// Coordinates lookup map for Indian technical cities/states
const CITY_COORDINATES: Record<string, [number, number]> = {
  Delhi: [28.6139, 77.2090],
  'New Delhi': [28.6139, 77.2090],
  Mumbai: [19.0760, 72.8777],
  Pune: [18.5204, 73.8567],
  Bengaluru: [12.9716, 77.5946],
  Bangalore: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Hyderabad: [17.3850, 78.4867],
  Kolkata: [22.5726, 88.3639],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Noida: [28.5355, 77.3910],
  'Greater Noida': [28.4744, 77.5040],
  Gurugram: [28.4595, 77.0266],
  Chandigarh: [30.7333, 76.7794],
  Bhopal: [23.2599, 77.4126],
  Indore: [22.7196, 75.8577],
  Patna: [25.5941, 85.1376],
  Thiruvananthapuram: [8.5241, 76.9366],
  Kochi: [9.9312, 76.2673],
  Coimbatore: [11.0168, 76.9558],
  Nagpur: [21.1458, 79.0882],
  Visakhapatnam: [17.6868, 83.2185],
  Bhubaneswar: [20.2961, 85.8245],
  Guwahati: [26.1445, 91.7362],
  Dehradun: [30.3165, 78.0322],
  Ranchi: [23.3441, 85.3096],
  Surat: [21.1702, 72.8311],
  Varanasi: [25.3176, 82.9739],
  Kanpur: [26.4499, 80.3319],
};

const STATE_CENTROIDS: Record<string, [number, number]> = {
  'Uttar Pradesh': [26.8467, 80.9462],
  Maharashtra: [19.7515, 75.7139],
  Karnataka: [15.3173, 75.7139],
  'Tamil Nadu': [11.1271, 78.6569],
  Telangana: [18.1124, 79.0193],
  'Andhra Pradesh': [15.9129, 79.7400],
  Gujarat: [22.2587, 71.1924],
  Rajasthan: [27.0238, 74.2179],
  'Madhya Pradesh': [22.9734, 78.6569],
  'West Bengal': [22.9868, 87.8550],
  Delhi: [28.6139, 77.2090],
  Haryana: [29.0588, 76.0856],
  Punjab: [31.1471, 75.3412],
  Kerala: [10.8505, 76.2711],
  Odisha: [20.9517, 85.0985],
  Bihar: [25.0961, 85.3131],
  Uttarakhand: [30.0668, 79.0193],
  Jharkhand: [23.6102, 85.2799],
  Assam: [26.2006, 92.9376],
};

interface GisHotspotMapProps {
  onSelectInstitution?: (institution: Institution) => void;
  className?: string;
}

export const GisHotspotMap: React.FC<GisHotspotMapProps> = ({
  onSelectInstitution,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  // Filters
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch institutions with count and stats
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.get('/institutions');
        setInstitutions(res.data);
      } catch (err) {
        console.error('Failed to load institutions for GIS map:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on India
    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
    });

    // Clean, crisp government cartographic base tiles (CartoDB Positron / OSM)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Helper to determine coordinates for an institution
  const getCoordinates = (inst: Institution, index: number): [number, number] => {
    // Check city/district first
    if (inst.district && CITY_COORDINATES[inst.district]) {
      const [lat, lng] = CITY_COORDINATES[inst.district];
      // Jitter slightly so institutions in the same city don't completely overlap
      const jitterLat = (index % 5 - 2) * 0.04;
      const jitterLng = (Math.floor(index / 5) % 5 - 2) * 0.04;
      return [lat + jitterLat, lng + jitterLng];
    }
    // Check state
    if (inst.state && STATE_CENTROIDS[inst.state]) {
      const [lat, lng] = STATE_CENTROIDS[inst.state];
      const jitterLat = (index % 7 - 3) * 0.12;
      const jitterLng = (Math.floor(index / 7) % 7 - 3) * 0.12;
      return [lat + jitterLat, lng + jitterLng];
    }
    // Fallback to center of India
    return [22.5937 + (index % 5 - 2) * 0.5, 78.9629 + (index % 7 - 3) * 0.5];
  };

  // Render Markers on Map whenever filters or institutions change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Filter institutions
    const filtered = institutions.filter((inst) => {
      const hasOverlaps = (inst._count?.overlaps || 0) > 0 || (inst.totalComplaints || 0) >= 3;
      const isMedium = (inst.totalComplaints || 0) > 0 && !hasOverlaps;
      const isLow = (inst.totalComplaints || 0) === 0;

      if (riskFilter === 'HIGH' && !hasOverlaps) return false;
      if (riskFilter === 'MEDIUM' && !isMedium) return false;
      if (riskFilter === 'LOW' && !isLow) return false;

      if (regionFilter !== 'ALL' && inst.state !== regionFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          inst.name.toLowerCase().includes(q) ||
          inst.aicteId.toLowerCase().includes(q) ||
          inst.district.toLowerCase().includes(q) ||
          inst.state.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });

    filtered.forEach((inst, index) => {
      const coords = getCoordinates(inst, index);
      const overlaps = inst._count?.overlaps || 0;
      const complaintsCount = inst.totalComplaints || inst.pendingComplaints || 0;
      const isHighRisk = overlaps > 0 || complaintsCount >= 3;
      const isMediumRisk = complaintsCount > 0 && !isHighRisk;

      // Pin Color Theme
      let markerHtml = '';
      if (isHighRisk) {
        // Red Pulsing High-Risk Pin
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <span class="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping"></span>
            <div class="relative w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">
              ${complaintsCount}
            </div>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border border-white rounded-full"></div>
          </div>
        `;
      } else if (isMediumRisk) {
        // Amber Medium-Risk Pin
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
              ${complaintsCount}
            </div>
          </div>
        `;
      } else {
        // Blue / Emerald Low-Risk Pin
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-semibold text-[11px]">
              0
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-gis-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(coords, { icon: customIcon });

      marker.on('click', () => {
        setSelectedInst(inst);
        mapInstanceRef.current?.flyTo(coords, 8, { duration: 1 });
      });

      markersGroup.addLayer(marker);
    });
  }, [institutions, riskFilter, regionFilter, searchQuery]);

  const resetMap = () => {
    mapInstanceRef.current?.flyTo([22.5937, 78.9629], 5, { duration: 1 });
    setSelectedInst(null);
  };

  const highRiskCount = institutions.filter(
    (i) => (i._count?.overlaps || 0) > 0 || (i.totalComplaints || 0) >= 3
  ).length;

  return (
    <div className={`relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col ${className}`}>
      {/* Map Control Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>National GIS Hotspot & Institution Collision Radar</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                {highRiskCount} High Risk Clusters
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time geospatial mapping of technical institutions across India with multi-bureau collision flags.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search college, AICTE ID..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">🚨 High Collision / Overlap</option>
            <option value="MEDIUM">⚠️ Active Scrutiny (1-2)</option>
            <option value="LOW">✅ Clean / No Complaints</option>
          </select>

          {/* Reset View */}
          <button
            onClick={resetMap}
            title="Reset Map to Pan-India"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Body */}
      <div className="relative w-full h-[540px]">
        {/* Leaflet Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Map Indicators
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">
              !
            </span>
            <span className="text-slate-700 font-medium">Multi-Bureau Overlap Collision</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm" />
            <span className="text-slate-700 font-medium">Active Inquiry / Pending Cases</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-sm" />
            <span className="text-slate-700 font-medium">Compliant Institution</span>
          </div>
        </div>

        {/* Selected Institution Floating Dossier Card */}
        {selectedInst && (
          <div className="absolute top-4 right-4 z-10 w-80 sm:w-96 bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-4 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedInst.aicteId}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                  {selectedInst.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedInst.district}, {selectedInst.state} · Type: {selectedInst.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedInst(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 my-3 text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total</span>
                <span className="text-sm font-bold text-slate-800">{selectedInst.totalComplaints || 0}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                <span className="text-[10px] text-amber-700 font-semibold uppercase block">Pending</span>
                <span className="text-sm font-bold text-amber-900">{selectedInst.pendingComplaints || 0}</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                <span className="text-[10px] text-rose-700 font-semibold uppercase block">Overlaps</span>
                <span className="text-sm font-bold text-rose-900">{selectedInst._count?.overlaps || 0}</span>
              </div>
            </div>

            {/* Status Alert */}
            {(selectedInst._count?.overlaps || 0) > 0 ? (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Cross-Bureau Alert:</strong> Multiple bureaus have active investigations against this campus. Coordinate via Overlap Center.
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-3">
                Campus status: <strong>{selectedInst.status || 'Active'}</strong>. Address: {selectedInst.address}
              </div>
            )}

            {/* Action Button */}
            {onSelectInstitution && (
              <button
                onClick={() => onSelectInstitution(selectedInst)}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>Open Full 360° Institution Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

