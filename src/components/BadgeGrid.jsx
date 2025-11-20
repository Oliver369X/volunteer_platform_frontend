'use strict';

import { useState } from 'react';
import { 
  SparklesIcon, 
  LinkIcon, 
  CheckBadgeIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const levelColors = {
  BRONCE: {
    border: 'border-amber-400',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    text: 'text-amber-700',
    glow: 'hover:shadow-amber-200',
    icon: '🥉'
  },
  PLATA: {
    border: 'border-slate-400',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    text: 'text-slate-700',
    glow: 'hover:shadow-slate-200',
    icon: '🥈'
  },
  ORO: {
    border: 'border-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    text: 'text-yellow-700',
    glow: 'hover:shadow-yellow-200',
    icon: '🥇'
  },
  PLATINO: {
    border: 'border-indigo-400',
    bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    text: 'text-indigo-700',
    glow: 'hover:shadow-indigo-200',
    icon: '💎'
  },
  ESPECIAL: {
    border: 'border-fuchsia-400',
    bg: 'bg-gradient-to-br from-fuchsia-50 to-fuchsia-100',
    text: 'text-fuchsia-700',
    glow: 'hover:shadow-fuchsia-200',
    icon: '⭐'
  },
};

const BadgeCard = ({ badge }) => {
  const [showDetails, setShowDetails] = useState(false);
  const level = badge.badge?.level ?? badge.level;
  const levelStyle = levelColors[level] || levelColors.BRONCE;
  const metadata = badge.metadata || {};
  const ipfsData = metadata.ipfs;
  const isNFT = badge.tokenId && badge.tokenId.includes('nft-');
  const isMinted = badge.blockchainStatus === 'MINTED';

  return (
    <div
      className={`
        group relative flex flex-col gap-3 rounded-2xl border-2 p-4 
        shadow-lg transition-all duration-300 
        ${levelStyle.border} ${levelStyle.bg} ${levelStyle.glow}
        hover:shadow-2xl hover:scale-105 animate-fade-in
      `}
    >
      {/* Badge Icon/Emoji grande */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-4xl" role="img" aria-label="badge-icon">
            {levelStyle.icon}
          </span>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-ink leading-tight">
              {badge.badge?.name ?? badge.name}
            </p>
            <span className={`text-xs font-semibold ${levelStyle.text}`}>
              {level}
            </span>
          </div>
        </div>
        
        {/* Indicador NFT/Blockchain */}
        {isMinted && (
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1">
            <CheckBadgeIcon className="h-4 w-4 text-green-600" />
            <span className="text-[10px] font-semibold text-green-700">NFT</span>
          </div>
        )}
      </div>

      {/* Descripción */}
      <p className="text-xs text-muted leading-relaxed min-h-[2.5rem]">
        {badge.badge?.description ?? badge.description ?? 'Insignia sin descripción.'}
      </p>

      {/* Fecha de obtención */}
      <div className="flex items-center gap-1 text-[10px] text-muted">
        <ClockIcon className="h-3 w-3" />
        <span>
          Obtenido: {new Date(badge.earnedAt || badge.createdAt).toLocaleDateString('es-BO')}
        </span>
      </div>

      {/* Token ID */}
      {badge.tokenId && (
        <div className="space-y-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-left transition-all hover:bg-white button-hover"
          >
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {isNFT ? 'NFT Details' : 'Token Info'}
              </span>
            </div>
            <span className="text-xs text-muted">
              {showDetails ? '▲' : '▼'}
            </span>
          </button>
          
          {/* Detalles expandibles */}
          {showDetails && (
            <div className="animate-slide-down space-y-2 rounded-lg bg-white/90 p-3">
              {/* Token ID */}
              <div>
                <p className="text-[10px] font-semibold text-muted mb-1">Token ID:</p>
                <p className="rounded bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-700 break-all">
                  {badge.tokenId}
                </p>
              </div>

              {/* IPFS Info */}
              {ipfsData && (
                <>
                  <div>
                    <p className="text-[10px] font-semibold text-muted mb-1">IPFS Hash:</p>
                    <p className="rounded bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-700 break-all">
                      {ipfsData.ipfsHash}
                    </p>
                  </div>
                  
                  {ipfsData.gatewayUrl && (
                    <a
                      href={ipfsData.gatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-dark button-hover"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Ver en IPFS
                    </a>
                  )}
                </>
              )}

              {/* Blockchain Status */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-[10px] font-semibold text-muted">Estado:</span>
                <span className={`text-[10px] font-bold ${
                  isMinted ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {badge.blockchainStatus || 'PENDING'}
                </span>
              </div>

              {/* Contract Address */}
              {metadata.contractAddress && (
                <div>
                  <p className="text-[10px] font-semibold text-muted mb-1">Contrato:</p>
                  <p className="rounded bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-700 break-all">
                    {metadata.contractAddress}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

const BadgeGrid = ({ badges = [] }) => {
  if (!badges.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-8 text-center animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-slate-100 p-4">
            <SparklesIcon className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Aún no tienes insignias</p>
            <p className="text-xs text-muted mt-1">
              Completa misiones para empezar a ganar badges NFT
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
};

export default BadgeGrid;



