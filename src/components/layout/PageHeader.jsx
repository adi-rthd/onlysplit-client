import PageInfoButton from '../common/PageInfoButton';

/**
 * Global standardized Page Header.
 * Provides consistent layout: Title + Description + Actions + Info Button.
 *
 * The Info Button (ℹ) opens a floating panel with page guide content.
 * It always appears as the last item in the actions row.
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   actions?: React.ReactNode,
 *   guide?: object,
 *   className?: string,
 * }} props
 */
const PageHeader = ({ title, description, actions, guide, className = '' }) => {
  return (
    <header className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-on-surface-variant mt-0.5 max-w-xl">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {actions}
        {guide && <PageInfoButton guide={guide} />}
      </div>
    </header>
  );
};

export default PageHeader;
