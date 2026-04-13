import type { Component } from "@/types/api";

interface ComponentCardProps {
  component: Component;
}

function formatUpdatedAt(timestamp: string) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ComponentCard({ component }: ComponentCardProps) {
  const {
    title,
    url,
    description,
    parent,
    has_research,
    needs_research,
    views,
    score,
    accessability,
    updated_at,
  } = component;

  const updatedLabel = formatUpdatedAt(updated_at);

  return (
    <article className="card card--clickable">
      <h2 className="govuk-heading-m card__heading">
        <a
          className="govuk-link card__link govuk-link--no-visited-state"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {title}
        </a>
      </h2>

      {parent && parent.length > 0 && (
        <p className="govuk-body-s govuk-!-margin-bottom-2">{parent}</p>
      )}

      <p className="govuk-body card__description">{description}</p>

      <footer className="card__footer">
        {updatedLabel && (
          <p className="govuk-body-s">
            Updated in <time>{updatedLabel}</time>
          </p>
        )}

        {score && (
          <p className="govuk-body-s">{Math.round(score * 100)}% match</p>
        )}

        <div className="card__tags">
          {accessability && accessability.length > 0 && (
            <div><strong className="govuk-tag govuk-tag--teal govuk-tag-text-left">Accessible</strong></div>
          )}
          {has_research && (
            <div><strong className="govuk-tag govuk-tag--blue govuk-tag-text-left">Research available</strong></div>
          )}
          {needs_research && (
            <div><strong className="govuk-tag govuk-tag--yellow govuk-tag-text-left">Needs research</strong></div>
          )}
        </div>
      </footer>
    </article>
  );
}
