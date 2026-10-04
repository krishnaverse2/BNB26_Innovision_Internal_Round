import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Code, CheckCircle, Sparkles, Terminal } from 'lucide-react';
import { Pill } from '../ui';

const CATEGORIES = ['All', 'Systems', 'Web & Scripting', 'Enterprise & Mobile'];

// Distinct vibrant badges for each language
const LANG_ICONS = {
  python: '🐍',
  javascript: '⚡',
  cpp: '⚙️',
  java: '☕',
  c: '🔩',
  csharp: '🔷',
  go: '🐹',
  kotlin: '🟣',
  php: '🐘',
  rust: '🦀',
  typescript: '📘',
  ruby: '💎',
};

export default function LanguageSelectionScreen({
  languages = [],
  mode = 'solve', // 'solve' or 'predict'
  onSelectLanguage,
  onBack,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    return languages.filter((lang) => {
      const matchCat =
        selectedCategory === 'All' ||
        lang.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchQuery =
        !searchQuery ||
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [languages, selectedCategory, searchQuery]);

  return (
    <div className="stack gap-lg animate-rise">
      {/* Top Header */}
      <div className="row between wrap" style={{ gap: 12, alignItems: 'flex-start' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onBack}
            style={{ borderRadius: 8, padding: '8px 12px' }}
          >
            <ArrowLeft size={16} />
            Back to Options
          </button>
          <div>
            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              <h2>Choose Your Programming Language</h2>
              <Pill tone={mode === 'solve' ? 'blue' : 'violet'}>
                {mode === 'solve' ? 'Solve Problem' : 'Predict Output'}
              </Pill>
            </div>
            <p className="soft small" style={{ marginTop: 2 }}>
              Select a language to load the LeetCode-style starter template, editor configuration, and test runner.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          background: 'var(--surface)',
          borderRadius: 14,
          border: '1px solid var(--border)',
        }}
      >
        <div className="row between wrap" style={{ gap: 14, alignItems: 'center' }}>
          {/* Category Tabs */}
          <div className="row wrap" style={{ gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ borderRadius: 20, padding: '6px 14px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div
            className="row"
            style={{
              gap: 8,
              alignItems: 'center',
              background: 'var(--bg)',
              padding: '6px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              width: 260,
              maxWidth: '100%',
            }}
          >
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search language (e.g. C++, Java)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                width: '100%',
                color: 'var(--text)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Languages Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {filteredLanguages.map((lang) => {
          const icon = LANG_ICONS[lang.id] || '💻';
          return (
            <div
              key={lang.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px 20px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                transition: 'all 0.18s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--blue-500)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => onSelectLanguage(lang)}
            >
              <div>
                <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
                  <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 26,
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg)',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {icon}
                    </span>
                    <div>
                      <div className="strong" style={{ fontSize: 16 }}>
                        {lang.name}
                      </div>
                      <span className="tiny muted">{lang.version}</span>
                    </div>
                  </div>
                  {lang.badge ? (
                    <Pill tone={lang.popular ? 'blue' : 'neutral'}>{lang.badge}</Pill>
                  ) : null}
                </div>

                <p className="small soft" style={{ margin: '8px 0 16px', lineHeight: 1.45 }}>
                  {lang.description}
                </p>
              </div>

              <div
                className="row between"
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: 12,
                  marginTop: 6,
                  alignItems: 'center',
                }}
              >
                <span className="tiny muted" style={{ fontWeight: 500 }}>
                  {lang.category}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLanguage(lang);
                  }}
                >
                  Select {lang.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLanguages.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-muted)',
          }}
        >
          <Code size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p className="strong">No languages found matching "{searchQuery}"</p>
          <p className="small soft" style={{ marginTop: 4 }}>
            Try resetting your search or selecting "All" categories.
          </p>
        </div>
      ) : null}
    </div>
  );
}
