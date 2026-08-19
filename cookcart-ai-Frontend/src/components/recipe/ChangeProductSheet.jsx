import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, Star, X } from 'lucide-react';
import SmartImage from '../common/SmartImage.jsx';
import { formatCurrency } from '../../utils/helpers.js';

export default function ChangeProductSheet({ open, onClose, ingredient, onSelect }) {
  const [selectedId, setSelectedId] = useState(null);
  const panelRef = useRef(null);

  const options = ingredient?.alternatives ?? [];

  // Close on Escape; lock scroll while open; focus the panel for keyboard users.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleSelect = (alt) => {
    setSelectedId(alt.skuId);
    onSelect?.(alt);
    onClose();
  };

  const required = ingredient?.requiredQuantityText || `${ingredient?.requiredQuantity ?? ''}${ingredient?.requiredUnit ?? ''}`;

  return (
    <AnimatePresence>
      {open && ingredient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-on-background/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-product-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="absolute bottom-0 inset-x-0 mx-auto w-full max-w-2xl bg-surface rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[85vh] outline-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full flex justify-center py-4 cursor-grab">
              <div className="w-12 h-1.5 bg-surface-variant rounded-full" />
            </div>

            <div className="px-6 pb-4 flex justify-between items-start border-b border-border-light">
              <div>
                <h2 id="change-product-title" className="font-display text-headline-md text-on-surface mb-1">
                  Choose {ingredient.name}
                </h2>
                <p className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Info size={14} className="text-warning" />
                  Required: {required} for {ingredient.name}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1 p-6 flex flex-col gap-4 pb-8">
              {options.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  No alternative products available for this ingredient.
                </div>
              ) : (
                options.map((alt, index) => {
                  const isBest = index === 0 && alt.inStock;
                  const isSelected = selectedId === alt.skuId;
                  const unavailable = !alt.inStock;
                  return (
                    <motion.div
                      key={alt.skuId}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.25) }}
                    >
                      <div
                        className={`relative bg-surface rounded-2xl p-4 flex gap-4 text-left transition-all ${
                          isSelected
                            ? 'border-2 border-success-veg shadow-card-soft'
                            : `border ${unavailable ? 'border-border-light opacity-60' : 'border-border-light hover:-translate-y-1 hover:shadow-card-soft'}`
                        }`}
                      >
                        {isBest && (
                          <span className="absolute -top-3 left-4 bg-success-veg text-on-primary text-label-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Star size={14} /> Best Match
                          </span>
                        )}
                        <div className="w-24 h-24 rounded-xl bg-surface-container-lowest border border-border-light flex-shrink-0 p-2 relative overflow-hidden">
                          <SmartImage src={alt.image} alt={alt.name} kind="product" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="text-label-md text-on-surface font-bold leading-tight">{alt.name}</h3>
                            <p className="text-label-sm text-on-surface-variant mt-1">
                              {alt.packSize}{alt.unit} per pack
                            </p>
                            {!alt.inStock && (
                              <p className="text-label-sm text-error font-semibold mt-1">Out of stock</p>
                            )}
                          </div>
                          <div className="flex justify-between items-end mt-2 gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-headline-md text-on-surface font-bold">
                                  {formatCurrency(alt.price)}
                                </span>
                                {alt.mrp > alt.price && (
                                  <span className="text-label-sm text-on-surface-variant line-through">
                                    {formatCurrency(alt.mrp)}
                                  </span>
                                )}
                              </div>
                              <p className="text-label-sm text-success-veg font-semibold bg-surface-soft px-2 py-0.5 rounded inline-block mt-1">
                                Need {alt.packCount || 1} pack{(alt.packCount || 1) > 1 ? 's' : ''} (
                                {required} total)
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={unavailable}
                              onClick={() => handleSelect(alt)}
                              className={`inline-flex items-center gap-1 text-label-md font-semibold px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isSelected
                                  ? 'bg-surface-soft border border-success-veg text-on-secondary-container'
                                  : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-success-veg hover:text-success-veg'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <CheckCircle2 size={18} /> Selected
                                </>
                              ) : unavailable ? (
                                'Unavailable'
                              ) : (
                                'Select'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
