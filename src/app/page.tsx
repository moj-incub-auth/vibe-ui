"use client";

import { useState, useEffect } from "react";
import ComponentCard from "@/components/ComponentCard";
import SearchHeader from "@/components/SearchHeader";
import Filters from "@/components/Filters";
import { searchComponents } from "@/lib/api";
import type { Component } from "@/types/api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [allComponents, setAllComponents] = useState<Component[]>([]);
  const [displayComponents, setDisplayComponents] = useState<Component[]>([]);
  const [error, setError] = useState<string>("");

  // Feature flag for filters
  const filtersEnabled =
    process.env.NEXT_PUBLIC_ENABLE_FILTERS === "true";

  useEffect(() => {
    async function fetchData() {
      setIsSearching(true);
      try {
        const response = await searchComponents("");
        setAllComponents(response.components);
        setDisplayComponents(response.components);
      } catch (err) {
        setError("Failed to load components. Please try again.");
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }

    fetchData();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setError("Enter a search query to continue.");
      return;
    }

    setSearchQuery(query);
    setIsSearching(true);
    setError("");

    const matched = allComponents.filter((item) => {
      const lower = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.parent.toLowerCase().includes(lower)
      );
    });

    setDisplayComponents(matched.length ? matched : []);
    setIsSearching(false);
  };

  const handleApplyFilters = (filters: {
    department: string;
    contentType: string;
    profession: string;
  }) => {
    console.log("Applying filters:", filters);
    // TODO: Implement filter logic
  };

  const recentlyUpdatedComponents = [...allComponents]
    .filter((item) => item.category === "component")
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 3);

  const recentlyUpdatedPatterns = [...allComponents]
    .filter((item) => item.category === "pattern")
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 3);

  const resultsComponents = displayComponents.filter(
    (item) => item.category === "component"
  );

  const resultsPatterns = displayComponents.filter(
    (item) => item.category === "pattern"
  );

  const hasSearched = Boolean(searchQuery.trim());

  const componentItems = hasSearched
    ? resultsComponents
    : recentlyUpdatedComponents;
  const patternItems = hasSearched ? resultsPatterns : recentlyUpdatedPatterns;

  return (
    <main className="govuk-main-wrapper govuk-!-padding-top-0">
      <SearchHeader
        onSearch={handleSearch}
        isSearching={isSearching}
        error={error}
      />

      {hasSearched && !resultsComponents.length && !resultsPatterns.length && (
        <div className="govuk-width-container govuk-!-padding-top-6">
          <p className="govuk-body">No results found. Try another search term.</p>
        </div>
      )}

      {(componentItems.length > 0 || patternItems.length > 0) && (
        <section>
          <div className="govuk-width-container">
            {hasSearched ? (
              <h2 className="govuk-heading-l govuk-!-padding-top-7">Search results</h2>
            ) : null}

            {componentItems.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-7 govuk-!-margin-bottom-3">
                  {hasSearched ? "Components" : "Recently updated components"}
                </h2>
                <ul className="govuk-grid-row card-group">
                  {componentItems.map((component, index) => (
                    <li key={index} className="govuk-grid-column-one-third card-group__item">
                      <ComponentCard component={component} />
                    </li>
                  ))}
                </ul>
              </>
            )}

            {patternItems.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-7 govuk-!-margin-bottom-3">
                  {hasSearched ? "Patterns" : "Recently updated patterns"}
                </h2>
                <ul className="govuk-grid-row card-group">
                  {patternItems.map((pattern, index) => (
                    <li key={index} className="govuk-grid-column-one-third card-group__item">
                      <ComponentCard component={pattern} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      {filtersEnabled && <Filters onApplyFilters={handleApplyFilters} />}
    </main>
  );
}
