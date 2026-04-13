"use client";

import { useState, useEffect } from "react";
import ComponentCard from "@/components/ComponentCard";
import SearchHeader from "@/components/SearchHeader";
import AISummary from "@/components/AISummary";
import Filters from "@/components/Filters";
import { searchComponents } from "@/lib/api";
import { getRuntimeConfig } from "@/lib/config";
import type { Component } from "@/types/api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [filtersEnabled, setFiltersEnabled] = useState(false);

  // Load runtime configuration on mount
  useEffect(() => {
    getRuntimeConfig().then((config) => {
      setFiltersEnabled(config.enableFilters);
    });
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setError("");

    try {
      const response = await searchComponents(query);
      setComponents(response.components);
      setMessage(response.message);
    } catch (err) {
      setError("Failed to search components. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyFilters = (filters: {
    department: string;
    contentType: string;
    profession: string;
  }) => {
    console.log("Applying filters:", filters);
    // TODO: Implement filter logic
  };

  return (
    <main className="govuk-main-wrapper" style={{ paddingTop: 0 }}>
      <SearchHeader
        onSearch={handleSearch}
        isSearching={isSearching}
        error={error}
      />

      {components.length > 0 && (
        <section>
          <div className="govuk-width-container">
            <div className="govuk-!-padding-top-4 govuk-!-padding-bottom-4">
              <p className="govuk-heading-s">Showing results for "{searchQuery}"</p>
            </div>
          </div>
          <div className="govuk-width-container">
            <h2 className="govuk-heading-l govuk-!-padding-top-7">Patterns and components</h2>
            <ul className="govuk-grid-row card-group">
              {components.map((component, index) => (
                <li key={index} className="govuk-grid-column-one-third card-group__item">
                  <ComponentCard component={component} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {message && (
        <section className="govuk-!-padding-top-7 govuk-!-padding-bottom-8">
          <div className="govuk-width-container">
            <AISummary summary={message} />
          </div>
        </section>
      )}

      {filtersEnabled && (
        <Filters onApplyFilters={handleApplyFilters} />
      )}
    </main>
  );
}
