import React from 'react';
import ProviderIcon from '../../../src/components/ProviderIcon';

interface LegendItemProps {
  provider: { name: string; color: string };
  isHighlighted: boolean;
  onClick: () => void;
}

const LegendItem: React.FC<LegendItemProps> = ({ provider, isHighlighted, onClick }) => (
  <div
    className={`tci-legend__item ${!isHighlighted ? 'tci-legend__item--dimmed' : ''}`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <ProviderIcon provider={provider.name} size={14} />
    <span className="tci-legend__item-name">{provider.name}</span>
  </div>
);

interface OrganizationLegendProps {
  providers: Array<{ name: string; color: string }>;
  selectedOrgs: Set<string>;
  onToggle: (org: string) => void;
  resultCount: number;
}

export default function OrganizationLegend({
  providers,
  selectedOrgs,
  onToggle,
  resultCount,
}: OrganizationLegendProps): JSX.Element {
  return (
    <div className="tci-legend">
      <div className="tci-legend__count">{resultCount} Results</div>
      <div className="tci-legend__title">Organization</div>
      {providers.map((p) => (
        <LegendItem
          key={p.name}
          provider={p}
          isHighlighted={selectedOrgs.size === 0 || selectedOrgs.has(p.name)}
          onClick={() => onToggle(p.name)}
        />
      ))}
    </div>
  );
}
