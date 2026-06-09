import { useState } from "react";

interface SearchHeaderProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  error?: string;
}

export default function SearchHeader({
  onSearch,
  isSearching,
  error,
}: SearchHeaderProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <>
      <header className="hero">
        <div className="govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds site-header">
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-6 hero__heading">
                <span>Search all design systems for reusable assets</span>
              </h1>
              <p className="govuk-body-l hero__description">
                Find components and patterns used across government.
              </p>
            
            </div>
          </div>
        </div>
      </header>

      <div className="govuk-width-container govuk-!-padding-top-8 govuk-!-padding-bottom-5">
        <form onSubmit={handleSubmit}>
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m" htmlFor="search-query">
              Describe what you&apos;re looking for in your own words
            </label>
            <div id="search-query-hint" className="govuk-hint">
        For example, I need to warn users before they continue
      </div>
            <textarea
              id="search-query"
              name="searchQuery"
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={true}
              className="govuk-textarea"
            />
            {error ? (
              <p className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> {error}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="govuk-button"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search design systems"}
          </button>
        </form>
      </div>
    </>
  );
}
