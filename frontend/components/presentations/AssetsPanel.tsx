'use client';

import { useState, useEffect } from 'react';
import { Search, Upload, Image as ImageIcon } from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';
import { API_BASE_URL } from '@/lib/api';

interface Asset {
  id: number;
  name: string;
  asset_type: string;
  file_url: string;
  thumbnail_url: string;
}

export default function AssetsPanel() {
  const { selectedFrame, createElement, canEdit } = usePresentation();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/assets/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const assetList = Array.isArray(data) ? data : data.results || [];
        setAssets(assetList);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleAssetClick = (asset: Asset) => {
    if (!selectedFrame || !canEdit || isDraggingCard) return;

    // Add the asset to the selected frame immediately
    createElement(selectedFrame.id, {
      element_type: asset.asset_type === 'IMAGE' ? 'IMAGE' : 'IMAGE',
      position: JSON.stringify({
        x: 100,
        y: 100,
        width: 300,
        height: 200,
        rotation: 0,
        z_index: 1,
      }),
      content: JSON.stringify({
        url: asset.file_url,
      }),
    });
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    if (!canEdit) return;
    setIsDraggingCard(true);
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
    const img = e.currentTarget.querySelector('img');
    if (img) {
      e.dataTransfer.setDragImage(img, 50, 50);
    }
  };

  const handleDragEnd = () => {
    setTimeout(() => setIsDraggingCard(false), 50);
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || asset.asset_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex h-full flex-col text-white">
      <div className="space-y-3 border-b border-white/10 px-4 pb-4 pt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold uppercase tracking-wide text-white/70">
          {['', 'IMAGE', 'GIF', 'ICON', 'VIDEO'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-full px-3 py-1 transition ${
                selectedType === type
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>

        {canEdit && (
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40">
            <Upload size={16} />
            Upload asset
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              draggable={canEdit}
              onDragStart={(e) => handleDragStart(e, asset)}
              onDragEnd={handleDragEnd}
              onClick={() => handleAssetClick(asset)}
              className="group cursor-pointer space-y-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:border-indigo-400/60 hover:bg-white/10"
              title={canEdit ? 'Drag to canvas or click to add' : 'Click to add'}
            >
              <div className="aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/30 shadow-inner shadow-black/20">
                {asset.thumbnail_url || asset.file_url ? (
                  <img
                    src={asset.thumbnail_url || asset.file_url}
                    alt={asset.name}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="text-white/30" size={32} />
                  </div>
                )}
              </div>
              <p className="truncate text-xs text-white/80">{asset.name}</p>
            </div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
            <ImageIcon className="mx-auto mb-3 text-white/30" size={40} />
            <p>No assets found</p>
          </div>
        )}
      </div>
    </div>
  );
}
