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
              <p className="govuk-body-m hero__description">
                Find components, patterns and standards from across the British government.
              </p>
              <figure className="hero__logo">
                <img
                  src="/assets/images/crest.svg"
                  className="govuk-!-display-inline-block"
                  alt="Ministry of Justice Crest"
                  width={80}
                  height={67}
                />
                <figcaption className="govuk-!-display-inline-block">
                  <span>
                    Curated by<br /> Ministry of Justice
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </header>

      <div className="govuk-width-container govuk-!-padding-top-8 govuk-!-padding-bottom-5">
        <form onSubmit={handleSubmit}>
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m" htmlFor="search-query">
              Describe what you&apos;re looking for in your own words.
            </label>
            <textarea
              id="search-query"
              name="searchQuery"
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={true}
              className="govuk-textarea"
            />
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
