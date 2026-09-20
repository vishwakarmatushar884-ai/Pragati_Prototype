import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Filter, Layers, ExternalLink, RefreshCw, Sparkles, Building2, MapPin } from 'lucide-react';
import { projectsApi } from '../api/projectsApi';
import { Project, RiskLevel } from '../types';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Custom SVG Markers colored by Risk Level
const createCustomIcon = (riskLevel: RiskLevel) => {
  const colors: Record<RiskLevel, string> = {
    LOW: '#10B981',      // Emerald
    MEDIUM: '#F59E0B',   // Amber
    HIGH: '#F97316',     // Orange
    CRITICAL: '#EF4444', // Red
  };

  const color = colors[riskLevel] || colors.LOW;

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
      </filter>
      <path fill="${color}" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3" fill="#ffffff" />
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const GISMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  const fetchMapProjects = async () => {
    setLoading(true);
    try {
      const list = await projectsApi.getProjects({
        riskLevel: selectedRisk || undefined,
        sector: selectedSector || undefined,
        state: selectedState || undefined,
      });
      // Filter out any missing coordinates
      const valid = list.filter((p) => p.latitude && p.longitude);
      setProjects(valid);
    } catch (err) {
      console.error('Failed to load map markers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapProjects();
  }, [selectedRisk, selectedSector, selectedState]);

  // Default Center of India
  const centerOfIndia: [number, number] = [22.5937, 78.9629];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Interactive GIS India Map</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {projects.length} Geocoded Projects
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Spatial project intelligence across 10 Indian states with live risk-coded marker overlays
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low Risk
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5 text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Critical
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="">All Sectors</option>
            <option value="Highways">Highways</option>
            <option value="Railways">Railways</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Power">Power</option>
            <option value="Urban Development">Urban Development</option>
            <option value="Healthcare">Healthcare</option>
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="">All States</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Bihar">Bihar</option>
            <option value="Odisha">Odisha</option>
            <option value="Assam">Assam</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSelectedRisk('');
            setSelectedSector('');
            setSelectedState('');
          }}
          className="text-xs text-slate-400 hover:text-white"
        >
          Reset Filters
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-800 shadow-2xl relative h-[620px] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
            <LoadingSpinner message="Plotting GIS infrastructure coordinates..." />
          </div>
        )}

        <MapContainer
          center={centerOfIndia}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {projects.map((p) => (
            <Marker
              key={p.id}
              position={[p.latitude!, p.longitude!]}
              icon={createCustomIcon(p.riskLevel)}
            >
              <Popup>
                <div className="p-3.5 space-y-2 text-slate-100 min-w-[240px]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
                    <span className="text-[10px] font-extrabold text-blue-400">{p.projectCode}</span>
                    <RiskBadge risk={p.riskLevel} />
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">{p.projectName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.ministry}</p>
                    <p className="text-[10px] text-slate-400">{p.district}, {p.state}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[10px]">
                    <div>
                      <p className="text-slate-500 font-bold">PHYSICAL</p>
                      <p className="font-black text-blue-400">{p.physicalProgress}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold">SPI</p>
                      <p className="font-black text-slate-200">{p.spi}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold">HEALTH</p>
                      <p className="font-black text-emerald-400">{p.healthScore}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open Project Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
