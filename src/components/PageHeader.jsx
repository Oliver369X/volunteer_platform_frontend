'use strict';

const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {description ? <p className="text-sm text-muted">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);

export default PageHeader;



