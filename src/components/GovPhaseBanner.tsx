export default function GovPhaseBanner() {
  return (
    <div className="govuk-phase-banner" aria-label="Site status">
      <p className="govuk-phase-banner__content">
        <strong className="govuk-tag govuk-phase-banner__content__tag">Alpha</strong>
        <span className="govuk-phase-banner__text">
          This is a new service. <a className="govuk-link" href="#">Help us improve it</a> and <a className="govuk-link" href="#">give your feedback</a>.
        </span>
      </p>
    </div>
  );
}
