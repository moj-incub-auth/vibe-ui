interface AISummaryProps {
  summary: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function AISummary({
  summary,
  isExpanded = false,
  onToggle,
}: AISummaryProps) {
  return (
    <div className="govuk-panel govuk-!-margin-bottom-8">
      <h3 className="govuk-heading-s govuk-!-margin-bottom-3">AI summary</h3>
      <p className="govuk-body govuk-!-margin-bottom-4">{summary}</p>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="govuk-link govuk-link--no-visited-state"
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Hide details" : "Show details"}
        </button>
      )}
    </div>
  );
}
