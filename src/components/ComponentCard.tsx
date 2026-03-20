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
    views,
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
        <p className="govuk-body govuk-!-margin-bottom-2">{parent}</p>
      )}

      <p className="govuk-body card__description">{description}</p>

      <footer className="card__footer">
        {updatedLabel && (
          <p className="govuk-body">
            Updated in <time>{updatedLabel}</time>
          </p>
        )}

        <div className="card__tags">
          {accessability && accessability.length > 0 && (
            <strong className="govuk-tag govuk-tag--red card__tag-chip">Accessibility issues</strong>
          )}

          {has_research ? (
            <strong className="govuk-tag govuk-tag--blue card__tag-chip">Research findings</strong>
          ) : (
            <strong className="govuk-tag govuk-tag--yellow card__tag-chip">Needs research</strong>
          )}
        </div>
      </footer>
    </article>
  );
}
