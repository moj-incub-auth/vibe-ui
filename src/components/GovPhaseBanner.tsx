const oldBanner = () => (
  <div className="govuk-phase-banner" aria-label="Site status">
    <p className="govuk-phase-banner__content">
      <strong className="govuk-tag govuk-phase-banner__content__tag">Alpha</strong>
      <span className="govuk-phase-banner__text">
        This is a new service. <a className="govuk-link" href="#">Help us improve it</a> and <a className="govuk-link" href="#">give your feedback</a>.
      </span>
    </p>
  </div>
)

export default function GovPhaseBanner() {
  return (
    <div className="govuk-!-padding-top-2 govuk-!-padding-bottom-8">
      <div
        className="govuk-notification-banner govuk-!-margin-bottom-0"
        role="region"
        aria-labelledby="govuk-notification-banner-title"
        data-module="govuk-notification-banner"
      >
        <div className="govuk-notification-banner__header">
          <h2
            className="govuk-notification-banner__title"
            id="govuk-notification-banner-title"
          >
            This is a prototype
          </h2>
        </div>

        <div className="govuk-notification-banner__content">
          <p className="govuk-notification-banner__heading">
            This is not a live service. It only includes a sample of design system content.
          </p>

          <p className="govuk-body">
            Try a few searches, then{" "}
            <a
              className="govuk-notification-banner__link"
              href="https://forms.office.com/pages/responsepage.aspx?id=KEeHxuZx_kGp4S6MNndq2BWuCYiathpHp2puk8YlVv9UN01JWkhETE9KQ1lSSjFLVlNHOTFWN0ZDOC4u&route=shorturl"
              target="_blank"
              rel="noopener noreferrer"
            >
              give feedback
            </a>{" "}
            to tell us whether this idea is useful and how we can improve the results.
          </p>

          <p className="govuk-body">
            Available until 5pm Friday July 3rd, 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
