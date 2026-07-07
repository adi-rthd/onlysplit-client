import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Info, CheckCircle2, Lightbulb, StickyNote, ChevronDown } from 'lucide-react';

/**
 * Compact, collapsible Page Information Card.
 * SEO-friendly: all content is always in the DOM (hidden via overflow, not unmounted).
 * Persists collapsed state via localStorage.
 *
 * @param {{
 *   id: string,
 *   title?: string,
 *   description?: string,
 *   features?: string[],
 *   tips?: string[],
 *   notes?: string[],
 *   warning?: string,
 * }} props
 */
const PageInfoCard = ({ id, title = 'About this page', description, features, tips, notes, warning }) => {
  const storageKey = `page-info-${id}`;
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const [expanded, setExpanded] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === null ? false : stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(expanded));
    } catch {
      // localStorage unavailable
    }
  }, [expanded, storageKey]);

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [features, tips, notes, warning]);

  const hasContent = description || features?.length || tips?.length || notes?.length || warning;
  if (!hasContent) return null;

  const featureCount = (features?.length || 0) + (tips?.length || 0) + (notes?.length || 0);
  const hasExpandable = features?.length || tips?.length || notes?.length || warning;

  return (
    <section
      className="w-full rounded-xl border hide-scrollbar border-glass-stroke/60 bg-surface-container-low/30 overflow-hidden"
      aria-label={title}
    >
      {/* Collapsed header + description — always visible */}
      <div className="px-4 py-3 md:px-5 md:py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <Info size={14} className="text-primary/70 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-on-surface/90">{title}</h2>
              {description && (
                <p className="text-[11px] md:text-xs text-on-surface-variant/80 leading-relaxed mt-0.5 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>

          {hasExpandable && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 shrink-0 text-[11px] font-medium text-primary/70 hover:text-primary transition-colors mt-0.5"
              aria-expanded={expanded}
            >
              <span className="hidden sm:inline">
                {expanded ? 'Show less' : `Learn more${featureCount > 0 ? ` (${featureCount})` : ''}`}
              </span>
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable content — always in DOM for SEO, hidden via height */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? contentHeight : 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
        aria-hidden={!expanded}
      >
        <div ref={contentRef} className="px-4 pb-3.5 md:px-5 md:pb-4 pt-0">
          <div className="border-t border-glass-stroke/40 pt-3 space-y-2.5">
            {/* Warning */}
            {warning && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10 px-2.5 py-2">
                <span className="text-[11px] text-yellow-300/80 leading-relaxed">{warning}</span>
              </div>
            )}

            {/* Features */}
            {features?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-medium text-on-surface-variant/60 uppercase tracking-wider mb-1">Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px] text-on-surface/70 py-0.5">
                      <CheckCircle2 size={10} className="text-green-400/80 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {tips?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-medium text-on-surface-variant/60 uppercase tracking-wider mb-1">Tips</h3>
                <ul className="space-y-0.5">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant/70 py-0.5">
                      <Lightbulb size={10} className="text-yellow-400/70 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {notes?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-medium text-on-surface-variant/60 uppercase tracking-wider mb-1">Notes</h3>
                <ul className="space-y-0.5">
                  {notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant/70 py-0.5">
                      <StickyNote size={10} className="text-primary/50 shrink-0 mt-0.5" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default PageInfoCard;
