export default function GovFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container govuk-footer__content">
        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
            <p className="govuk-footer__meta-heading">
              All content is available under the Open Government Licence v3.0, except where
              otherwise stated
            </p>
            <p className="govuk-footer__licence-description">
              <a
                className="govuk-footer__link"
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              >
                Open Government Licence v3.0
              </a>
            </p>
          </div>
          <div className="govuk-footer__meta-item">
            <span className="govuk-footer__licence-logo" aria-hidden="true" />
            <span className="govuk-footer__copyright">© Crown copyright</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
