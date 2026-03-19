"use client";

import { useState } from "react";

interface FiltersProps {
  onApplyFilters?: (filters: {
    department: string;
    contentType: string;
    profession: string;
  }) => void;
}

export default function Filters({ onApplyFilters }: FiltersProps) {
  const [department, setDepartment] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [profession, setProfession] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState<{
    department: string;
    contentType: string;
    profession: string;
  } | null>(null);

  const handleApply = () => {
    const filters = {
      department,
      contentType,
      profession,
    };

    setAppliedFilters(filters);

    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  const clearFilters = () => {
    setDepartment("all");
    setContentType("all");
    setProfession("all");
    setAppliedFilters(null);

    if (onApplyFilters) {
      onApplyFilters({
        department: "all",
        contentType: "all",
        profession: "all",
      });
    }
  };

  return (
    <div className="govuk-grid-row govuk-!-margin-bottom-10">
      <div className="govuk-grid-column-full">
        <div className="govuk-panel govuk-!-padding-top-6 govuk-!-padding-bottom-6">
          <h3 className="govuk-heading-s govuk-!-margin-bottom-3">Filters</h3>

          <div className="govuk-grid-row govuk-!-margin-bottom-4">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="department">
                  Department
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="govuk-select"
                >
                  <option value="all">All departments</option>
                  <option value="gov-uk">GOV.UK Design System</option>
                  <option value="hmrc">HMRC</option>
                  <option value="moj">Ministry of Justice</option>
                  <option value="nhs">NHS</option>
                </select>
              </div>
            </div>

            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="content-type">
                  Content type
                </label>
                <select
                  id="content-type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="govuk-select"
                >
                  <option value="all">All types</option>
                  <option value="component">Component</option>
                  <option value="pattern">Pattern</option>
                  <option value="style">Style</option>
                </select>
              </div>
            </div>

            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="profession">
                  Profession
                </label>
                <select
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="govuk-select"
                >
                  <option value="all">All professions</option>
                  <option value="designer">Designer</option>
                  <option value="developer">Developer</option>
                  <option value="content">Content designer</option>
                  <option value="researcher">User researcher</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleApply}
            className="govuk-button govuk-!-margin-bottom-4"
          >
            Apply filters
          </button>

          {appliedFilters && (
            <div className="govuk-panel govuk-!-margin-top-4">
              <div className="govuk-panel__body">
                <div className="govuk-grid-row govuk-!-align-items-center">
                  <div className="govuk-grid-column-one-half">
                    <h4 className="govuk-heading-s">Selected filters</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="govuk-tag">
                        Department: {appliedFilters.department}
                      </span>
                      <span className="govuk-tag">
                        Content type: {appliedFilters.contentType}
                      </span>
                      <span className="govuk-tag">
                        Profession: {appliedFilters.profession}
                      </span>
                    </div>
                  </div>
                  <div className="govuk-grid-column-one-half govuk-!-text-align-right">
                    <button
                      onClick={clearFilters}
                      className="govuk-link govuk-link--no-visited-state"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
