'use strict';

import { useEffect, useState } from 'react';
import { XMarkIcon, SparklesIcon, LinkIcon } from '@heroicons/react/24/outline';

const LEVEL_EMOJIS = {
  BRONCE: '🥉',
  PLATA: '🥈',
  ORO: '🥇',
  PLATINO: '💎',
  ESPECIAL: '⭐',
};

const BadgeEarnedModal = ({ isOpen, onClose, badge }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Desactivar confetti después de 3 segundos
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !badge) return null;

  const levelEmoji = LEVEL_EMOJIS[badge.level] || '🏆';
  const ipfsData = badge.metadata?.ipfs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '⭐', '✨', '🏆', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-orange-50 shadow-2xl animate-scale-in overflow-hidden">
        {/* Efectos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Header */}
        <div className="relative border-b-2 border-yellow-400 bg-gradient-to-r from-yellow-100 to-orange-100 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-xl bg-white/80 p-2 text-muted transition-colors hover:bg-white hover:text-red-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <div className="text-center">
            <div className="animate-bounce mb-4">
              <span className="text-6xl">{levelEmoji}</span>
            </div>
            <h2 className="text-3xl font-bold text-ink mb-2">
              ¡Felicitaciones! 🎊
            </h2>
            <p className="text-lg text-muted">
              Has ganado un nuevo Badge NFT
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="relative p-8 space-y-6">
          {/* Badge Info */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 border-2 border-yellow-400 shadow-lg">
              <span className="text-4xl">{levelEmoji}</span>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-ink">
                  {badge.name}
                </h3>
                <p className="text-sm font-semibold text-yellow-700">
                  Nivel {badge.level}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl bg-white border-2 border-slate-200 p-6 shadow-lg">
            <p className="text-center text-muted leading-relaxed">
              {badge.description || 'Un reconocimiento especial por tu dedicación y compromiso.'}
            </p>
          </div>

          {/* NFT Details */}
          {badge.tokenId && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <SparklesIcon className="h-5 w-5 text-primary" />
                <h4 className="text-lg font-bold text-ink">Detalles del NFT</h4>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 space-y-3">
                {/* Token ID */}
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">Token ID:</p>
                  <p className="rounded-lg bg-white px-3 py-2 text-xs font-mono text-slate-700 break-all border border-blue-200">
                    {badge.tokenId}
                  </p>
                </div>

                {/* IPFS Info */}
                {ipfsData && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-muted mb-1">IPFS Hash:</p>
                      <p className="rounded-lg bg-white px-3 py-2 text-xs font-mono text-slate-700 break-all border border-blue-200">
                        {ipfsData.ipfsHash}
                      </p>
                    </div>

                    {ipfsData.gatewayUrl && (
                      <a
                        href={ipfsData.gatewayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover"
                      >
                        <LinkIcon className="h-5 w-5" />
                        Ver NFT en IPFS
                      </a>
                    )}
                  </>
                )}

                {/* Blockchain Status */}
                <div className="flex items-center justify-center gap-2 rounded-xl bg-green-100 px-4 py-3 border-2 border-green-400">
                  <span className="text-2xl">✅</span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-muted">Estado del NFT</p>
                    <p className="text-sm font-bold text-green-700">
                      {badge.blockchainStatus || 'MINTED'} - Verificado en Blockchain
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info adicional */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900 text-center">
              <strong>💡 Este NFT es tuyo para siempre.</strong><br />
              Es verificable, inmutable y prueba tu contribución al mundo.
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover"
          >
            🎉 ¡Genial! Ver mis Badges
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti forwards;
          font-size: 24px;
        }
      `}</style>
    </div>
  );
};

export default BadgeEarnedModal;

