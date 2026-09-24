'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/stores/locale';

export default function TabGroupe({ tabs = [] }) {
  const { labels } = useI18n();
  const [activeTab, setActiveTab] = useState(0);

  if (!tabs.length) return null;

  return (
    <div className="tab-groupe">
      <div className="ui pointing secondary menu tab-groupe-menu" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.id ?? tab.label}
            className={`item tab-groupe-tab${i === activeTab ? ' active' : ''}`}
            role="tab"
            aria-selected={i === activeTab}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-groupe-panels">
        {tabs.map((tab, i) => (
          <div
            key={tab.id ?? tab.label}
            className={`tab-groupe-panel${i === activeTab ? ' is-active' : ''}`}
            role="tabpanel"
            hidden={i !== activeTab}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
