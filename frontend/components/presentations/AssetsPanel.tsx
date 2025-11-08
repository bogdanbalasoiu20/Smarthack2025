'use client';

import { useState, useEffect } from 'react';
import { Search, Upload, Image as ImageIcon } from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';

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

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const token = getStoredToken();
      const response = await fetch('http://localhost:8000/api/presentations/assets/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleAssetClick = (asset: Asset) => {
    if (!selectedFrame || !canEdit) return;

    // Adaugă asset ca element în frame
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

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || asset.asset_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Caută assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {['', 'IMAGE', 'GIF', 'ICON', 'VIDEO'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>

        {canEdit && (
          <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
            <Upload size={16} />
            Upload Asset
          </button>
        )}
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => handleAssetClick(asset)}
              className="cursor-pointer group"
            >
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-500 transition-colors">
                {asset.thumbnail_url || asset.file_url ? (
                  <img
                    src={asset.thumbnail_url || asset.file_url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-gray-400" size={32} />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-700 truncate">{asset.name}</p>
            </div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            <ImageIcon className="mx-auto mb-2 text-gray-400" size={48} />
            <p>Niciun asset găsit</p>
          </div>
        )}
      </div>
    </div>
  );
}
