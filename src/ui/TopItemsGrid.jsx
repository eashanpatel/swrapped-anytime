import '../styles/page.css';
import { AlertTriangle, Disc } from './icons';

const SKELETON_COUNT = 12;

/* Same box as a real card, so the swap to data shifts nothing. */
function SkeletonCard() {
  return (
    <div className="skeleton">
      <div className="skeleton__art shimmer" />
      <div className="skeleton__body">
        <div className="skeleton__line shimmer" />
        <div className="skeleton__line skeleton__line--short shimmer" />
      </div>
    </div>
  );
}

/**
 * Renders exactly one of: loading, error, empty, or the cards passed as
 * children. Every one of the six pages goes through here, so the four states
 * can never drift apart between them.
 */
function TopItemsGrid({ loading, error, isEmpty, emptyLabel, onRetry, children }) {
  return (
    <div className="grid" aria-busy={loading || undefined}>
      {loading &&
        Array.from({ length: SKELETON_COUNT }, (_, i) => <SkeletonCard key={i} />)}

      {!loading && error && (
        <div className="state" role="alert">
          <AlertTriangle className="state__icon state__icon--error" />
          <h2 className="state__title">That didn&apos;t load</h2>
          <p className="state__body">{error}</p>
          {onRetry && (
            <button type="button" className="btn btn--ghost" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      )}

      {!loading && !error && isEmpty && (
        <div className="state">
          <Disc className="state__icon" />
          <h2 className="state__title">Nothing here yet</h2>
          <p className="state__body">{emptyLabel}</p>
        </div>
      )}

      {!loading && !error && !isEmpty && children}
    </div>
  );
}

export default TopItemsGrid;
