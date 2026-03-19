(() => {
  // node_modules/govuk-frontend/dist/govuk/common/index.mjs
  function getBreakpoint(name) {
    const property = `--govuk-breakpoint-${name}`;
    const value = window.getComputedStyle(document.documentElement).getPropertyValue(property);
    return {
      property,
      value: value || void 0
    };
  }
  function setFocus($element, options = {}) {
    var _options$onBeforeFocu;
    const isFocusable = $element.getAttribute("tabindex");
    if (!isFocusable) {
      $element.setAttribute("tabindex", "-1");
    }
    function onFocus() {
      $element.addEventListener("blur", onBlur, {
        once: true
      });
    }
    function onBlur() {
      var _options$onBlur;
      (_options$onBlur = options.onBlur) == null || _options$onBlur.call($element);
      if (!isFocusable) {
        $element.removeAttribute("tabindex");
      }
    }
    $element.addEventListener("focus", onFocus, {
      once: true
    });
    (_options$onBeforeFocu = options.onBeforeFocus) == null || _options$onBeforeFocu.call($element);
    $element.focus();
  }
  function isInitialised($root, moduleName) {
    return $root instanceof HTMLElement && $root.hasAttribute(`data-${moduleName}-init`);
  }
  function isSupported($scope = document.body) {
    if (!$scope) {
      return false;
    }
    return $scope.classList.contains("govuk-frontend-supported");
  }
  function isArray(option) {
    return Array.isArray(option);
  }
  function isObject(option) {
    return !!option && typeof option === "object" && !isArray(option);
  }
  function isScope($scope) {
    return !!$scope && ($scope instanceof Element || $scope instanceof Document);
  }
  function formatErrorMessage(Component2, message) {
    return `${Component2.moduleName}: ${message}`;
  }

  // node_modules/govuk-frontend/dist/govuk/errors/index.mjs
  var GOVUKFrontendError = class extends Error {
    constructor(...args) {
      super(...args);
      this.name = "GOVUKFrontendError";
    }
  };
  var SupportError = class extends GOVUKFrontendError {
    /**
     * Checks if GOV.UK Frontend is supported on this page
     *
     * @param {HTMLElement | null} [$scope] - HTML element `<body>` checked for browser support
     */
    constructor($scope = document.body) {
      const supportMessage = "noModule" in HTMLScriptElement.prototype ? 'GOV.UK Frontend initialised without `<body class="govuk-frontend-supported">` from template `<script>` snippet' : "GOV.UK Frontend is not supported in this browser";
      super($scope ? supportMessage : 'GOV.UK Frontend initialised without `<script type="module">`');
      this.name = "SupportError";
    }
  };
  var ConfigError = class extends GOVUKFrontendError {
    constructor(...args) {
      super(...args);
      this.name = "ConfigError";
    }
  };
  var ElementError = class extends GOVUKFrontendError {
    constructor(messageOrOptions) {
      let message = typeof messageOrOptions === "string" ? messageOrOptions : "";
      if (isObject(messageOrOptions)) {
        const {
          component,
          identifier,
          element,
          expectedType
        } = messageOrOptions;
        message = identifier;
        message += element ? ` is not of type ${expectedType != null ? expectedType : "HTMLElement"}` : " not found";
        if (component) {
          message = formatErrorMessage(component, message);
        }
      }
      super(message);
      this.name = "ElementError";
    }
  };
  var InitError = class extends GOVUKFrontendError {
    constructor(componentOrMessage) {
      const message = typeof componentOrMessage === "string" ? componentOrMessage : formatErrorMessage(componentOrMessage, `Root element (\`$root\`) already initialised`);
      super(message);
      this.name = "InitError";
    }
  };

  // node_modules/govuk-frontend/dist/govuk/component.mjs
  var Component = class {
    /**
     * Returns the root element of the component
     *
     * @protected
     * @returns {RootElementType} - the root element of component
     */
    get $root() {
      return this._$root;
    }
    constructor($root) {
      this._$root = void 0;
      const childConstructor = this.constructor;
      if (typeof childConstructor.moduleName !== "string") {
        throw new InitError(`\`moduleName\` not defined in component`);
      }
      if (!($root instanceof childConstructor.elementType)) {
        throw new ElementError({
          element: $root,
          component: childConstructor,
          identifier: "Root element (`$root`)",
          expectedType: childConstructor.elementType.name
        });
      } else {
        this._$root = $root;
      }
      childConstructor.checkSupport();
      this.checkInitialised();
      const moduleName = childConstructor.moduleName;
      this.$root.setAttribute(`data-${moduleName}-init`, "");
    }
    checkInitialised() {
      const constructor = this.constructor;
      const moduleName = constructor.moduleName;
      if (moduleName && isInitialised(this.$root, moduleName)) {
        throw new InitError(constructor);
      }
    }
    static checkSupport() {
      if (!isSupported()) {
        throw new SupportError();
      }
    }
  };
  Component.elementType = HTMLElement;

  // node_modules/govuk-frontend/dist/govuk/common/configuration.mjs
  var configOverride = /* @__PURE__ */ Symbol.for("configOverride");
  var ConfigurableComponent = class extends Component {
    [configOverride](param) {
      return {};
    }
    /**
     * Returns the root element of the component
     *
     * @protected
     * @returns {ConfigurationType} - the root element of component
     */
    get config() {
      return this._config;
    }
    constructor($root, config) {
      super($root);
      this._config = void 0;
      const childConstructor = this.constructor;
      if (!isObject(childConstructor.defaults)) {
        throw new ConfigError(formatErrorMessage(childConstructor, "Config passed as parameter into constructor but no defaults defined"));
      }
      const datasetConfig = normaliseDataset(childConstructor, this._$root.dataset);
      this._config = mergeConfigs(childConstructor.defaults, config != null ? config : {}, this[configOverride](datasetConfig), datasetConfig);
    }
  };
  function normaliseString(value, property) {
    const trimmedValue = value ? value.trim() : "";
    let output;
    let outputType = property == null ? void 0 : property.type;
    if (!outputType) {
      if (["true", "false"].includes(trimmedValue)) {
        outputType = "boolean";
      }
      if (trimmedValue.length > 0 && isFinite(Number(trimmedValue))) {
        outputType = "number";
      }
    }
    switch (outputType) {
      case "boolean":
        output = trimmedValue === "true";
        break;
      case "number":
        output = Number(trimmedValue);
        break;
      default:
        output = value;
    }
    return output;
  }
  function normaliseDataset(Component2, dataset) {
    if (!isObject(Component2.schema)) {
      throw new ConfigError(formatErrorMessage(Component2, "Config passed as parameter into constructor but no schema defined"));
    }
    const out = {};
    const entries = Object.entries(Component2.schema.properties);
    for (const entry of entries) {
      const [namespace, property] = entry;
      const field = namespace.toString();
      if (field in dataset) {
        out[field] = normaliseString(dataset[field], property);
      }
      if ((property == null ? void 0 : property.type) === "object") {
        out[field] = extractConfigByNamespace(Component2.schema, dataset, namespace);
      }
    }
    return out;
  }
  function normaliseOptions(scopeOrOptions) {
    let $scope = document;
    let onError;
    if (isObject(scopeOrOptions)) {
      const options = scopeOrOptions;
      if (isScope(options.scope) || options.scope === null) {
        $scope = options.scope;
      }
      if (typeof options.onError === "function") {
        onError = options.onError;
      }
    }
    if (isScope(scopeOrOptions)) {
      $scope = scopeOrOptions;
    } else if (scopeOrOptions === null) {
      $scope = null;
    } else if (typeof scopeOrOptions === "function") {
      onError = scopeOrOptions;
    }
    return {
      scope: $scope,
      onError
    };
  }
  function mergeConfigs(...configObjects) {
    const formattedConfigObject = {};
    for (const configObject of configObjects) {
      for (const key of Object.keys(configObject)) {
        const option = formattedConfigObject[key];
        const override = configObject[key];
        if (isObject(option) && isObject(override)) {
          formattedConfigObject[key] = mergeConfigs(option, override);
        } else {
          formattedConfigObject[key] = override;
        }
      }
    }
    return formattedConfigObject;
  }
  function validateConfig(schema, config) {
    const validationErrors = [];
    for (const [name, conditions] of Object.entries(schema)) {
      const errors = [];
      if (Array.isArray(conditions)) {
        for (const {
          required,
          errorMessage
        } of conditions) {
          if (!required.every((key) => !!config[key])) {
            errors.push(errorMessage);
          }
        }
        if (name === "anyOf" && !(conditions.length - errors.length >= 1)) {
          validationErrors.push(...errors);
        }
      }
    }
    return validationErrors;
  }
  function extractConfigByNamespace(schema, dataset, namespace) {
    const property = schema.properties[namespace];
    if ((property == null ? void 0 : property.type) !== "object") {
      return;
    }
    const newObject = {
      [namespace]: {}
    };
    for (const [key, value] of Object.entries(dataset)) {
      let current = newObject;
      const keyParts = key.split(".");
      for (const [index, name] of keyParts.entries()) {
        if (isObject(current)) {
          if (index < keyParts.length - 1) {
            if (!isObject(current[name])) {
              current[name] = {};
            }
            current = current[name];
          } else if (key !== namespace) {
            current[name] = normaliseString(value);
          }
        }
      }
    }
    return newObject[namespace];
  }

  // node_modules/govuk-frontend/dist/govuk/i18n.mjs
  var I18n = class {
    constructor(translations = {}, config = {}) {
      var _config$locale;
      this.translations = void 0;
      this.locale = void 0;
      this.translations = translations;
      this.locale = (_config$locale = config.locale) != null ? _config$locale : document.documentElement.lang || "en";
    }
    t(lookupKey, options) {
      if (!lookupKey) {
        throw new Error("i18n: lookup key missing");
      }
      let translation = this.translations[lookupKey];
      if (typeof (options == null ? void 0 : options.count) === "number" && isObject(translation)) {
        const translationPluralForm = translation[this.getPluralSuffix(lookupKey, options.count)];
        if (translationPluralForm) {
          translation = translationPluralForm;
        }
      }
      if (typeof translation === "string") {
        if (translation.match(/%{(.\S+)}/)) {
          if (!options) {
            throw new Error("i18n: cannot replace placeholders in string if no option data provided");
          }
          return this.replacePlaceholders(translation, options);
        }
        return translation;
      }
      return lookupKey;
    }
    replacePlaceholders(translationString, options) {
      const formatter = Intl.NumberFormat.supportedLocalesOf(this.locale).length ? new Intl.NumberFormat(this.locale) : void 0;
      return translationString.replace(/%{(.\S+)}/g, function(placeholderWithBraces, placeholderKey) {
        if (Object.prototype.hasOwnProperty.call(options, placeholderKey)) {
          const placeholderValue = options[placeholderKey];
          if (placeholderValue === false || typeof placeholderValue !== "number" && typeof placeholderValue !== "string") {
            return "";
          }
          if (typeof placeholderValue === "number") {
            return formatter ? formatter.format(placeholderValue) : `${placeholderValue}`;
          }
          return placeholderValue;
        }
        throw new Error(`i18n: no data found to replace ${placeholderWithBraces} placeholder in string`);
      });
    }
    hasIntlPluralRulesSupport() {
      return Boolean("PluralRules" in window.Intl && Intl.PluralRules.supportedLocalesOf(this.locale).length);
    }
    getPluralSuffix(lookupKey, count) {
      count = Number(count);
      if (!isFinite(count)) {
        return "other";
      }
      const translation = this.translations[lookupKey];
      const preferredForm = this.hasIntlPluralRulesSupport() ? new Intl.PluralRules(this.locale).select(count) : "other";
      if (isObject(translation)) {
        if (preferredForm in translation) {
          return preferredForm;
        } else if ("other" in translation) {
          console.warn(`i18n: Missing plural form ".${preferredForm}" for "${this.locale}" locale. Falling back to ".other".`);
          return "other";
        }
      }
      throw new Error(`i18n: Plural form ".other" is required for "${this.locale}" locale`);
    }
  };

  // node_modules/govuk-frontend/dist/govuk/components/accordion/accordion.mjs
  var Accordion = class _Accordion extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for accordion
     * @param {AccordionConfig} [config] - Accordion config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.i18n = void 0;
      this.controlsClass = "govuk-accordion__controls";
      this.showAllClass = "govuk-accordion__show-all";
      this.showAllTextClass = "govuk-accordion__show-all-text";
      this.sectionClass = "govuk-accordion__section";
      this.sectionExpandedClass = "govuk-accordion__section--expanded";
      this.sectionButtonClass = "govuk-accordion__section-button";
      this.sectionHeaderClass = "govuk-accordion__section-header";
      this.sectionHeadingClass = "govuk-accordion__section-heading";
      this.sectionHeadingDividerClass = "govuk-accordion__section-heading-divider";
      this.sectionHeadingTextClass = "govuk-accordion__section-heading-text";
      this.sectionHeadingTextFocusClass = "govuk-accordion__section-heading-text-focus";
      this.sectionShowHideToggleClass = "govuk-accordion__section-toggle";
      this.sectionShowHideToggleFocusClass = "govuk-accordion__section-toggle-focus";
      this.sectionShowHideTextClass = "govuk-accordion__section-toggle-text";
      this.upChevronIconClass = "govuk-accordion-nav__chevron";
      this.downChevronIconClass = "govuk-accordion-nav__chevron--down";
      this.sectionSummaryClass = "govuk-accordion__section-summary";
      this.sectionSummaryFocusClass = "govuk-accordion__section-summary-focus";
      this.sectionContentClass = "govuk-accordion__section-content";
      this.$sections = void 0;
      this.$showAllButton = null;
      this.$showAllIcon = null;
      this.$showAllText = null;
      this.i18n = new I18n(this.config.i18n);
      const $sections = this.$root.querySelectorAll(`.${this.sectionClass}`);
      if (!$sections.length) {
        throw new ElementError({
          component: _Accordion,
          identifier: `Sections (\`<div class="${this.sectionClass}">\`)`
        });
      }
      this.$sections = $sections;
      this.initControls();
      this.initSectionHeaders();
      this.updateShowAllButton(this.areAllSectionsOpen());
    }
    initControls() {
      this.$showAllButton = document.createElement("button");
      this.$showAllButton.setAttribute("type", "button");
      this.$showAllButton.setAttribute("class", this.showAllClass);
      this.$showAllButton.setAttribute("aria-expanded", "false");
      this.$showAllIcon = document.createElement("span");
      this.$showAllIcon.classList.add(this.upChevronIconClass);
      this.$showAllButton.appendChild(this.$showAllIcon);
      const $accordionControls = document.createElement("div");
      $accordionControls.setAttribute("class", this.controlsClass);
      $accordionControls.appendChild(this.$showAllButton);
      this.$root.insertBefore($accordionControls, this.$root.firstChild);
      this.$showAllText = document.createElement("span");
      this.$showAllText.classList.add(this.showAllTextClass);
      this.$showAllButton.appendChild(this.$showAllText);
      this.$showAllButton.addEventListener("click", () => this.onShowOrHideAllToggle());
      if ("onbeforematch" in document) {
        document.addEventListener("beforematch", (event) => this.onBeforeMatch(event));
      }
    }
    initSectionHeaders() {
      this.$sections.forEach(($section, i) => {
        const $header = $section.querySelector(`.${this.sectionHeaderClass}`);
        if (!$header) {
          throw new ElementError({
            component: _Accordion,
            identifier: `Section headers (\`<div class="${this.sectionHeaderClass}">\`)`
          });
        }
        this.constructHeaderMarkup($header, i);
        this.setExpanded(this.isExpanded($section), $section);
        $header.addEventListener("click", () => this.onSectionToggle($section));
        this.setInitialState($section);
      });
    }
    constructHeaderMarkup($header, index) {
      const $span = $header.querySelector(`.${this.sectionButtonClass}`);
      const $heading = $header.querySelector(`.${this.sectionHeadingClass}`);
      const $summary = $header.querySelector(`.${this.sectionSummaryClass}`);
      if (!$heading) {
        throw new ElementError({
          component: _Accordion,
          identifier: `Section heading (\`.${this.sectionHeadingClass}\`)`
        });
      }
      if (!$span) {
        throw new ElementError({
          component: _Accordion,
          identifier: `Section button placeholder (\`<span class="${this.sectionButtonClass}">\`)`
        });
      }
      const $button = document.createElement("button");
      $button.setAttribute("type", "button");
      $button.setAttribute("aria-controls", `${this.$root.id}-content-${index + 1}`);
      for (const attr of Array.from($span.attributes)) {
        if (attr.name !== "id") {
          $button.setAttribute(attr.name, attr.value);
        }
      }
      const $headingText = document.createElement("span");
      $headingText.classList.add(this.sectionHeadingTextClass);
      $headingText.id = $span.id;
      const $headingTextFocus = document.createElement("span");
      $headingTextFocus.classList.add(this.sectionHeadingTextFocusClass);
      $headingText.appendChild($headingTextFocus);
      Array.from($span.childNodes).forEach(($child) => $headingTextFocus.appendChild($child));
      const $showHideToggle = document.createElement("span");
      $showHideToggle.classList.add(this.sectionShowHideToggleClass);
      $showHideToggle.setAttribute("data-nosnippet", "");
      const $showHideToggleFocus = document.createElement("span");
      $showHideToggleFocus.classList.add(this.sectionShowHideToggleFocusClass);
      $showHideToggle.appendChild($showHideToggleFocus);
      const $showHideText = document.createElement("span");
      const $showHideIcon = document.createElement("span");
      $showHideIcon.classList.add(this.upChevronIconClass);
      $showHideToggleFocus.appendChild($showHideIcon);
      $showHideText.classList.add(this.sectionShowHideTextClass);
      $showHideToggleFocus.appendChild($showHideText);
      $button.appendChild($headingText);
      $button.appendChild(this.getButtonPunctuationEl());
      if ($summary) {
        const $summarySpan = document.createElement("span");
        const $summarySpanFocus = document.createElement("span");
        $summarySpanFocus.classList.add(this.sectionSummaryFocusClass);
        $summarySpan.appendChild($summarySpanFocus);
        for (const attr of Array.from($summary.attributes)) {
          $summarySpan.setAttribute(attr.name, attr.value);
        }
        Array.from($summary.childNodes).forEach(($child) => $summarySpanFocus.appendChild($child));
        $summary.remove();
        $button.appendChild($summarySpan);
        $button.appendChild(this.getButtonPunctuationEl());
      }
      $button.appendChild($showHideToggle);
      $heading.removeChild($span);
      $heading.appendChild($button);
    }
    onBeforeMatch(event) {
      const $fragment = event.target;
      if (!($fragment instanceof Element)) {
        return;
      }
      const $section = $fragment.closest(`.${this.sectionClass}`);
      if ($section) {
        this.setExpanded(true, $section);
      }
    }
    onSectionToggle($section) {
      const nowExpanded = !this.isExpanded($section);
      this.setExpanded(nowExpanded, $section);
      this.storeState($section, nowExpanded);
    }
    onShowOrHideAllToggle() {
      const nowExpanded = !this.areAllSectionsOpen();
      this.$sections.forEach(($section) => {
        this.setExpanded(nowExpanded, $section);
        this.storeState($section, nowExpanded);
      });
      this.updateShowAllButton(nowExpanded);
    }
    setExpanded(expanded, $section) {
      const $showHideIcon = $section.querySelector(`.${this.upChevronIconClass}`);
      const $showHideText = $section.querySelector(`.${this.sectionShowHideTextClass}`);
      const $button = $section.querySelector(`.${this.sectionButtonClass}`);
      const $content = $section.querySelector(`.${this.sectionContentClass}`);
      if (!$content) {
        throw new ElementError({
          component: _Accordion,
          identifier: `Section content (\`<div class="${this.sectionContentClass}">\`)`
        });
      }
      if (!$showHideIcon || !$showHideText || !$button) {
        return;
      }
      const newButtonText = expanded ? this.i18n.t("hideSection") : this.i18n.t("showSection");
      $showHideText.textContent = newButtonText;
      $button.setAttribute("aria-expanded", `${expanded}`);
      const ariaLabelParts = [];
      const $headingText = $section.querySelector(`.${this.sectionHeadingTextClass}`);
      if ($headingText) {
        ariaLabelParts.push($headingText.textContent.trim());
      }
      const $summary = $section.querySelector(`.${this.sectionSummaryClass}`);
      if ($summary) {
        ariaLabelParts.push($summary.textContent.trim());
      }
      const ariaLabelMessage = expanded ? this.i18n.t("hideSectionAriaLabel") : this.i18n.t("showSectionAriaLabel");
      ariaLabelParts.push(ariaLabelMessage);
      $button.setAttribute("aria-label", ariaLabelParts.join(" , "));
      if (expanded) {
        $content.removeAttribute("hidden");
        $section.classList.add(this.sectionExpandedClass);
        $showHideIcon.classList.remove(this.downChevronIconClass);
      } else {
        $content.setAttribute("hidden", "until-found");
        $section.classList.remove(this.sectionExpandedClass);
        $showHideIcon.classList.add(this.downChevronIconClass);
      }
      this.updateShowAllButton(this.areAllSectionsOpen());
    }
    isExpanded($section) {
      return $section.classList.contains(this.sectionExpandedClass);
    }
    areAllSectionsOpen() {
      return Array.from(this.$sections).every(($section) => this.isExpanded($section));
    }
    updateShowAllButton(expanded) {
      if (!this.$showAllButton || !this.$showAllText || !this.$showAllIcon) {
        return;
      }
      this.$showAllButton.setAttribute("aria-expanded", expanded.toString());
      this.$showAllText.textContent = expanded ? this.i18n.t("hideAllSections") : this.i18n.t("showAllSections");
      this.$showAllIcon.classList.toggle(this.downChevronIconClass, !expanded);
    }
    /**
     * Get the identifier for a section
     *
     * We need a unique way of identifying each content in the Accordion.
     * Since an `#id` should be unique and an `id` is required for `aria-`
     * attributes `id` can be safely used.
     *
     * @param {Element} $section - Section element
     * @returns {string | undefined | null} Identifier for section
     */
    getIdentifier($section) {
      const $button = $section.querySelector(`.${this.sectionButtonClass}`);
      return $button == null ? void 0 : $button.getAttribute("aria-controls");
    }
    storeState($section, isExpanded) {
      if (!this.config.rememberExpanded) {
        return;
      }
      const id = this.getIdentifier($section);
      if (id) {
        try {
          window.sessionStorage.setItem(id, isExpanded.toString());
        } catch (_unused) {
        }
      }
    }
    setInitialState($section) {
      if (!this.config.rememberExpanded) {
        return;
      }
      const id = this.getIdentifier($section);
      if (id) {
        try {
          const state = window.sessionStorage.getItem(id);
          if (state !== null) {
            this.setExpanded(state === "true", $section);
          }
        } catch (_unused2) {
        }
      }
    }
    getButtonPunctuationEl() {
      const $punctuationEl = document.createElement("span");
      $punctuationEl.classList.add("govuk-visually-hidden", this.sectionHeadingDividerClass);
      $punctuationEl.textContent = ", ";
      return $punctuationEl;
    }
  };
  Accordion.moduleName = "govuk-accordion";
  Accordion.defaults = Object.freeze({
    i18n: {
      hideAllSections: "Hide all sections",
      hideSection: "Hide",
      hideSectionAriaLabel: "Hide this section",
      showAllSections: "Show all sections",
      showSection: "Show",
      showSectionAriaLabel: "Show this section"
    },
    rememberExpanded: true
  });
  Accordion.schema = Object.freeze({
    properties: {
      i18n: {
        type: "object"
      },
      rememberExpanded: {
        type: "boolean"
      }
    }
  });

  // node_modules/govuk-frontend/dist/govuk/components/button/button.mjs
  var DEBOUNCE_TIMEOUT_IN_SECONDS = 1;
  var Button = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for button
     * @param {ButtonConfig} [config] - Button config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.debounceFormSubmitTimer = null;
      this.$root.addEventListener("keydown", (event) => this.handleKeyDown(event));
      this.$root.addEventListener("click", (event) => this.debounce(event));
    }
    handleKeyDown(event) {
      const $target = event.target;
      if (event.key !== " ") {
        return;
      }
      if ($target instanceof HTMLElement && $target.getAttribute("role") === "button") {
        event.preventDefault();
        $target.click();
      }
    }
    debounce(event) {
      if (!this.config.preventDoubleClick) {
        return;
      }
      if (this.debounceFormSubmitTimer) {
        event.preventDefault();
        return false;
      }
      this.debounceFormSubmitTimer = window.setTimeout(() => {
        this.debounceFormSubmitTimer = null;
      }, DEBOUNCE_TIMEOUT_IN_SECONDS * 1e3);
    }
  };
  Button.moduleName = "govuk-button";
  Button.defaults = Object.freeze({
    preventDoubleClick: false
  });
  Button.schema = Object.freeze({
    properties: {
      preventDoubleClick: {
        type: "boolean"
      }
    }
  });

  // node_modules/govuk-frontend/dist/govuk/common/closest-attribute-value.mjs
  function closestAttributeValue($element, attributeName) {
    const $closestElementWithAttribute = $element.closest(`[${attributeName}]`);
    return $closestElementWithAttribute ? $closestElementWithAttribute.getAttribute(attributeName) : null;
  }

  // node_modules/govuk-frontend/dist/govuk/components/character-count/character-count.mjs
  var CharacterCount = class _CharacterCount extends ConfigurableComponent {
    [configOverride](datasetConfig) {
      let configOverrides = {};
      if ("maxwords" in datasetConfig || "maxlength" in datasetConfig) {
        configOverrides = {
          maxlength: void 0,
          maxwords: void 0
        };
      }
      return configOverrides;
    }
    /**
     * @param {Element | null} $root - HTML element to use for character count
     * @param {CharacterCountConfig} [config] - Character count config
     */
    constructor($root, config = {}) {
      var _ref, _this$config$maxwords;
      super($root, config);
      this.$textarea = void 0;
      this.count = 0;
      this.$visibleCountMessage = void 0;
      this.$screenReaderCountMessage = void 0;
      this.lastInputTimestamp = null;
      this.lastInputValue = "";
      this.valueChecker = null;
      this.i18n = void 0;
      this.maxLength = void 0;
      const $textarea = this.$root.querySelector(".govuk-js-character-count");
      if (!($textarea instanceof HTMLTextAreaElement || $textarea instanceof HTMLInputElement)) {
        throw new ElementError({
          component: _CharacterCount,
          element: $textarea,
          expectedType: "HTMLTextareaElement or HTMLInputElement",
          identifier: "Form field (`.govuk-js-character-count`)"
        });
      }
      const errors = validateConfig(_CharacterCount.schema, this.config);
      if (errors[0]) {
        throw new ConfigError(formatErrorMessage(_CharacterCount, errors[0]));
      }
      this.i18n = new I18n(this.config.i18n, {
        locale: closestAttributeValue(this.$root, "lang")
      });
      this.maxLength = (_ref = (_this$config$maxwords = this.config.maxwords) != null ? _this$config$maxwords : this.config.maxlength) != null ? _ref : Infinity;
      this.$textarea = $textarea;
      const textareaDescriptionId = `${this.$textarea.id}-info`;
      const $textareaDescription = document.getElementById(textareaDescriptionId);
      if (!$textareaDescription) {
        throw new ElementError({
          component: _CharacterCount,
          element: $textareaDescription,
          identifier: `Count message (\`id="${textareaDescriptionId}"\`)`
        });
      }
      this.$errorMessage = this.$root.querySelector(".govuk-error-message");
      if ($textareaDescription.textContent.match(/^\s*$/)) {
        $textareaDescription.textContent = this.i18n.t("textareaDescription", {
          count: this.maxLength
        });
      }
      this.$textarea.insertAdjacentElement("afterend", $textareaDescription);
      const $screenReaderCountMessage = document.createElement("div");
      $screenReaderCountMessage.className = "govuk-character-count__sr-status govuk-visually-hidden";
      $screenReaderCountMessage.setAttribute("aria-live", "polite");
      this.$screenReaderCountMessage = $screenReaderCountMessage;
      $textareaDescription.insertAdjacentElement("afterend", $screenReaderCountMessage);
      const $visibleCountMessage = document.createElement("div");
      $visibleCountMessage.className = $textareaDescription.className;
      $visibleCountMessage.classList.add("govuk-character-count__status");
      $visibleCountMessage.setAttribute("aria-hidden", "true");
      this.$visibleCountMessage = $visibleCountMessage;
      $textareaDescription.insertAdjacentElement("afterend", $visibleCountMessage);
      $textareaDescription.classList.add("govuk-visually-hidden");
      this.$textarea.removeAttribute("maxlength");
      this.bindChangeEvents();
      window.addEventListener("pageshow", () => {
        if (this.$textarea.value !== this.$textarea.textContent) {
          this.updateCount();
          this.updateCountMessage();
        }
      });
      this.updateCount();
      this.updateCountMessage();
    }
    bindChangeEvents() {
      this.$textarea.addEventListener("input", () => this.handleInput());
      this.$textarea.addEventListener("focus", () => this.handleFocus());
      this.$textarea.addEventListener("blur", () => this.handleBlur());
    }
    handleInput() {
      this.updateCount();
      this.updateVisibleCountMessage();
      this.lastInputTimestamp = Date.now();
    }
    handleFocus() {
      this.valueChecker = window.setInterval(() => {
        if (!this.lastInputTimestamp || Date.now() - 500 >= this.lastInputTimestamp) {
          this.updateIfValueChanged();
        }
      }, 1e3);
    }
    handleBlur() {
      if (this.valueChecker) {
        window.clearInterval(this.valueChecker);
      }
    }
    updateIfValueChanged() {
      if (this.$textarea.value !== this.lastInputValue) {
        this.lastInputValue = this.$textarea.value;
        this.updateCountMessage();
      }
    }
    updateCountMessage() {
      this.updateVisibleCountMessage();
      this.updateScreenReaderCountMessage();
    }
    updateVisibleCountMessage() {
      const remainingNumber = this.maxLength - this.count;
      const isError = remainingNumber < 0;
      this.$visibleCountMessage.classList.toggle("govuk-character-count__message--disabled", !this.isOverThreshold());
      if (!this.$errorMessage) {
        this.$textarea.classList.toggle("govuk-textarea--error", isError);
      }
      this.$visibleCountMessage.classList.toggle("govuk-error-message", isError);
      this.$visibleCountMessage.classList.toggle("govuk-hint", !isError);
      this.$visibleCountMessage.textContent = this.getCountMessage();
    }
    updateScreenReaderCountMessage() {
      if (this.isOverThreshold()) {
        this.$screenReaderCountMessage.removeAttribute("aria-hidden");
      } else {
        this.$screenReaderCountMessage.setAttribute("aria-hidden", "true");
      }
      this.$screenReaderCountMessage.textContent = this.getCountMessage();
    }
    updateCount() {
      const text = this.$textarea.value;
      if (this.config.maxwords) {
        var _text$match;
        const tokens = (_text$match = text.match(/\S+/g)) != null ? _text$match : [];
        this.count = tokens.length;
        return;
      }
      this.count = text.length;
    }
    getCountMessage() {
      const remainingNumber = this.maxLength - this.count;
      const countType = this.config.maxwords ? "words" : "characters";
      return this.formatCountMessage(remainingNumber, countType);
    }
    formatCountMessage(remainingNumber, countType) {
      if (remainingNumber === 0) {
        return this.i18n.t(`${countType}AtLimit`);
      }
      const translationKeySuffix = remainingNumber < 0 ? "OverLimit" : "UnderLimit";
      return this.i18n.t(`${countType}${translationKeySuffix}`, {
        count: Math.abs(remainingNumber)
      });
    }
    isOverThreshold() {
      if (!this.config.threshold) {
        return true;
      }
      const currentLength = this.count;
      const maxLength = this.maxLength;
      const thresholdValue = maxLength * this.config.threshold / 100;
      return thresholdValue <= currentLength;
    }
  };
  CharacterCount.moduleName = "govuk-character-count";
  CharacterCount.defaults = Object.freeze({
    threshold: 0,
    i18n: {
      charactersUnderLimit: {
        one: "You have %{count} character remaining",
        other: "You have %{count} characters remaining"
      },
      charactersAtLimit: "You have 0 characters remaining",
      charactersOverLimit: {
        one: "You have %{count} character too many",
        other: "You have %{count} characters too many"
      },
      wordsUnderLimit: {
        one: "You have %{count} word remaining",
        other: "You have %{count} words remaining"
      },
      wordsAtLimit: "You have 0 words remaining",
      wordsOverLimit: {
        one: "You have %{count} word too many",
        other: "You have %{count} words too many"
      },
      textareaDescription: {
        other: ""
      }
    }
  });
  CharacterCount.schema = Object.freeze({
    properties: {
      i18n: {
        type: "object"
      },
      maxwords: {
        type: "number"
      },
      maxlength: {
        type: "number"
      },
      threshold: {
        type: "number"
      }
    },
    anyOf: [{
      required: ["maxwords"],
      errorMessage: 'Either "maxlength" or "maxwords" must be provided'
    }, {
      required: ["maxlength"],
      errorMessage: 'Either "maxlength" or "maxwords" must be provided'
    }]
  });

  // node_modules/govuk-frontend/dist/govuk/components/checkboxes/checkboxes.mjs
  var Checkboxes = class _Checkboxes extends Component {
    /**
     * Checkboxes can be associated with a 'conditionally revealed' content block
     * – for example, a checkbox for 'Phone' could reveal an additional form field
     * for the user to enter their phone number.
     *
     * These associations are made using a `data-aria-controls` attribute, which
     * is promoted to an aria-controls attribute during initialisation.
     *
     * We also need to restore the state of any conditional reveals on the page
     * (for example if the user has navigated back), and set up event handlers to
     * keep the reveal in sync with the checkbox state.
     *
     * @param {Element | null} $root - HTML element to use for checkboxes
     */
    constructor($root) {
      super($root);
      this.$inputs = void 0;
      const $inputs = this.$root.querySelectorAll('input[type="checkbox"]');
      if (!$inputs.length) {
        throw new ElementError({
          component: _Checkboxes,
          identifier: 'Form inputs (`<input type="checkbox">`)'
        });
      }
      this.$inputs = $inputs;
      this.$inputs.forEach(($input) => {
        const targetId = $input.getAttribute("data-aria-controls");
        if (!targetId) {
          return;
        }
        if (!document.getElementById(targetId)) {
          throw new ElementError({
            component: _Checkboxes,
            identifier: `Conditional reveal (\`id="${targetId}"\`)`
          });
        }
        $input.setAttribute("aria-controls", targetId);
        $input.removeAttribute("data-aria-controls");
      });
      window.addEventListener("pageshow", () => this.syncAllConditionalReveals());
      this.syncAllConditionalReveals();
      this.$root.addEventListener("click", (event) => this.handleClick(event));
    }
    syncAllConditionalReveals() {
      this.$inputs.forEach(($input) => this.syncConditionalRevealWithInputState($input));
    }
    syncConditionalRevealWithInputState($input) {
      const targetId = $input.getAttribute("aria-controls");
      if (!targetId) {
        return;
      }
      const $target = document.getElementById(targetId);
      if ($target != null && $target.classList.contains("govuk-checkboxes__conditional")) {
        const inputIsChecked = $input.checked;
        $input.setAttribute("aria-expanded", inputIsChecked.toString());
        $target.classList.toggle("govuk-checkboxes__conditional--hidden", !inputIsChecked);
      }
    }
    unCheckAllInputsExcept($input) {
      const allInputsWithSameName = document.querySelectorAll(`input[type="checkbox"][name="${$input.name}"]`);
      allInputsWithSameName.forEach(($inputWithSameName) => {
        const hasSameFormOwner = $input.form === $inputWithSameName.form;
        if (hasSameFormOwner && $inputWithSameName !== $input) {
          $inputWithSameName.checked = false;
          this.syncConditionalRevealWithInputState($inputWithSameName);
        }
      });
    }
    unCheckExclusiveInputs($input) {
      const allInputsWithSameNameAndExclusiveBehaviour = document.querySelectorAll(`input[data-behaviour="exclusive"][type="checkbox"][name="${$input.name}"]`);
      allInputsWithSameNameAndExclusiveBehaviour.forEach(($exclusiveInput) => {
        const hasSameFormOwner = $input.form === $exclusiveInput.form;
        if (hasSameFormOwner) {
          $exclusiveInput.checked = false;
          this.syncConditionalRevealWithInputState($exclusiveInput);
        }
      });
    }
    handleClick(event) {
      const $clickedInput = event.target;
      if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== "checkbox") {
        return;
      }
      const hasAriaControls = $clickedInput.getAttribute("aria-controls");
      if (hasAriaControls) {
        this.syncConditionalRevealWithInputState($clickedInput);
      }
      if (!$clickedInput.checked) {
        return;
      }
      const hasBehaviourExclusive = $clickedInput.getAttribute("data-behaviour") === "exclusive";
      if (hasBehaviourExclusive) {
        this.unCheckAllInputsExcept($clickedInput);
      } else {
        this.unCheckExclusiveInputs($clickedInput);
      }
    }
  };
  Checkboxes.moduleName = "govuk-checkboxes";

  // node_modules/govuk-frontend/dist/govuk/components/error-summary/error-summary.mjs
  var ErrorSummary = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for error summary
     * @param {ErrorSummaryConfig} [config] - Error summary config
     */
    constructor($root, config = {}) {
      super($root, config);
      if (!this.config.disableAutoFocus) {
        setFocus(this.$root);
      }
      this.$root.addEventListener("click", (event) => this.handleClick(event));
    }
    handleClick(event) {
      const $target = event.target;
      if ($target && this.focusTarget($target)) {
        event.preventDefault();
      }
    }
    focusTarget($target) {
      if (!($target instanceof HTMLAnchorElement)) {
        return false;
      }
      const inputId = $target.hash.replace("#", "");
      if (!inputId) {
        return false;
      }
      const $input = document.getElementById(inputId);
      if (!$input) {
        return false;
      }
      const $legendOrLabel = this.getAssociatedLegendOrLabel($input);
      if (!$legendOrLabel) {
        return false;
      }
      $legendOrLabel.scrollIntoView();
      $input.focus({
        preventScroll: true
      });
      return true;
    }
    getAssociatedLegendOrLabel($input) {
      var _document$querySelect;
      const $fieldset = $input.closest("fieldset");
      if ($fieldset) {
        const $legends = $fieldset.getElementsByTagName("legend");
        if ($legends.length) {
          const $candidateLegend = $legends[0];
          if ($input instanceof HTMLInputElement && ($input.type === "checkbox" || $input.type === "radio")) {
            return $candidateLegend;
          }
          const legendTop = $candidateLegend.getBoundingClientRect().top;
          const inputRect = $input.getBoundingClientRect();
          if (inputRect.height && window.innerHeight) {
            const inputBottom = inputRect.top + inputRect.height;
            if (inputBottom - legendTop < window.innerHeight / 2) {
              return $candidateLegend;
            }
          }
        }
      }
      return (_document$querySelect = document.querySelector(`label[for='${$input.getAttribute("id")}']`)) != null ? _document$querySelect : $input.closest("label");
    }
  };
  ErrorSummary.moduleName = "govuk-error-summary";
  ErrorSummary.defaults = Object.freeze({
    disableAutoFocus: false
  });
  ErrorSummary.schema = Object.freeze({
    properties: {
      disableAutoFocus: {
        type: "boolean"
      }
    }
  });

  // node_modules/govuk-frontend/dist/govuk/components/exit-this-page/exit-this-page.mjs
  var ExitThisPage = class _ExitThisPage extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element that wraps the Exit This Page button
     * @param {ExitThisPageConfig} [config] - Exit This Page config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.i18n = void 0;
      this.$button = void 0;
      this.$skiplinkButton = null;
      this.$updateSpan = null;
      this.$indicatorContainer = null;
      this.$overlay = null;
      this.keypressCounter = 0;
      this.lastKeyWasModified = false;
      this.timeoutTime = 5e3;
      this.keypressTimeoutId = null;
      this.timeoutMessageId = null;
      const $button = this.$root.querySelector(".govuk-exit-this-page__button");
      if (!($button instanceof HTMLAnchorElement)) {
        throw new ElementError({
          component: _ExitThisPage,
          element: $button,
          expectedType: "HTMLAnchorElement",
          identifier: "Button (`.govuk-exit-this-page__button`)"
        });
      }
      this.i18n = new I18n(this.config.i18n);
      this.$button = $button;
      const $skiplinkButton = document.querySelector(".govuk-js-exit-this-page-skiplink");
      if ($skiplinkButton instanceof HTMLAnchorElement) {
        this.$skiplinkButton = $skiplinkButton;
      }
      this.buildIndicator();
      this.initUpdateSpan();
      this.initButtonClickHandler();
      if (!("govukFrontendExitThisPageKeypress" in document.body.dataset)) {
        document.addEventListener("keyup", this.handleKeypress.bind(this), true);
        document.body.dataset.govukFrontendExitThisPageKeypress = "true";
      }
      window.addEventListener("pageshow", this.resetPage.bind(this));
    }
    initUpdateSpan() {
      this.$updateSpan = document.createElement("span");
      this.$updateSpan.setAttribute("role", "status");
      this.$updateSpan.className = "govuk-visually-hidden";
      this.$root.appendChild(this.$updateSpan);
    }
    initButtonClickHandler() {
      this.$button.addEventListener("click", this.handleClick.bind(this));
      if (this.$skiplinkButton) {
        this.$skiplinkButton.addEventListener("click", this.handleClick.bind(this));
      }
    }
    buildIndicator() {
      this.$indicatorContainer = document.createElement("div");
      this.$indicatorContainer.className = "govuk-exit-this-page__indicator";
      this.$indicatorContainer.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 3; i++) {
        const $indicator = document.createElement("div");
        $indicator.className = "govuk-exit-this-page__indicator-light";
        this.$indicatorContainer.appendChild($indicator);
      }
      this.$button.appendChild(this.$indicatorContainer);
    }
    updateIndicator() {
      if (!this.$indicatorContainer) {
        return;
      }
      this.$indicatorContainer.classList.toggle("govuk-exit-this-page__indicator--visible", this.keypressCounter > 0);
      const $indicators = this.$indicatorContainer.querySelectorAll(".govuk-exit-this-page__indicator-light");
      $indicators.forEach(($indicator, index) => {
        $indicator.classList.toggle("govuk-exit-this-page__indicator-light--on", index < this.keypressCounter);
      });
    }
    exitPage() {
      if (!this.$updateSpan) {
        return;
      }
      this.$updateSpan.textContent = "";
      document.body.classList.add("govuk-exit-this-page-hide-content");
      this.$overlay = document.createElement("div");
      this.$overlay.className = "govuk-exit-this-page-overlay";
      this.$overlay.setAttribute("role", "alert");
      document.body.appendChild(this.$overlay);
      this.$overlay.textContent = this.i18n.t("activated");
      window.location.href = this.$button.href;
    }
    handleClick(event) {
      event.preventDefault();
      this.exitPage();
    }
    handleKeypress(event) {
      if (!this.$updateSpan) {
        return;
      }
      if (event.key === "Shift" && !this.lastKeyWasModified) {
        this.keypressCounter += 1;
        this.updateIndicator();
        if (this.timeoutMessageId) {
          window.clearTimeout(this.timeoutMessageId);
          this.timeoutMessageId = null;
        }
        if (this.keypressCounter >= 3) {
          this.keypressCounter = 0;
          if (this.keypressTimeoutId) {
            window.clearTimeout(this.keypressTimeoutId);
            this.keypressTimeoutId = null;
          }
          this.exitPage();
        } else {
          if (this.keypressCounter === 1) {
            this.$updateSpan.textContent = this.i18n.t("pressTwoMoreTimes");
          } else {
            this.$updateSpan.textContent = this.i18n.t("pressOneMoreTime");
          }
        }
        this.setKeypressTimer();
      } else if (this.keypressTimeoutId) {
        this.resetKeypressTimer();
      }
      this.lastKeyWasModified = event.shiftKey;
    }
    setKeypressTimer() {
      if (this.keypressTimeoutId) {
        window.clearTimeout(this.keypressTimeoutId);
      }
      this.keypressTimeoutId = window.setTimeout(this.resetKeypressTimer.bind(this), this.timeoutTime);
    }
    resetKeypressTimer() {
      if (!this.$updateSpan) {
        return;
      }
      if (this.keypressTimeoutId) {
        window.clearTimeout(this.keypressTimeoutId);
        this.keypressTimeoutId = null;
      }
      const $updateSpan = this.$updateSpan;
      this.keypressCounter = 0;
      $updateSpan.textContent = this.i18n.t("timedOut");
      this.timeoutMessageId = window.setTimeout(() => {
        $updateSpan.textContent = "";
      }, this.timeoutTime);
      this.updateIndicator();
    }
    resetPage() {
      document.body.classList.remove("govuk-exit-this-page-hide-content");
      if (this.$overlay) {
        this.$overlay.remove();
        this.$overlay = null;
      }
      if (this.$updateSpan) {
        this.$updateSpan.setAttribute("role", "status");
        this.$updateSpan.textContent = "";
      }
      this.updateIndicator();
      if (this.keypressTimeoutId) {
        window.clearTimeout(this.keypressTimeoutId);
      }
      if (this.timeoutMessageId) {
        window.clearTimeout(this.timeoutMessageId);
      }
    }
  };
  ExitThisPage.moduleName = "govuk-exit-this-page";
  ExitThisPage.defaults = Object.freeze({
    i18n: {
      activated: "Loading.",
      timedOut: "Exit this page expired.",
      pressTwoMoreTimes: "Shift, press 2 more times to exit.",
      pressOneMoreTime: "Shift, press 1 more time to exit."
    }
  });
  ExitThisPage.schema = Object.freeze({
    properties: {
      i18n: {
        type: "object"
      }
    }
  });

  // node_modules/govuk-frontend/dist/govuk/components/file-upload/file-upload.mjs
  var FileUpload = class _FileUpload extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - File input element
     * @param {FileUploadConfig} [config] - File Upload config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.$input = void 0;
      this.$button = void 0;
      this.$status = void 0;
      this.i18n = void 0;
      this.id = void 0;
      this.$announcements = void 0;
      this.enteredAnotherElement = void 0;
      const $input = this.$root.querySelector("input");
      if ($input === null) {
        throw new ElementError({
          component: _FileUpload,
          identifier: 'File inputs (`<input type="file">`)'
        });
      }
      if ($input.type !== "file") {
        throw new ElementError(formatErrorMessage(_FileUpload, 'File input (`<input type="file">`) attribute (`type`) is not `file`'));
      }
      this.$input = $input;
      if (!this.$input.id) {
        throw new ElementError({
          component: _FileUpload,
          identifier: 'File input (`<input type="file">`) attribute (`id`)'
        });
      }
      this.id = this.$input.id;
      this.i18n = new I18n(this.config.i18n, {
        locale: closestAttributeValue(this.$root, "lang")
      });
      const $label = this.findLabel();
      if (!$label.id) {
        $label.id = `${this.id}-label`;
      }
      this.$input.id = `${this.id}-input`;
      this.$input.setAttribute("hidden", "true");
      const $button = document.createElement("button");
      $button.classList.add("govuk-file-upload-button");
      $button.type = "button";
      $button.id = this.id;
      $button.classList.add("govuk-file-upload-button--empty");
      const ariaDescribedBy = this.$input.getAttribute("aria-describedby");
      if (ariaDescribedBy) {
        $button.setAttribute("aria-describedby", ariaDescribedBy);
      }
      const $status = document.createElement("span");
      $status.className = "govuk-body govuk-file-upload-button__status";
      $status.setAttribute("aria-live", "polite");
      $status.innerText = this.i18n.t("noFileChosen");
      $button.appendChild($status);
      const commaSpan = document.createElement("span");
      commaSpan.className = "govuk-visually-hidden";
      commaSpan.innerText = ", ";
      commaSpan.id = `${this.id}-comma`;
      $button.appendChild(commaSpan);
      const containerSpan = document.createElement("span");
      containerSpan.className = "govuk-file-upload-button__pseudo-button-container";
      const buttonSpan = document.createElement("span");
      buttonSpan.className = "govuk-button govuk-button--secondary govuk-file-upload-button__pseudo-button";
      buttonSpan.innerText = this.i18n.t("chooseFilesButton");
      containerSpan.appendChild(buttonSpan);
      containerSpan.insertAdjacentText("beforeend", " ");
      const instructionSpan = document.createElement("span");
      instructionSpan.className = "govuk-body govuk-file-upload-button__instruction";
      instructionSpan.innerText = this.i18n.t("dropInstruction");
      containerSpan.appendChild(instructionSpan);
      $button.appendChild(containerSpan);
      $button.setAttribute("aria-labelledby", `${$label.id} ${commaSpan.id} ${$button.id}`);
      $button.addEventListener("click", this.onClick.bind(this));
      $button.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      this.$root.insertAdjacentElement("afterbegin", $button);
      this.$input.setAttribute("tabindex", "-1");
      this.$input.setAttribute("aria-hidden", "true");
      this.$button = $button;
      this.$status = $status;
      this.$input.addEventListener("change", this.onChange.bind(this));
      this.updateDisabledState();
      this.observeDisabledState();
      this.$announcements = document.createElement("span");
      this.$announcements.classList.add("govuk-file-upload-announcements");
      this.$announcements.classList.add("govuk-visually-hidden");
      this.$announcements.setAttribute("aria-live", "assertive");
      this.$root.insertAdjacentElement("afterend", this.$announcements);
      this.$button.addEventListener("drop", this.onDrop.bind(this));
      document.addEventListener("dragenter", this.updateDropzoneVisibility.bind(this));
      document.addEventListener("dragenter", () => {
        this.enteredAnotherElement = true;
      });
      document.addEventListener("dragleave", () => {
        if (!this.enteredAnotherElement && !this.$button.disabled) {
          this.hideDraggingState();
          this.$announcements.innerText = this.i18n.t("leftDropZone");
        }
        this.enteredAnotherElement = false;
      });
    }
    updateDropzoneVisibility(event) {
      if (this.$button.disabled) return;
      if (event.target instanceof Node) {
        if (this.$root.contains(event.target)) {
          if (event.dataTransfer && this.canDrop(event.dataTransfer)) {
            if (!this.$button.classList.contains("govuk-file-upload-button--dragging")) {
              this.showDraggingState();
              this.$announcements.innerText = this.i18n.t("enteredDropZone");
            }
          }
        } else {
          if (this.$button.classList.contains("govuk-file-upload-button--dragging")) {
            this.hideDraggingState();
            this.$announcements.innerText = this.i18n.t("leftDropZone");
          }
        }
      }
    }
    showDraggingState() {
      this.$button.classList.add("govuk-file-upload-button--dragging");
    }
    hideDraggingState() {
      this.$button.classList.remove("govuk-file-upload-button--dragging");
    }
    onDrop(event) {
      event.preventDefault();
      if (event.dataTransfer && this.canFillInput(event.dataTransfer)) {
        this.$input.files = event.dataTransfer.files;
        this.$input.dispatchEvent(new CustomEvent("change"));
        this.hideDraggingState();
      }
    }
    canFillInput(dataTransfer) {
      return this.matchesInputCapacity(dataTransfer.files.length);
    }
    canDrop(dataTransfer) {
      if (dataTransfer.items.length) {
        return this.matchesInputCapacity(countFileItems(dataTransfer.items));
      }
      if (dataTransfer.types.length) {
        return dataTransfer.types.includes("Files");
      }
      return true;
    }
    matchesInputCapacity(numberOfFiles) {
      if (this.$input.multiple) {
        return numberOfFiles > 0;
      }
      return numberOfFiles === 1;
    }
    onChange() {
      const fileCount = this.$input.files.length;
      if (fileCount === 0) {
        this.$status.innerText = this.i18n.t("noFileChosen");
        this.$button.classList.add("govuk-file-upload-button--empty");
      } else {
        if (fileCount === 1) {
          this.$status.innerText = this.$input.files[0].name;
        } else {
          this.$status.innerText = this.i18n.t("multipleFilesChosen", {
            count: fileCount
          });
        }
        this.$button.classList.remove("govuk-file-upload-button--empty");
      }
    }
    findLabel() {
      const $label = document.querySelector(`label[for="${this.$input.id}"]`);
      if (!$label) {
        throw new ElementError({
          component: _FileUpload,
          identifier: `Field label (\`<label for=${this.$input.id}>\`)`
        });
      }
      return $label;
    }
    onClick() {
      this.$input.click();
    }
    observeDisabledState() {
      const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (mutation.type === "attributes" && mutation.attributeName === "disabled") {
            this.updateDisabledState();
          }
        }
      });
      observer.observe(this.$input, {
        attributes: true
      });
    }
    updateDisabledState() {
      this.$button.disabled = this.$input.disabled;
      this.$root.classList.toggle("govuk-drop-zone--disabled", this.$button.disabled);
    }
  };
  FileUpload.moduleName = "govuk-file-upload";
  FileUpload.defaults = Object.freeze({
    i18n: {
      chooseFilesButton: "Choose file",
      dropInstruction: "or drop file",
      noFileChosen: "No file chosen",
      multipleFilesChosen: {
        one: "%{count} file chosen",
        other: "%{count} files chosen"
      },
      enteredDropZone: "Entered drop zone",
      leftDropZone: "Left drop zone"
    }
  });
  FileUpload.schema = Object.freeze({
    properties: {
      i18n: {
        type: "object"
      }
    }
  });
  function countFileItems(list) {
    let result = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].kind === "file") {
        result++;
      }
    }
    return result;
  }

  // node_modules/govuk-frontend/dist/govuk/components/notification-banner/notification-banner.mjs
  var NotificationBanner = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for notification banner
     * @param {NotificationBannerConfig} [config] - Notification banner config
     */
    constructor($root, config = {}) {
      super($root, config);
      if (this.$root.getAttribute("role") === "alert" && !this.config.disableAutoFocus) {
        setFocus(this.$root);
      }
    }
  };
  NotificationBanner.moduleName = "govuk-notification-banner";
  NotificationBanner.defaults = Object.freeze({
    disableAutoFocus: false
  });
  NotificationBanner.schema = Object.freeze({
    properties: {
      disableAutoFocus: {
        type: "boolean"
      }
    }
  });

  // node_modules/govuk-frontend/dist/govuk/components/password-input/password-input.mjs
  var PasswordInput = class _PasswordInput extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for password input
     * @param {PasswordInputConfig} [config] - Password input config
     */
    constructor($root, config = {}) {
      super($root, config);
      this.i18n = void 0;
      this.$input = void 0;
      this.$showHideButton = void 0;
      this.$screenReaderStatusMessage = void 0;
      const $input = this.$root.querySelector(".govuk-js-password-input-input");
      if (!($input instanceof HTMLInputElement)) {
        throw new ElementError({
          component: _PasswordInput,
          element: $input,
          expectedType: "HTMLInputElement",
          identifier: "Form field (`.govuk-js-password-input-input`)"
        });
      }
      if ($input.type !== "password") {
        throw new ElementError("Password input: Form field (`.govuk-js-password-input-input`) must be of type `password`.");
      }
      const $showHideButton = this.$root.querySelector(".govuk-js-password-input-toggle");
      if (!($showHideButton instanceof HTMLButtonElement)) {
        throw new ElementError({
          component: _PasswordInput,
          element: $showHideButton,
          expectedType: "HTMLButtonElement",
          identifier: "Button (`.govuk-js-password-input-toggle`)"
        });
      }
      if ($showHideButton.type !== "button") {
        throw new ElementError("Password input: Button (`.govuk-js-password-input-toggle`) must be of type `button`.");
      }
      this.$input = $input;
      this.$showHideButton = $showHideButton;
      this.i18n = new I18n(this.config.i18n, {
        locale: closestAttributeValue(this.$root, "lang")
      });
      this.$showHideButton.removeAttribute("hidden");
      const $screenReaderStatusMessage = document.createElement("div");
      $screenReaderStatusMessage.className = "govuk-password-input__sr-status govuk-visually-hidden";
      $screenReaderStatusMessage.setAttribute("aria-live", "polite");
      this.$screenReaderStatusMessage = $screenReaderStatusMessage;
      this.$input.insertAdjacentElement("afterend", $screenReaderStatusMessage);
      this.$showHideButton.addEventListener("click", this.toggle.bind(this));
      if (this.$input.form) {
        this.$input.form.addEventListener("submit", () => this.hide());
      }
      window.addEventListener("pageshow", (event) => {
        if (event.persisted && this.$input.type !== "password") {
          this.hide();
        }
      });
      this.hide();
    }
    toggle(event) {
      event.preventDefault();
      if (this.$input.type === "password") {
        this.show();
        return;
      }
      this.hide();
    }
    show() {
      this.setType("text");
    }
    hide() {
      this.setType("password");
    }
    setType(type) {
      if (type === this.$input.type) {
        return;
      }
      this.$input.setAttribute("type", type);
      const isHidden = type === "password";
      const prefixButton = isHidden ? "show" : "hide";
      const prefixStatus = isHidden ? "passwordHidden" : "passwordShown";
      this.$showHideButton.innerText = this.i18n.t(`${prefixButton}Password`);
      this.$showHideButton.setAttribute("aria-label", this.i18n.t(`${prefixButton}PasswordAriaLabel`));
      this.$screenReaderStatusMessage.innerText = this.i18n.t(`${prefixStatus}Announcement`);
    }
  };
  PasswordInput.moduleName = "govuk-password-input";
  PasswordInput.defaults = Object.freeze({
    i18n: {
      showPassword: "Show",
      hidePassword: "Hide",
      showPasswordAriaLabel: "Show password",
      hidePasswordAriaLabel: "Hide password",
      passwordShownAnnouncement: "Your password is visible",
      passwordHiddenAnnouncement: "Your password is hidden"
    }
  });
  PasswordInput.schema = Object.freeze({
    properties: {
      i18n: {
        type: "object"
      }
    }
  });

  // node_modules/govuk-frontend/dist/govuk/components/radios/radios.mjs
  var Radios = class _Radios extends Component {
    /**
     * Radios can be associated with a 'conditionally revealed' content block –
     * for example, a radio for 'Phone' could reveal an additional form field for
     * the user to enter their phone number.
     *
     * These associations are made using a `data-aria-controls` attribute, which
     * is promoted to an aria-controls attribute during initialisation.
     *
     * We also need to restore the state of any conditional reveals on the page
     * (for example if the user has navigated back), and set up event handlers to
     * keep the reveal in sync with the radio state.
     *
     * @param {Element | null} $root - HTML element to use for radios
     */
    constructor($root) {
      super($root);
      this.$inputs = void 0;
      const $inputs = this.$root.querySelectorAll('input[type="radio"]');
      if (!$inputs.length) {
        throw new ElementError({
          component: _Radios,
          identifier: 'Form inputs (`<input type="radio">`)'
        });
      }
      this.$inputs = $inputs;
      this.$inputs.forEach(($input) => {
        const targetId = $input.getAttribute("data-aria-controls");
        if (!targetId) {
          return;
        }
        if (!document.getElementById(targetId)) {
          throw new ElementError({
            component: _Radios,
            identifier: `Conditional reveal (\`id="${targetId}"\`)`
          });
        }
        $input.setAttribute("aria-controls", targetId);
        $input.removeAttribute("data-aria-controls");
      });
      window.addEventListener("pageshow", () => this.syncAllConditionalReveals());
      this.syncAllConditionalReveals();
      this.$root.addEventListener("click", (event) => this.handleClick(event));
    }
    syncAllConditionalReveals() {
      this.$inputs.forEach(($input) => this.syncConditionalRevealWithInputState($input));
    }
    syncConditionalRevealWithInputState($input) {
      const targetId = $input.getAttribute("aria-controls");
      if (!targetId) {
        return;
      }
      const $target = document.getElementById(targetId);
      if ($target != null && $target.classList.contains("govuk-radios__conditional")) {
        const inputIsChecked = $input.checked;
        $input.setAttribute("aria-expanded", inputIsChecked.toString());
        $target.classList.toggle("govuk-radios__conditional--hidden", !inputIsChecked);
      }
    }
    handleClick(event) {
      const $clickedInput = event.target;
      if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== "radio") {
        return;
      }
      const $allInputs = document.querySelectorAll('input[type="radio"][aria-controls]');
      const $clickedInputForm = $clickedInput.form;
      const $clickedInputName = $clickedInput.name;
      $allInputs.forEach(($input) => {
        const hasSameFormOwner = $input.form === $clickedInputForm;
        const hasSameName = $input.name === $clickedInputName;
        if (hasSameName && hasSameFormOwner) {
          this.syncConditionalRevealWithInputState($input);
        }
      });
    }
  };
  Radios.moduleName = "govuk-radios";

  // node_modules/govuk-frontend/dist/govuk/components/service-navigation/service-navigation.mjs
  var ServiceNavigation = class _ServiceNavigation extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for header
     */
    constructor($root) {
      super($root);
      this.$menuButton = void 0;
      this.$menu = void 0;
      this.menuIsOpen = false;
      this.mql = null;
      const $menuButton = this.$root.querySelector(".govuk-js-service-navigation-toggle");
      if (!$menuButton) {
        return this;
      }
      const menuId = $menuButton.getAttribute("aria-controls");
      if (!menuId) {
        throw new ElementError({
          component: _ServiceNavigation,
          identifier: 'Navigation button (`<button class="govuk-js-service-navigation-toggle">`) attribute (`aria-controls`)'
        });
      }
      const $menu = document.getElementById(menuId);
      if (!$menu) {
        throw new ElementError({
          component: _ServiceNavigation,
          element: $menu,
          identifier: `Navigation (\`<ul id="${menuId}">\`)`
        });
      }
      this.$menu = $menu;
      this.$menuButton = $menuButton;
      this.setupResponsiveChecks();
      this.$menuButton.addEventListener("click", () => this.handleMenuButtonClick());
    }
    setupResponsiveChecks() {
      const breakpoint = getBreakpoint("tablet");
      if (!breakpoint.value) {
        throw new ElementError({
          component: _ServiceNavigation,
          identifier: `CSS custom property (\`${breakpoint.property}\`) on pseudo-class \`:root\``
        });
      }
      this.mql = window.matchMedia(`(min-width: ${breakpoint.value})`);
      if ("addEventListener" in this.mql) {
        this.mql.addEventListener("change", () => this.checkMode());
      } else {
        this.mql.addListener(() => this.checkMode());
      }
      this.checkMode();
    }
    checkMode() {
      if (!this.mql || !this.$menu || !this.$menuButton) {
        return;
      }
      if (this.mql.matches) {
        this.$menu.removeAttribute("hidden");
        setAttributes(this.$menuButton, attributesForHidingButton);
      } else {
        removeAttributes(this.$menuButton, Object.keys(attributesForHidingButton));
        this.$menuButton.setAttribute("aria-expanded", this.menuIsOpen.toString());
        if (this.menuIsOpen) {
          this.$menu.removeAttribute("hidden");
        } else {
          this.$menu.setAttribute("hidden", "");
        }
      }
    }
    handleMenuButtonClick() {
      this.menuIsOpen = !this.menuIsOpen;
      this.checkMode();
    }
  };
  ServiceNavigation.moduleName = "govuk-service-navigation";
  var attributesForHidingButton = {
    hidden: "",
    "aria-hidden": "true"
  };
  function setAttributes($element, attributes) {
    for (const attributeName in attributes) {
      $element.setAttribute(attributeName, attributes[attributeName]);
    }
  }
  function removeAttributes($element, attributeNames) {
    for (const attributeName of attributeNames) {
      $element.removeAttribute(attributeName);
    }
  }

  // node_modules/govuk-frontend/dist/govuk/components/skip-link/skip-link.mjs
  var SkipLink = class _SkipLink extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for skip link
     * @throws {ElementError} when $root is not set or the wrong type
     * @throws {ElementError} when $root.hash does not contain a hash
     * @throws {ElementError} when the linked element is missing or the wrong type
     */
    constructor($root) {
      var _this$$root$getAttrib;
      super($root);
      const hash = this.$root.hash;
      const href = (_this$$root$getAttrib = this.$root.getAttribute("href")) != null ? _this$$root$getAttrib : "";
      if (this.$root.origin !== window.location.origin || this.$root.pathname !== window.location.pathname) {
        return;
      }
      const linkedElementId = hash.replace("#", "");
      if (!linkedElementId) {
        throw new ElementError(`Skip link: Target link (\`href="${href}"\`) has no hash fragment`);
      }
      const $linkedElement = document.getElementById(linkedElementId);
      if (!$linkedElement) {
        throw new ElementError({
          component: _SkipLink,
          element: $linkedElement,
          identifier: `Target content (\`id="${linkedElementId}"\`)`
        });
      }
      this.$root.addEventListener("click", () => setFocus($linkedElement, {
        onBeforeFocus() {
          $linkedElement.classList.add("govuk-skip-link-focused-element");
        },
        onBlur() {
          $linkedElement.classList.remove("govuk-skip-link-focused-element");
        }
      }));
    }
  };
  SkipLink.elementType = HTMLAnchorElement;
  SkipLink.moduleName = "govuk-skip-link";

  // node_modules/govuk-frontend/dist/govuk/components/tabs/tabs.mjs
  var Tabs = class _Tabs extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for tabs
     */
    constructor($root) {
      super($root);
      this.$tabs = void 0;
      this.$tabList = void 0;
      this.$tabListItems = void 0;
      this.jsHiddenClass = "govuk-tabs__panel--hidden";
      this.changingHash = false;
      this.boundTabClick = void 0;
      this.boundTabKeydown = void 0;
      this.boundOnHashChange = void 0;
      this.mql = null;
      const $tabs = this.$root.querySelectorAll("a.govuk-tabs__tab");
      if (!$tabs.length) {
        throw new ElementError({
          component: _Tabs,
          identifier: 'Links (`<a class="govuk-tabs__tab">`)'
        });
      }
      this.$tabs = $tabs;
      this.boundTabClick = this.onTabClick.bind(this);
      this.boundTabKeydown = this.onTabKeydown.bind(this);
      this.boundOnHashChange = this.onHashChange.bind(this);
      const $tabList = this.$root.querySelector(".govuk-tabs__list");
      const $tabListItems = this.$root.querySelectorAll("li.govuk-tabs__list-item");
      if (!$tabList) {
        throw new ElementError({
          component: _Tabs,
          identifier: 'List (`<ul class="govuk-tabs__list">`)'
        });
      }
      if (!$tabListItems.length) {
        throw new ElementError({
          component: _Tabs,
          identifier: 'List items (`<li class="govuk-tabs__list-item">`)'
        });
      }
      this.$tabList = $tabList;
      this.$tabListItems = $tabListItems;
      this.setupResponsiveChecks();
    }
    setupResponsiveChecks() {
      const breakpoint = getBreakpoint("tablet");
      if (!breakpoint.value) {
        throw new ElementError({
          component: _Tabs,
          identifier: `CSS custom property (\`${breakpoint.property}\`) on pseudo-class \`:root\``
        });
      }
      this.mql = window.matchMedia(`(min-width: ${breakpoint.value})`);
      if ("addEventListener" in this.mql) {
        this.mql.addEventListener("change", () => this.checkMode());
      } else {
        this.mql.addListener(() => this.checkMode());
      }
      this.checkMode();
    }
    checkMode() {
      var _this$mql;
      if ((_this$mql = this.mql) != null && _this$mql.matches) {
        this.setup();
      } else {
        this.teardown();
      }
    }
    setup() {
      var _this$getTab;
      this.$tabList.setAttribute("role", "tablist");
      this.$tabListItems.forEach(($item) => {
        $item.setAttribute("role", "presentation");
      });
      this.$tabs.forEach(($tab) => {
        this.setAttributes($tab);
        $tab.addEventListener("click", this.boundTabClick, true);
        $tab.addEventListener("keydown", this.boundTabKeydown, true);
        this.hideTab($tab);
      });
      const $activeTab = (_this$getTab = this.getTab(window.location.hash)) != null ? _this$getTab : this.$tabs[0];
      this.showTab($activeTab);
      window.addEventListener("hashchange", this.boundOnHashChange, true);
    }
    teardown() {
      this.$tabList.removeAttribute("role");
      this.$tabListItems.forEach(($item) => {
        $item.removeAttribute("role");
      });
      this.$tabs.forEach(($tab) => {
        $tab.removeEventListener("click", this.boundTabClick, true);
        $tab.removeEventListener("keydown", this.boundTabKeydown, true);
        this.unsetAttributes($tab);
      });
      window.removeEventListener("hashchange", this.boundOnHashChange, true);
    }
    onHashChange() {
      const hash = window.location.hash;
      const $tabWithHash = this.getTab(hash);
      if (!$tabWithHash) {
        return;
      }
      if (this.changingHash) {
        this.changingHash = false;
        return;
      }
      const $previousTab = this.getCurrentTab();
      if (!$previousTab) {
        return;
      }
      this.hideTab($previousTab);
      this.showTab($tabWithHash);
      $tabWithHash.focus();
    }
    hideTab($tab) {
      this.unhighlightTab($tab);
      this.hidePanel($tab);
    }
    showTab($tab) {
      this.highlightTab($tab);
      this.showPanel($tab);
    }
    getTab(hash) {
      return this.$root.querySelector(`a.govuk-tabs__tab[href="${hash}"]`);
    }
    setAttributes($tab) {
      const panelId = $tab.hash.replace("#", "");
      if (!panelId) {
        return;
      }
      $tab.setAttribute("id", `tab_${panelId}`);
      $tab.setAttribute("role", "tab");
      $tab.setAttribute("aria-controls", panelId);
      $tab.setAttribute("aria-selected", "false");
      $tab.setAttribute("tabindex", "-1");
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      $panel.setAttribute("role", "tabpanel");
      $panel.setAttribute("aria-labelledby", $tab.id);
      $panel.classList.add(this.jsHiddenClass);
    }
    unsetAttributes($tab) {
      $tab.removeAttribute("id");
      $tab.removeAttribute("role");
      $tab.removeAttribute("aria-controls");
      $tab.removeAttribute("aria-selected");
      $tab.removeAttribute("tabindex");
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      $panel.removeAttribute("role");
      $panel.removeAttribute("aria-labelledby");
      $panel.classList.remove(this.jsHiddenClass);
    }
    onTabClick(event) {
      const $currentTab = this.getCurrentTab();
      const $nextTab = event.currentTarget;
      if (!$currentTab || !($nextTab instanceof HTMLAnchorElement)) {
        return;
      }
      event.preventDefault();
      this.hideTab($currentTab);
      this.showTab($nextTab);
      this.createHistoryEntry($nextTab);
    }
    createHistoryEntry($tab) {
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      const panelId = $panel.id;
      $panel.id = "";
      this.changingHash = true;
      window.location.hash = panelId;
      $panel.id = panelId;
    }
    onTabKeydown(event) {
      switch (event.key) {
        case "ArrowLeft":
        case "Left":
          this.activatePreviousTab();
          event.preventDefault();
          break;
        case "ArrowRight":
        case "Right":
          this.activateNextTab();
          event.preventDefault();
          break;
      }
    }
    activateNextTab() {
      const $currentTab = this.getCurrentTab();
      if (!($currentTab != null && $currentTab.parentElement)) {
        return;
      }
      const $nextTabListItem = $currentTab.parentElement.nextElementSibling;
      if (!$nextTabListItem) {
        return;
      }
      const $nextTab = $nextTabListItem.querySelector("a.govuk-tabs__tab");
      if (!$nextTab) {
        return;
      }
      this.hideTab($currentTab);
      this.showTab($nextTab);
      $nextTab.focus();
      this.createHistoryEntry($nextTab);
    }
    activatePreviousTab() {
      const $currentTab = this.getCurrentTab();
      if (!($currentTab != null && $currentTab.parentElement)) {
        return;
      }
      const $previousTabListItem = $currentTab.parentElement.previousElementSibling;
      if (!$previousTabListItem) {
        return;
      }
      const $previousTab = $previousTabListItem.querySelector("a.govuk-tabs__tab");
      if (!$previousTab) {
        return;
      }
      this.hideTab($currentTab);
      this.showTab($previousTab);
      $previousTab.focus();
      this.createHistoryEntry($previousTab);
    }
    getPanel($tab) {
      const panelId = $tab.hash.replace("#", "");
      if (!panelId) {
        return null;
      }
      return this.$root.querySelector(`#${panelId}`);
    }
    showPanel($tab) {
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      $panel.classList.remove(this.jsHiddenClass);
    }
    hidePanel($tab) {
      const $panel = this.getPanel($tab);
      if (!$panel) {
        return;
      }
      $panel.classList.add(this.jsHiddenClass);
    }
    unhighlightTab($tab) {
      if (!$tab.parentElement) {
        return;
      }
      $tab.setAttribute("aria-selected", "false");
      $tab.parentElement.classList.remove("govuk-tabs__list-item--selected");
      $tab.setAttribute("tabindex", "-1");
    }
    highlightTab($tab) {
      if (!$tab.parentElement) {
        return;
      }
      $tab.setAttribute("aria-selected", "true");
      $tab.parentElement.classList.add("govuk-tabs__list-item--selected");
      $tab.setAttribute("tabindex", "0");
    }
    getCurrentTab() {
      return this.$root.querySelector(".govuk-tabs__list-item--selected a.govuk-tabs__tab");
    }
  };
  Tabs.moduleName = "govuk-tabs";

  // node_modules/govuk-frontend/dist/govuk/init.mjs
  function initAll(scopeOrConfig = {}) {
    const config = isObject(scopeOrConfig) ? scopeOrConfig : {};
    const options = normaliseOptions(scopeOrConfig);
    try {
      if (!isSupported()) {
        throw new SupportError();
      }
      if (options.scope === null) {
        throw new ElementError({
          element: options.scope,
          identifier: "GOV.UK Frontend scope element (`$scope`)"
        });
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error, {
          config
        });
      } else {
        console.log(error);
      }
      return;
    }
    const components = [[Accordion, config.accordion], [Button, config.button], [CharacterCount, config.characterCount], [Checkboxes], [ErrorSummary, config.errorSummary], [ExitThisPage, config.exitThisPage], [FileUpload, config.fileUpload], [NotificationBanner, config.notificationBanner], [PasswordInput, config.passwordInput], [Radios], [ServiceNavigation], [SkipLink], [Tabs]];
    components.forEach(([Component2, componentConfig]) => {
      createAll(Component2, componentConfig, options);
    });
  }
  function createAll(Component2, config, scopeOrOptions) {
    let $elements;
    const options = normaliseOptions(scopeOrOptions);
    try {
      var _options$scope;
      if (!isSupported()) {
        throw new SupportError();
      }
      if (options.scope === null) {
        throw new ElementError({
          element: options.scope,
          component: Component2,
          identifier: "Scope element (`$scope`)"
        });
      }
      $elements = (_options$scope = options.scope) == null ? void 0 : _options$scope.querySelectorAll(`[data-module="${Component2.moduleName}"]`);
    } catch (error) {
      if (options.onError) {
        options.onError(error, {
          component: Component2,
          config
        });
      } else {
        console.log(error);
      }
      return [];
    }
    return Array.from($elements != null ? $elements : []).map(($element) => {
      try {
        return typeof config !== "undefined" ? new Component2($element, config) : new Component2($element);
      } catch (error) {
        if (options.onError) {
          options.onError(error, {
            element: $element,
            component: Component2,
            config
          });
        } else {
          console.log(error);
        }
        return null;
      }
    }).filter(Boolean);
  }

  // node_modules/@ministryofjustice/frontend/moj/components/add-another/add-another.mjs
  var AddAnother = class extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for add another
     */
    constructor($root) {
      super($root);
      this.$root.addEventListener("click", this.onRemoveButtonClick.bind(this));
      this.$root.addEventListener("click", this.onAddButtonClick.bind(this));
      const $buttons = this.$root.querySelectorAll(".moj-add-another__add-button, moj-add-another__remove-button");
      $buttons.forEach(($button) => {
        if (!($button instanceof HTMLButtonElement)) {
          return;
        }
        $button.type = "button";
      });
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    onAddButtonClick(event) {
      const $button = event.target;
      if (!$button || !($button instanceof HTMLButtonElement) || !$button.classList.contains("moj-add-another__add-button")) {
        return;
      }
      const $items = this.getItems();
      const $item = this.getNewItem();
      if (!$item || !($item instanceof HTMLElement)) {
        return;
      }
      this.updateAttributes($item, $items.length);
      this.resetItem($item);
      const $firstItem = $items[0];
      if (!this.hasRemoveButton($firstItem)) {
        this.createRemoveButton($firstItem);
      }
      $items[$items.length - 1].after($item);
      const $input = $item.querySelector("input, textarea, select");
      if ($input && $input instanceof HTMLInputElement) {
        $input.focus();
      }
    }
    /**
     * @param {HTMLElement} $item - Add another item
     */
    hasRemoveButton($item) {
      return $item.querySelectorAll(".moj-add-another__remove-button").length;
    }
    getItems() {
      if (!this.$root) {
        return [];
      }
      const $items = Array.from(this.$root.querySelectorAll(".moj-add-another__item"));
      return $items.filter((item) => item instanceof HTMLElement);
    }
    getNewItem() {
      const $items = this.getItems();
      const $item = $items[0].cloneNode(true);
      if (!$item || !($item instanceof HTMLElement)) {
        return;
      }
      if (!this.hasRemoveButton($item)) {
        this.createRemoveButton($item);
      }
      return $item;
    }
    /**
     * @param {HTMLElement} $item - Add another item
     * @param {number} index - Add another item index
     */
    updateAttributes($item, index) {
      $item.querySelectorAll("[data-name]").forEach(($input) => {
        if (!this.isValidInputElement($input)) {
          return;
        }
        const name = $input.getAttribute("data-name") || "";
        const id = $input.getAttribute("data-id") || "";
        const originalId = $input.id;
        $input.name = name.replace(/%index%/, `${index}`);
        $input.id = id.replace(/%index%/, `${index}`);
        const $label = $input.parentElement.querySelector("label") || $input.closest("label") || $item.querySelector(`[for="${originalId}"]`);
        if ($label && $label instanceof HTMLLabelElement) {
          $label.htmlFor = $input.id;
        }
      });
    }
    /**
     * @param {HTMLElement} $item - Add another item
     */
    createRemoveButton($item) {
      const $button = document.createElement("button");
      $button.type = "button";
      $button.classList.add("govuk-button", "govuk-button--secondary", "moj-add-another__remove-button");
      $button.textContent = "Remove";
      $item.append($button);
    }
    /**
     * @param {HTMLElement} $item - Add another item
     */
    resetItem($item) {
      $item.querySelectorAll("[data-name], [data-id]").forEach(($input) => {
        if (!this.isValidInputElement($input)) {
          return;
        }
        if ($input instanceof HTMLSelectElement) {
          $input.selectedIndex = -1;
          $input.value = "";
        } else if ($input instanceof HTMLTextAreaElement) {
          $input.value = "";
        } else {
          switch ($input.type) {
            case "checkbox":
            case "radio":
              $input.checked = false;
              break;
            default:
              $input.value = "";
          }
        }
      });
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    onRemoveButtonClick(event) {
      const $button = event.target;
      if (!$button || !($button instanceof HTMLButtonElement) || !$button.classList.contains("moj-add-another__remove-button")) {
        return;
      }
      $button.closest(".moj-add-another__item").remove();
      const $items = this.getItems();
      if ($items.length === 1) {
        $items[0].querySelector(".moj-add-another__remove-button").remove();
      }
      $items.forEach(($item, index) => {
        this.updateAttributes($item, index);
      });
      this.focusHeading();
    }
    focusHeading() {
      const $heading = this.$root.querySelector(".moj-add-another__heading");
      if ($heading && $heading instanceof HTMLElement) {
        $heading.focus();
      }
    }
    /**
     * @param {Element} $input - the input to validate
     */
    isValidInputElement($input) {
      return $input instanceof HTMLInputElement || $input instanceof HTMLSelectElement || $input instanceof HTMLTextAreaElement;
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  AddAnother.moduleName = "moj-add-another";

  // node_modules/@ministryofjustice/frontend/moj/common/index.mjs
  function setFocus2($element, options = {}) {
    var _options$onBeforeFocu;
    const isFocusable = $element.getAttribute("tabindex");
    if (!isFocusable) {
      $element.setAttribute("tabindex", "-1");
    }
    function onFocus() {
      $element.addEventListener("blur", onBlur, {
        once: true
      });
    }
    function onBlur() {
      var _options$onBlur;
      (_options$onBlur = options.onBlur) == null || _options$onBlur.call($element);
      if (!isFocusable) {
        $element.removeAttribute("tabindex");
      }
    }
    $element.addEventListener("focus", onFocus, {
      once: true
    });
    (_options$onBeforeFocu = options.onBeforeFocus) == null || _options$onBeforeFocu.call($element);
    $element.focus();
  }

  // node_modules/@ministryofjustice/frontend/moj/helpers.mjs
  function getPreviousSibling($element, selector) {
    if (!$element || !($element instanceof HTMLElement)) {
      return;
    }
    let $sibling = $element.previousElementSibling;
    while ($sibling) {
      if ($sibling.matches(selector)) return $sibling;
      $sibling = $sibling.previousElementSibling;
    }
  }
  function findNearestMatchingElement($element, selector) {
    if (!$element || !($element instanceof HTMLElement) || !selector) {
      return;
    }
    let $currentElement = $element;
    while ($currentElement) {
      if ($currentElement.matches(selector)) {
        return $currentElement;
      }
      let $sibling = $currentElement.previousElementSibling;
      while ($sibling) {
        if ($sibling.matches(selector)) {
          return $sibling;
        }
        $sibling = $sibling.previousElementSibling;
      }
      $currentElement = $currentElement.parentElement;
    }
  }

  // node_modules/@ministryofjustice/frontend/moj/components/alert/alert.mjs
  var Alert = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for alert
     * @param {AlertConfig} [config] - Alert config
     */
    constructor($root, config = {}) {
      super($root, config);
      if (this.$root.getAttribute("role") === "alert" && !this.config.disableAutoFocus) {
        setFocus2(this.$root);
      }
      this.$dismissButton = this.$root.querySelector(".moj-alert__dismiss");
      if (this.config.dismissible && this.$dismissButton) {
        this.$dismissButton.innerHTML = this.config.dismissText;
        this.$dismissButton.removeAttribute("hidden");
        this.$root.addEventListener("click", (event) => {
          if (event.target instanceof Node && this.$dismissButton.contains(event.target)) {
            this.dimiss();
          }
        });
      }
    }
    /**
     * Handle dismissing the alert
     */
    dimiss() {
      let $elementToRecieveFocus;
      if (this.config.focusOnDismissSelector) {
        $elementToRecieveFocus = document.querySelector(this.config.focusOnDismissSelector);
      }
      if (!$elementToRecieveFocus) {
        const $nextSibling = this.$root.nextElementSibling;
        if ($nextSibling && $nextSibling.matches(".moj-alert")) {
          $elementToRecieveFocus = $nextSibling;
        }
      }
      if (!$elementToRecieveFocus) {
        $elementToRecieveFocus = getPreviousSibling(this.$root, ".moj-alert, h1, h2, h3, h4, h5, h6");
      }
      if (!$elementToRecieveFocus) {
        $elementToRecieveFocus = findNearestMatchingElement(this.$root, "h1, h2, h3, h4, h5, h6, main, body");
      }
      if ($elementToRecieveFocus instanceof HTMLElement) {
        setFocus2($elementToRecieveFocus);
      }
      this.$root.remove();
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  Alert.moduleName = "moj-alert";
  Alert.defaults = Object.freeze({
    dismissible: false,
    dismissText: "Dismiss",
    disableAutoFocus: false
  });
  Alert.schema = Object.freeze(
    /** @type {const} */
    {
      properties: {
        dismissible: {
          type: "boolean"
        },
        dismissText: {
          type: "string"
        },
        disableAutoFocus: {
          type: "boolean"
        },
        focusOnDismissSelector: {
          type: "string"
        }
      }
    }
  );

  // node_modules/@ministryofjustice/frontend/moj/components/button-menu/button-menu.mjs
  var ButtonMenu = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for button menu
     * @param {ButtonMenuConfig} [config] - Button menu config
     */
    constructor($root, config = {}) {
      super($root, config);
      if (this.$root.children.length === 1) {
        const $button = this.$root.children[0];
        $button.classList.forEach((className) => {
          if (className.startsWith("govuk-button-")) {
            $button.classList.remove(className);
          }
          $button.classList.remove("moj-button-menu__item");
          $button.classList.add("moj-button-menu__single-button");
        });
        if (this.config.buttonClasses) {
          $button.classList.add(...this.config.buttonClasses.split(" "));
        }
      }
      if (this.$root.children.length > 1) {
        this.initMenu();
      }
    }
    initMenu() {
      this.$menu = this.createMenu();
      this.$root.insertAdjacentHTML("afterbegin", this.toggleTemplate());
      this.setupMenuItems();
      this.$menuToggle = this.$root.querySelector(":scope > button");
      this.$items = this.$menu.querySelectorAll("a, button");
      this.$menuToggle.addEventListener("click", (event) => {
        this.toggleMenu(event);
      });
      this.$root.addEventListener("keydown", (event) => {
        this.handleKeyDown(event);
      });
      document.addEventListener("click", (event) => {
        if (event.target instanceof Node && !this.$root.contains(event.target)) {
          this.closeMenu(false);
        }
      });
    }
    createMenu() {
      const $menu = document.createElement("ul");
      $menu.setAttribute("role", "list");
      $menu.hidden = true;
      $menu.classList.add("moj-button-menu__wrapper");
      if (this.config.alignMenu === "right") {
        $menu.classList.add("moj-button-menu__wrapper--right");
      }
      this.$root.appendChild($menu);
      while (this.$root.firstChild !== $menu) {
        $menu.appendChild(this.$root.firstChild);
      }
      return $menu;
    }
    setupMenuItems() {
      Array.from(this.$menu.children).forEach(($menuItem) => {
        const $listItem = document.createElement("li");
        this.$menu.insertBefore($listItem, $menuItem);
        $listItem.appendChild($menuItem);
        $menuItem.setAttribute("tabindex", "-1");
        if ($menuItem.tagName === "BUTTON") {
          $menuItem.setAttribute("type", "button");
        }
        $menuItem.classList.forEach((className) => {
          if (className.startsWith("govuk-button")) {
            $menuItem.classList.remove(className);
          }
        });
        $menuItem.addEventListener("click", () => {
          setTimeout(() => {
            this.closeMenu(false);
          }, 50);
        });
      });
    }
    toggleTemplate() {
      return `
    <button type="button" class="govuk-button moj-button-menu__toggle-button ${this.config.buttonClasses || ""}" aria-haspopup="true" aria-expanded="false">
      <span>
       ${this.config.buttonText}
       <svg width="11" height="5" viewBox="0 0 11 5"  xmlns="http://www.w3.org/2000/svg">
         <path d="M5.5 0L11 5L0 5L5.5 0Z" fill="currentColor"/>
       </svg>
      </span>
    </button>`;
    }
    /**
     * @returns {boolean}
     */
    isOpen() {
      return this.$menuToggle.getAttribute("aria-expanded") === "true";
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    toggleMenu(event) {
      event.preventDefault();
      const keyboardEvent = event.detail === 0;
      const focusIndex = keyboardEvent ? 0 : -1;
      if (this.isOpen()) {
        this.closeMenu();
      } else {
        this.openMenu(focusIndex);
      }
    }
    /**
     * Opens the menu and optionally sets the focus to the item with given index
     *
     * @param {number} focusIndex - The index of the item to focus
     */
    openMenu(focusIndex = 0) {
      this.$menu.hidden = false;
      this.$menuToggle.setAttribute("aria-expanded", "true");
      if (focusIndex !== -1) {
        this.focusItem(focusIndex);
      }
    }
    /**
     * Closes the menu and optionally returns focus back to menuToggle
     *
     * @param {boolean} moveFocus - whether to return focus to the toggle button
     */
    closeMenu(moveFocus = true) {
      this.$menu.hidden = true;
      this.$menuToggle.setAttribute("aria-expanded", "false");
      if (moveFocus) {
        this.$menuToggle.focus();
      }
    }
    /**
     * Focuses the menu item at the specified index
     *
     * @param {number} index - the index of the item to focus
     */
    focusItem(index) {
      if (index >= this.$items.length) index = 0;
      if (index < 0) index = this.$items.length - 1;
      const $menuItem = this.$items.item(index);
      if ($menuItem) {
        $menuItem.focus();
      }
    }
    currentFocusIndex() {
      const $activeElement = document.activeElement;
      const $menuItems = Array.from(this.$items);
      return ($activeElement instanceof HTMLAnchorElement || $activeElement instanceof HTMLButtonElement) && $menuItems.indexOf($activeElement);
    }
    /**
     * @param {KeyboardEvent} event - Keydown event
     */
    handleKeyDown(event) {
      if (event.target === this.$menuToggle) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            this.openMenu();
            break;
          case "ArrowUp":
            event.preventDefault();
            this.openMenu(this.$items.length - 1);
            break;
        }
      }
      if (event.target instanceof Node && this.$menu.contains(event.target) && this.isOpen()) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            if (this.currentFocusIndex() !== -1) {
              this.focusItem(this.currentFocusIndex() + 1);
            }
            break;
          case "ArrowUp":
            event.preventDefault();
            if (this.currentFocusIndex() !== -1) {
              this.focusItem(this.currentFocusIndex() - 1);
            }
            break;
          case "Home":
            event.preventDefault();
            this.focusItem(0);
            break;
          case "End":
            event.preventDefault();
            this.focusItem(this.$items.length - 1);
            break;
        }
      }
      if (event.key === "Escape" && this.isOpen()) {
        this.closeMenu();
      }
      if (event.key === "Tab" && this.isOpen()) {
        this.closeMenu(false);
      }
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  ButtonMenu.moduleName = "moj-button-menu";
  ButtonMenu.defaults = Object.freeze({
    buttonText: "Actions",
    alignMenu: "left",
    buttonClasses: ""
  });
  ButtonMenu.schema = Object.freeze(
    /** @type {const} */
    {
      properties: {
        buttonText: {
          type: "string"
        },
        buttonClasses: {
          type: "string"
        },
        alignMenu: {
          type: "string"
        }
      }
    }
  );

  // node_modules/@ministryofjustice/frontend/moj/components/date-picker/date-picker.mjs
  var DatePicker = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for date picker
     * @param {DatePickerConfig} [config] - Date picker config
     */
    constructor($root, config = {}) {
      var _this$config$input$el;
      super($root, config);
      const $input = (_this$config$input$el = this.config.input.element) != null ? _this$config$input$el : this.$root.querySelector(this.config.input.selector);
      if (!$input || !($input instanceof HTMLInputElement)) {
        return this;
      }
      this.$input = $input;
      this.dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      this.monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      this.currentDate = /* @__PURE__ */ new Date();
      this.currentDate.setHours(0, 0, 0, 0);
      this.calendarDays = /** @type {DSCalendarDay[]} */
      [];
      this.excludedDates = /** @type {Date[]} */
      [];
      this.excludedDays = /** @type {number[]} */
      [];
      this.buttonClass = "moj-datepicker__button";
      this.selectedDayButtonClass = "moj-datepicker__button--selected";
      this.currentDayButtonClass = "moj-datepicker__button--current";
      this.todayButtonClass = "moj-datepicker__button--today";
      this.setOptions();
      this.initControls();
    }
    initControls() {
      this.id = `datepicker-${this.$input.id}`;
      this.$dialog = this.createDialog();
      this.createCalendarHeaders();
      const $componentWrapper = document.createElement("div");
      const $inputWrapper = document.createElement("div");
      $componentWrapper.classList.add("moj-datepicker__wrapper");
      $inputWrapper.classList.add("govuk-input__wrapper");
      this.$input.parentElement.insertBefore($componentWrapper, this.$input);
      $componentWrapper.appendChild($inputWrapper);
      $inputWrapper.appendChild(this.$input);
      $inputWrapper.insertAdjacentHTML("beforeend", this.toggleTemplate());
      $componentWrapper.insertAdjacentElement("beforeend", this.$dialog);
      this.$calendarButton = /** @type {HTMLButtonElement} */
      this.$root.querySelector(".moj-js-datepicker-toggle");
      this.$dialogTitle = /** @type {HTMLHeadingElement} */
      this.$dialog.querySelector(".moj-js-datepicker-month-year");
      this.createCalendar();
      this.$prevMonthButton = /** @type {HTMLButtonElement} */
      this.$dialog.querySelector(".moj-js-datepicker-prev-month");
      this.$prevYearButton = /** @type {HTMLButtonElement} */
      this.$dialog.querySelector(".moj-js-datepicker-prev-year");
      this.$nextMonthButton = /** @type {HTMLButtonElement} */
      this.$dialog.querySelector(".moj-js-datepicker-next-month");
      this.$nextYearButton = /** @type {HTMLButtonElement} */
      this.$dialog.querySelector(".moj-js-datepicker-next-year");
      this.$cancelButton = /** @type {HTMLButtonElement} */
      this.$dialog.querySelector(".moj-js-datepicker-cancel");
      this.$okButton = /** @type {HTMLButtonElement} */
      this.$dialog.querySelector(".moj-js-datepicker-ok");
      this.$prevMonthButton.addEventListener("click", (event) => this.focusPreviousMonth(event, false));
      this.$prevYearButton.addEventListener("click", (event) => this.focusPreviousYear(event, false));
      this.$nextMonthButton.addEventListener("click", (event) => this.focusNextMonth(event, false));
      this.$nextYearButton.addEventListener("click", (event) => this.focusNextYear(event, false));
      this.$cancelButton.addEventListener("click", (event) => {
        event.preventDefault();
        this.closeDialog();
      });
      this.$okButton.addEventListener("click", () => {
        this.selectDate(this.currentDate);
      });
      const $dialogButtons = this.$dialog.querySelectorAll('button:not([disabled="true"])');
      this.$firstButtonInDialog = $dialogButtons[0];
      this.$lastButtonInDialog = $dialogButtons[$dialogButtons.length - 1];
      this.$firstButtonInDialog.addEventListener("keydown", (event) => this.firstButtonKeydown(event));
      this.$lastButtonInDialog.addEventListener("keydown", (event) => this.lastButtonKeydown(event));
      this.$calendarButton.addEventListener("click", (event) => this.toggleDialog(event));
      this.$dialog.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          this.closeDialog();
          event.preventDefault();
          event.stopPropagation();
        }
      });
      document.body.addEventListener("mouseup", (event) => {
        this.backgroundClick(event);
      });
      this.updateCalendar();
    }
    createDialog() {
      const titleId = `datepicker-title-${this.$input.id}`;
      const $dialog = document.createElement("div");
      $dialog.id = this.id;
      $dialog.setAttribute("class", "moj-datepicker__dialog");
      $dialog.setAttribute("role", "dialog");
      $dialog.setAttribute("aria-modal", "true");
      $dialog.setAttribute("aria-labelledby", titleId);
      $dialog.innerHTML = this.dialogTemplate(titleId);
      $dialog.hidden = true;
      return $dialog;
    }
    createCalendar() {
      const $tbody = this.$dialog.querySelector("tbody");
      let dayCount = 0;
      for (let i = 0; i < 6; i++) {
        const $row = $tbody.insertRow(i);
        for (let j = 0; j < 7; j++) {
          const $cell = document.createElement("td");
          $row.appendChild($cell);
          const $dateButton = document.createElement("button");
          $dateButton.setAttribute("type", "button");
          $cell.appendChild($dateButton);
          const calendarDay = new DSCalendarDay($dateButton, dayCount, i, j, this);
          this.calendarDays.push(calendarDay);
          dayCount++;
        }
      }
    }
    toggleTemplate() {
      return `<button class="moj-datepicker__toggle moj-js-datepicker-toggle" type="button" aria-haspopup="dialog" aria-controls="${this.id}" aria-expanded="false">
            <span class="govuk-visually-hidden">Choose date</span>
            <svg width="32" height="24" focusable="false" class="moj-datepicker-icon" aria-hidden="true" role="img" viewBox="0 0 22 22">
              <path
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.1333 2.93333H5.86668V4.4C5.86668 5.21002 5.21003 5.86667 4.40002 5.86667C3.59 5.86667 2.93335 5.21002 2.93335 4.4V2.93333H2C0.895431 2.93333 0 3.82877 0 4.93334V19.2667C0 20.3712 0.89543 21.2667 2 21.2667H20C21.1046 21.2667 22 20.3712 22 19.2667V4.93333C22 3.82876 21.1046 2.93333 20 2.93333H19.0667V4.4C19.0667 5.21002 18.41 5.86667 17.6 5.86667C16.79 5.86667 16.1333 5.21002 16.1333 4.4V2.93333ZM20.5333 8.06667H1.46665V18.8C1.46665 19.3523 1.91436 19.8 2.46665 19.8H19.5333C20.0856 19.8 20.5333 19.3523 20.5333 18.8V8.06667Z"
              ></path>
              <rect x="3.66669" width="1.46667" height="5.13333" rx="0.733333" fill="currentColor"></rect>
              <rect x="16.8667" width="1.46667" height="5.13333" rx="0.733333" fill="currentColor"></rect>
            </svg>
          </button>`;
    }
    /**
     * HTML template for calendar dialog
     *
     * @param {string} [titleId] - Id attribute for dialog title
     * @returns {string}
     */
    dialogTemplate(titleId) {
      return `<div class="moj-datepicker__dialog-header">
            <div class="moj-datepicker__dialog-navbuttons">
              <button type="button" class="moj-datepicker__button moj-js-datepicker-prev-year">
                <span class="govuk-visually-hidden">Previous year</span>
                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" fill="none" focusable="false" aria-hidden="true" role="img">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.1643 20L28.9572 14.2071L27.5429 12.7929L20.3358 20L27.5429 27.2071L28.9572 25.7929L23.1643 20Z" fill="currentColor"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1643 20L22.9572 14.2071L21.5429 12.7929L14.3358 20L21.5429 27.2071L22.9572 25.7929L17.1643 20Z" fill="currentColor"/>
                </svg>
              </button>

              <button type="button" class="moj-datepicker__button moj-js-datepicker-prev-month">
                <span class="govuk-visually-hidden">Previous month</span>
                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" focusable="false" aria-hidden="true" role="img">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20.5729 20L25.7865 14.2071L24.5137 12.7929L18.0273 20L24.5137 27.2071L25.7865 25.7929L20.5729 20Z" fill="currentColor"/>
                </svg>
              </button>
            </div>

            <h2 id="${titleId}" class="moj-datepicker__dialog-title moj-js-datepicker-month-year" aria-live="polite">June 2020</h2>

            <div class="moj-datepicker__dialog-navbuttons">
              <button type="button" class="moj-datepicker__button moj-js-datepicker-next-month">
                <span class="govuk-visually-hidden">Next month</span>
                <svg width="44" height="40" viewBox="0 0 44 40" fill="none"  focusable="false" aria-hidden="true" role="img">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.4271 20L18.2135 14.2071L19.4863 12.7929L25.9727 20L19.4863 27.2071L18.2135 25.7929L23.4271 20Z" fill="currentColor"/>
                </svg>
              </button>

              <button type="button" class="moj-datepicker__button moj-js-datepicker-next-year">
                <span class="govuk-visually-hidden">Next year</span>
                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" fill="none" focusable="false" aria-hidden="true" role="img">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20.8357 20L15.0428 14.2071L16.4571 12.7929L23.6642 20L16.4571 27.2071L15.0428 25.7929L20.8357 20Z" fill="currentColor"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M26.8357 20L21.0428 14.2071L22.4571 12.7929L29.6642 20L22.4571 27.2071L21.0428 25.7929L26.8357 20Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

          <table class="moj-datepicker__calendar moj-js-datepicker-grid" role="application" aria-labelledby="${titleId}">
            <thead>
              <tr></tr>
            </thead>

            <tbody></tbody>
          </table>

          <div class="govuk-button-group">
            <button type="button" class="govuk-button moj-js-datepicker-ok">Select</button>
            <button type="button" class="govuk-button govuk-button--secondary moj-js-datepicker-cancel">Close</button>
          </div>`;
    }
    createCalendarHeaders() {
      this.dayLabels.forEach((day) => {
        const html = `<th scope="col"><span aria-hidden="true">${day.substring(0, 3)}</span><span class="govuk-visually-hidden">${day}</span></th>`;
        const $headerRow = this.$dialog.querySelector("thead > tr");
        $headerRow.insertAdjacentHTML("beforeend", html);
      });
    }
    /**
     * Pads given number with leading zeros
     *
     * @param {number} value - The value to be padded
     * @param {number} length - The length in characters of the output
     * @returns {string}
     */
    leadingZeros(value, length = 2) {
      let ret = value.toString();
      while (ret.length < length) {
        ret = `0${ret}`;
      }
      return ret;
    }
    setOptions() {
      this.setMinAndMaxDatesOnCalendar();
      this.setExcludedDates();
      this.setExcludedDays();
      this.setWeekStartDay();
    }
    setMinAndMaxDatesOnCalendar() {
      if (this.config.minDate) {
        this.minDate = this.formattedDateFromString(this.config.minDate, null);
        if (this.minDate && this.currentDate < this.minDate) {
          this.currentDate = this.minDate;
        }
      }
      if (this.config.maxDate) {
        this.maxDate = this.formattedDateFromString(this.config.maxDate, null);
        if (this.maxDate && this.currentDate > this.maxDate) {
          this.currentDate = this.maxDate;
        }
      }
    }
    setExcludedDates() {
      if (this.config.excludedDates) {
        this.excludedDates = this.config.excludedDates.replace(/\s+/, " ").split(" ").map((item) => {
          return item.includes("-") ? this.parseDateRangeString(item) : [this.formattedDateFromString(item)];
        }).reduce((dates, items) => dates.concat(items)).filter((date) => date);
      }
    }
    /**
     * Parses a daterange string into an array of dates
     *
     * @param {string} datestring - A daterange string in the format "dd/mm/yyyy-dd/mm/yyyy"
     */
    parseDateRangeString(datestring) {
      const dates = [];
      const [startDate, endDate] = datestring.split("-").map((d) => this.formattedDateFromString(d, null));
      if (startDate && endDate) {
        const date = new Date(startDate.getTime());
        while (date <= endDate) {
          dates.push(new Date(date));
          date.setDate(date.getDate() + 1);
        }
      }
      return dates;
    }
    setExcludedDays() {
      if (this.config.excludedDays) {
        const weekDays = this.dayLabels.map((item) => item.toLowerCase());
        if (this.config.weekStartDay === "monday") {
          weekDays.unshift(weekDays.pop());
        }
        this.excludedDays = this.config.excludedDays.replace(/\s+/, " ").toLowerCase().split(" ").map((item) => weekDays.indexOf(item)).filter((item) => item !== -1);
      }
    }
    setWeekStartDay() {
      const weekStartDayParam = this.config.weekStartDay;
      if (weekStartDayParam && weekStartDayParam.toLowerCase() === "sunday") {
        this.config.weekStartDay = "sunday";
        this.dayLabels.unshift(this.dayLabels.pop());
      } else {
        this.config.weekStartDay = "monday";
      }
    }
    /**
     * Determine if a date is selectable
     *
     * @param {Date} date - the date to check
     * @returns {boolean}
     */
    isExcludedDate(date) {
      if (this.minDate && this.minDate > date) {
        return true;
      }
      if (this.maxDate && this.maxDate < date) {
        return true;
      }
      for (const excludedDate of this.excludedDates) {
        if (date.toDateString() === excludedDate.toDateString()) {
          return true;
        }
      }
      if (this.excludedDays.includes(date.getDay())) {
        return true;
      }
      return false;
    }
    /**
     * Get a Date object from a string
     *
     * @param {string} dateString - string in the format d/m/yyyy dd/mm/yyyy
     * @param {Date} fallback - date object to return if formatting fails
     * @returns {Date}
     */
    formattedDateFromString(dateString, fallback = /* @__PURE__ */ new Date()) {
      let formattedDate = null;
      const dateFormatPattern = /(\d{1,2})([-/,. ])(\d{1,2})\2(\d{4})/;
      if (!dateFormatPattern.test(dateString)) return fallback;
      const match = dateFormatPattern.exec(dateString);
      const day = match[1];
      const month = match[3];
      const year = match[4];
      formattedDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (formattedDate instanceof Date && Number.isFinite(formattedDate.getTime())) {
        return formattedDate;
      }
      return fallback;
    }
    /**
     * Get a formatted date string from a Date object
     *
     * @param {Date} date - date to format to a string
     * @returns {string}
     */
    formattedDateFromDate(date) {
      if (this.config.leadingZeros) {
        return `${this.leadingZeros(date.getDate())}/${this.leadingZeros(date.getMonth() + 1)}/${date.getFullYear()}`;
      }
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    /**
     * Get a human readable date in the format Monday 2 March 2024
     *
     * @param {Date} date - Date to format
     * @returns {string}
     */
    formattedDateHuman(date) {
      return `${this.dayLabels[(date.getDay() + 6) % 7]} ${date.getDate()} ${this.monthLabels[date.getMonth()]} ${date.getFullYear()}`;
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    backgroundClick(event) {
      if (this.isOpen() && event.target instanceof Node && !this.$dialog.contains(event.target) && !this.$input.contains(event.target) && !this.$calendarButton.contains(event.target)) {
        event.preventDefault();
        this.closeDialog();
      }
    }
    /**
     * @param {KeyboardEvent} event - Keydown event
     */
    firstButtonKeydown(event) {
      if (event.key === "Tab" && event.shiftKey) {
        this.$lastButtonInDialog.focus();
        event.preventDefault();
      }
    }
    /**
     * @param {KeyboardEvent} event - Keydown event
     */
    lastButtonKeydown(event) {
      if (event.key === "Tab" && !event.shiftKey) {
        this.$firstButtonInDialog.focus();
        event.preventDefault();
      }
    }
    // render calendar
    updateCalendar() {
      this.$dialogTitle.innerHTML = `${this.monthLabels[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      const day = this.currentDate;
      const firstOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
      let dayOfWeek;
      if (this.config.weekStartDay === "monday") {
        dayOfWeek = firstOfMonth.getDay() === 0 ? 6 : firstOfMonth.getDay() - 1;
      } else {
        dayOfWeek = firstOfMonth.getDay();
      }
      firstOfMonth.setDate(firstOfMonth.getDate() - dayOfWeek);
      const thisDay = new Date(firstOfMonth);
      for (const calendarDay of this.calendarDays) {
        const hidden = thisDay.getMonth() !== day.getMonth();
        const disabled = this.isExcludedDate(thisDay);
        calendarDay.update(thisDay, hidden, disabled);
        thisDay.setDate(thisDay.getDate() + 1);
      }
    }
    /**
     * @param {boolean} [focus] - Focus the day button
     */
    setCurrentDate(focus = true) {
      const {
        currentDate
      } = this;
      this.calendarDays.forEach((calendarDay) => {
        calendarDay.$button.classList.add("moj-datepicker__button");
        calendarDay.$button.classList.add("moj-datepicker__calendar-day");
        calendarDay.$button.setAttribute("tabindex", "-1");
        calendarDay.$button.classList.remove(this.selectedDayButtonClass);
        const calendarDayDate = calendarDay.date;
        calendarDayDate.setHours(0, 0, 0, 0);
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        if (calendarDayDate.getTime() === currentDate.getTime()) {
          if (focus) {
            calendarDay.$button.setAttribute("tabindex", "0");
            calendarDay.$button.focus();
            calendarDay.$button.classList.add(this.selectedDayButtonClass);
          }
        }
        if (this.inputDate && calendarDayDate.getTime() === this.inputDate.getTime()) {
          calendarDay.$button.classList.add(this.currentDayButtonClass);
          calendarDay.$button.setAttribute("aria-current", "date");
        } else {
          calendarDay.$button.classList.remove(this.currentDayButtonClass);
          calendarDay.$button.removeAttribute("aria-current");
        }
        if (calendarDayDate.getTime() === today.getTime()) {
          calendarDay.$button.classList.add(this.todayButtonClass);
        } else {
          calendarDay.$button.classList.remove(this.todayButtonClass);
        }
      });
      if (!focus) {
        const enabledDays = this.calendarDays.filter((calendarDay) => {
          return window.getComputedStyle(calendarDay.$button).display === "block" && !calendarDay.$button.disabled;
        });
        enabledDays[0].$button.setAttribute("tabindex", "0");
        this.currentDate = enabledDays[0].date;
      }
    }
    /**
     * @param {Date} date - Date to select
     */
    selectDate(date) {
      if (this.isExcludedDate(date)) {
        return;
      }
      this.$calendarButton.querySelector("span").innerText = `Choose date. Selected date is ${this.formattedDateHuman(date)}`;
      this.$input.value = this.formattedDateFromDate(date);
      const changeEvent = new Event("change", {
        bubbles: true,
        cancelable: true
      });
      this.$input.dispatchEvent(changeEvent);
      this.closeDialog();
    }
    isOpen() {
      return this.$dialog.classList.contains("moj-datepicker__dialog--open");
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    toggleDialog(event) {
      event.preventDefault();
      if (this.isOpen()) {
        this.closeDialog();
      } else {
        this.setMinAndMaxDatesOnCalendar();
        this.openDialog();
      }
    }
    openDialog() {
      this.$dialog.hidden = false;
      this.$dialog.classList.add("moj-datepicker__dialog--open");
      this.$calendarButton.setAttribute("aria-expanded", "true");
      if (this.$input.offsetWidth > this.$dialog.offsetWidth) {
        this.$dialog.style.right = `0px`;
      }
      this.$dialog.style.top = `${this.$input.offsetHeight + 3}px`;
      this.inputDate = this.formattedDateFromString(this.$input.value);
      if (this.minDate && this.minDate > this.inputDate) {
        this.inputDate = new Date(this.minDate.getTime());
      }
      if (this.maxDate && this.maxDate < this.inputDate) {
        this.inputDate = new Date(this.maxDate.getTime());
      }
      if (this.minDate && this.maxDate && this.minDate > this.maxDate) {
        console.error("min date is after max date. No dates will be selectable");
      }
      this.currentDate = this.inputDate;
      this.currentDate.setHours(0, 0, 0, 0);
      this.updateCalendar();
      this.setCurrentDate();
    }
    closeDialog() {
      this.$dialog.hidden = true;
      this.$dialog.classList.remove("moj-datepicker__dialog--open");
      this.$calendarButton.setAttribute("aria-expanded", "false");
      this.$calendarButton.focus();
    }
    /**
     * @param {Date} date - Date to go to
     * @param {boolean} [focus] - Focus the day button
     */
    goToDate(date, focus) {
      const current = this.currentDate;
      this.currentDate = date;
      if (current.getMonth() !== this.currentDate.getMonth() || current.getFullYear() !== this.currentDate.getFullYear()) {
        this.updateCalendar();
      }
      this.setCurrentDate(focus);
    }
    // day navigation
    focusNextDay() {
      const date = new Date(this.currentDate);
      date.setDate(date.getDate() + 1);
      this.goToDate(date);
    }
    focusPreviousDay() {
      const date = new Date(this.currentDate);
      date.setDate(date.getDate() - 1);
      this.goToDate(date);
    }
    // week navigation
    focusNextWeek() {
      const date = new Date(this.currentDate);
      date.setDate(date.getDate() + 7);
      this.goToDate(date);
    }
    focusPreviousWeek() {
      const date = new Date(this.currentDate);
      date.setDate(date.getDate() - 7);
      this.goToDate(date);
    }
    focusFirstDayOfWeek() {
      const date = new Date(this.currentDate);
      const firstDayOfWeekIndex = this.config.weekStartDay === "sunday" ? 0 : 1;
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek >= firstDayOfWeekIndex ? dayOfWeek - firstDayOfWeekIndex : 6 - dayOfWeek;
      date.setDate(date.getDate() - diff);
      date.setHours(0, 0, 0, 0);
      this.goToDate(date);
    }
    focusLastDayOfWeek() {
      const date = new Date(this.currentDate);
      const lastDayOfWeekIndex = this.config.weekStartDay === "sunday" ? 6 : 0;
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek <= lastDayOfWeekIndex ? lastDayOfWeekIndex - dayOfWeek : 7 - dayOfWeek;
      date.setDate(date.getDate() + diff);
      date.setHours(0, 0, 0, 0);
      this.goToDate(date);
    }
    /**
     * Month navigation
     *
     * @param {KeyboardEvent | MouseEvent} event - Key press or click event
     * @param {boolean} [focus] - Focus the day button
     */
    focusNextMonth(event, focus = true) {
      event.preventDefault();
      const date = new Date(this.currentDate);
      date.setMonth(date.getMonth() + 1, 1);
      this.goToDate(date, focus);
    }
    /**
     * @param {KeyboardEvent | MouseEvent} event - Key press or click event
     * @param {boolean} [focus] - Focus the day button
     */
    focusPreviousMonth(event, focus = true) {
      event.preventDefault();
      const date = new Date(this.currentDate);
      date.setMonth(date.getMonth() - 1, 1);
      this.goToDate(date, focus);
    }
    /**
     * Year navigation
     *
     * @param {KeyboardEvent | MouseEvent} event - Key press or click event
     * @param {boolean} [focus] - Focus the day button
     */
    focusNextYear(event, focus = true) {
      event.preventDefault();
      const date = new Date(this.currentDate);
      date.setFullYear(date.getFullYear() + 1, date.getMonth(), 1);
      this.goToDate(date, focus);
    }
    /**
     * @param {KeyboardEvent | MouseEvent} event - Key press or click event
     * @param {boolean} [focus] - Focus the day button
     */
    focusPreviousYear(event, focus = true) {
      event.preventDefault();
      const date = new Date(this.currentDate);
      date.setFullYear(date.getFullYear() - 1, date.getMonth(), 1);
      this.goToDate(date, focus);
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  DatePicker.moduleName = "moj-date-picker";
  DatePicker.defaults = Object.freeze({
    leadingZeros: false,
    weekStartDay: "monday",
    input: {
      selector: ".moj-js-datepicker-input"
    }
  });
  DatePicker.schema = Object.freeze(
    /** @type {const} */
    {
      properties: {
        excludedDates: {
          type: "string"
        },
        excludedDays: {
          type: "string"
        },
        leadingZeros: {
          type: "boolean"
        },
        maxDate: {
          type: "string"
        },
        minDate: {
          type: "string"
        },
        weekStartDay: {
          type: "string"
        },
        input: {
          type: "object"
        }
      }
    }
  );
  var DSCalendarDay = class {
    /**
     *
     * @param {HTMLButtonElement} $button
     * @param {number} index
     * @param {number} row
     * @param {number} column
     * @param {DatePicker} picker
     */
    constructor($button, index, row, column, picker) {
      this.index = index;
      this.row = row;
      this.column = column;
      this.$button = $button;
      this.picker = picker;
      this.date = /* @__PURE__ */ new Date();
      this.$button.addEventListener("keydown", this.keyPress.bind(this));
      this.$button.addEventListener("click", this.click.bind(this));
    }
    /**
     * @param {Date} day - the Date for the calendar day
     * @param {boolean} hidden - visibility of the day
     * @param {boolean} disabled - is the day selectable or excluded
     */
    update(day, hidden, disabled) {
      const label = day.getDate();
      let accessibleLabel = this.picker.formattedDateHuman(day);
      if (disabled) {
        this.$button.setAttribute("aria-disabled", "true");
        accessibleLabel = `Excluded date, ${accessibleLabel}`;
      } else {
        this.$button.removeAttribute("aria-disabled");
      }
      if (hidden) {
        this.$button.style.display = "none";
      } else {
        this.$button.style.display = "block";
      }
      this.$button.setAttribute("data-testid", this.picker.formattedDateFromDate(day));
      this.$button.innerHTML = `<span class="govuk-visually-hidden">${accessibleLabel}</span><span aria-hidden="true">${label}</span>`;
      this.date = new Date(day);
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    click(event) {
      this.picker.goToDate(this.date);
      this.picker.selectDate(this.date);
      event.stopPropagation();
      event.preventDefault();
    }
    /**
     * @param {KeyboardEvent} event - Keydown event
     */
    keyPress(event) {
      let calendarNavKey = true;
      switch (event.key) {
        case "ArrowLeft":
          this.picker.focusPreviousDay();
          break;
        case "ArrowRight":
          this.picker.focusNextDay();
          break;
        case "ArrowUp":
          this.picker.focusPreviousWeek();
          break;
        case "ArrowDown":
          this.picker.focusNextWeek();
          break;
        case "Home":
          this.picker.focusFirstDayOfWeek();
          break;
        case "End":
          this.picker.focusLastDayOfWeek();
          break;
        case "PageUp": {
          if (event.shiftKey) {
            this.picker.focusPreviousYear(event);
          } else {
            this.picker.focusPreviousMonth(event);
          }
          break;
        }
        case "PageDown": {
          if (event.shiftKey) {
            this.picker.focusNextYear(event);
          } else {
            this.picker.focusNextMonth(event);
          }
          break;
        }
        default:
          calendarNavKey = false;
          break;
      }
      if (calendarNavKey) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  // node_modules/@ministryofjustice/frontend/moj/components/domain-specific/probation/header/header.mjs
  var PdsHeader = class extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for PDS header
     */
    constructor($root) {
      super($root);
      this.initHeader();
    }
    initHeader() {
      this.$tabOpenClass = "probation-common-header__toggle-open";
      const $userToggle = this.$root.querySelector(".probation-common-header__user-menu-toggle");
      const $userMenu = this.$root.querySelector("#probation-common-header-user-menu");
      const $servicesToggle = this.$root.querySelector(".probation-common-header__services-menu-toggle");
      const $servicesMenu = this.$root.querySelector("#probation-common-header-services-menu");
      if (!$userToggle || !$userMenu || !$servicesToggle || !$servicesMenu || !($userToggle instanceof HTMLElement) || !($userMenu instanceof HTMLElement) || !($servicesToggle instanceof HTMLElement) || !($servicesMenu instanceof HTMLElement)) {
        return 0;
      }
      this.hideFallbackLinks();
      $userToggle.removeAttribute("hidden");
      $servicesToggle.removeAttribute("hidden");
      this.closeTabs([[$userToggle, $userMenu], [$servicesToggle, $servicesMenu]]);
      $userToggle.addEventListener("click", (_event) => {
        this.closeTabs([[$servicesToggle, $servicesMenu]]);
        this.toggleMenu($userToggle, $userMenu);
      });
      $servicesToggle.addEventListener("click", (_event) => {
        this.closeTabs([[$userToggle, $userMenu]]);
        this.toggleMenu($servicesToggle, $servicesMenu);
      });
    }
    /**
     * @param {[any, any][]} tabTuples
     */
    closeTabs(tabTuples) {
      tabTuples.forEach(([toggle, menu]) => {
        if (menu && toggle) {
          menu.setAttribute("hidden", "hidden");
          toggle.classList.remove(this.$tabOpenClass);
          toggle.parentElement.classList.remove("item-open");
          toggle.setAttribute("aria-expanded", "false");
          if (toggle.dataset.textForShow) toggle.setAttribute("aria-label", toggle.dataset.textForShow);
        }
      });
    }
    /**
     * @param {HTMLElement} toggle
     * @param {HTMLElement} menu
     */
    toggleMenu(toggle, menu) {
      const isOpen = !menu.getAttribute("hidden");
      if (isOpen) {
        this.closeTabs([[toggle, menu]]);
      } else if (menu && toggle) {
        menu.removeAttribute("hidden");
        toggle.classList.add(this.$tabOpenClass);
        toggle.parentElement.classList.add("item-open");
        toggle.setAttribute("aria-expanded", "true");
        if (toggle.dataset.textForHide) toggle.setAttribute("aria-label", toggle.dataset.textForHide);
      }
    }
    hideFallbackLinks() {
      const $userLink = this.$root.querySelector(".probation-common-header__user-menu-link");
      const $servicesLink = this.$root.querySelector(".probation-common-header__services-menu-link");
      if ($userLink) $userLink.setAttribute("hidden", "hidden");
      if ($servicesLink) $servicesLink.setAttribute("hidden", "hidden");
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  PdsHeader.moduleName = "pds-header";

  // node_modules/@ministryofjustice/frontend/moj/components/multi-select/multi-select.mjs
  var MultiSelect = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for multi select
     * @param {MultiSelectConfig} [config] - Multi select config
     */
    constructor($root, config = {}) {
      var _this$config$checkbox;
      super($root, config);
      const $container = this.$root.querySelector(`#${this.config.idPrefix}select-all`);
      const $checkboxes = (
        /** @type {NodeListOf<HTMLInputElement>} */
        (_this$config$checkbox = this.config.checkboxes.items) != null ? _this$config$checkbox : this.$root.querySelectorAll(this.config.checkboxes.selector)
      );
      if (!$container || !($container instanceof HTMLElement) || !$checkboxes.length) {
        return this;
      }
      this.setupToggle(this.config.idPrefix);
      this.$toggleButton = this.$toggle.querySelector("input");
      this.$toggleButton.addEventListener("click", this.onButtonClick.bind(this));
      this.$container = $container;
      this.$container.append(this.$toggle);
      this.$checkboxes = Array.from($checkboxes);
      this.$checkboxes.forEach(($input) => $input.addEventListener("click", this.onCheckboxClick.bind(this)));
      this.checked = config.checked || false;
    }
    setupToggle(idPrefix = "") {
      const id = `${idPrefix}checkboxes-all`;
      const $toggle = document.createElement("div");
      const $label = document.createElement("label");
      const $input = document.createElement("input");
      const $span = document.createElement("span");
      $toggle.classList.add("govuk-checkboxes__item", "govuk-checkboxes--small", "moj-multi-select__checkbox");
      $input.id = id;
      $input.type = "checkbox";
      $input.classList.add("govuk-checkboxes__input");
      $label.setAttribute("for", id);
      $label.classList.add("govuk-label", "govuk-checkboxes__label", "moj-multi-select__toggle-label");
      $span.classList.add("govuk-visually-hidden");
      $span.textContent = "Select all";
      $label.append($span);
      $toggle.append($input, $label);
      this.$toggle = $toggle;
    }
    onButtonClick() {
      if (this.checked) {
        this.uncheckAll();
        this.$toggleButton.checked = false;
      } else {
        this.checkAll();
        this.$toggleButton.checked = true;
      }
    }
    checkAll() {
      this.$checkboxes.forEach(($input) => {
        $input.checked = true;
      });
      this.checked = true;
    }
    uncheckAll() {
      this.$checkboxes.forEach(($input) => {
        $input.checked = false;
      });
      this.checked = false;
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    onCheckboxClick(event) {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }
      if (!event.target.checked) {
        this.$toggleButton.checked = false;
        this.checked = false;
      } else {
        if (this.$checkboxes.filter(($input) => $input.checked).length === this.$checkboxes.length) {
          this.$toggleButton.checked = true;
          this.checked = true;
        }
      }
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  MultiSelect.moduleName = "moj-multi-select";
  MultiSelect.defaults = Object.freeze({
    idPrefix: "",
    checkboxes: {
      selector: "tbody input.govuk-checkboxes__input"
    }
  });
  MultiSelect.schema = Object.freeze(
    /** @type {const} */
    {
      properties: {
        idPrefix: {
          type: "string"
        },
        checked: {
          type: "boolean"
        },
        checkboxes: {
          type: "object"
        }
      }
    }
  );

  // node_modules/@ministryofjustice/frontend/moj/components/password-reveal/password-reveal.mjs
  var PasswordReveal = class extends Component {
    /**
     * @param {Element | null} $root - HTML element to use for password reveal
     */
    constructor($root) {
      super($root);
      const $input = this.$root.querySelector(".govuk-input");
      if (!$input || !($input instanceof HTMLInputElement)) {
        return this;
      }
      this.$input = $input;
      this.$input.setAttribute("spellcheck", "false");
      this.createButton();
    }
    createButton() {
      this.$group = document.createElement("div");
      this.$button = document.createElement("button");
      this.$button.setAttribute("type", "button");
      this.$root.classList.add("moj-password-reveal");
      this.$group.classList.add("moj-password-reveal__wrapper");
      this.$button.classList.add("govuk-button", "govuk-button--secondary", "moj-password-reveal__button");
      this.$button.innerHTML = 'Show <span class="govuk-visually-hidden">password</span>';
      this.$button.addEventListener("click", this.onButtonClick.bind(this));
      this.$group.append(this.$input, this.$button);
      this.$root.append(this.$group);
    }
    onButtonClick() {
      if (this.$input.type === "password") {
        this.$input.type = "text";
        this.$button.innerHTML = 'Hide <span class="govuk-visually-hidden">password</span>';
      } else {
        this.$input.type = "password";
        this.$button.innerHTML = 'Show <span class="govuk-visually-hidden">password</span>';
      }
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  PasswordReveal.moduleName = "moj-password-reveal";

  // node_modules/@ministryofjustice/frontend/moj/components/rich-text-editor/rich-text-editor.mjs
  var RichTextEditor = class _RichTextEditor extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for rich text editor
     * @param {RichTextEditorConfig} config
     */
    constructor($root, config = {}) {
      super($root, config);
      if (!_RichTextEditor.isSupported()) {
        return this;
      }
      const $textarea = this.$root.querySelector(".govuk-textarea");
      if (!$textarea || !($textarea instanceof HTMLTextAreaElement)) {
        return this;
      }
      this.$textarea = $textarea;
      this.createToolbar();
      this.hideDefault();
      this.configureToolbar();
      this.keys = {
        left: 37,
        right: 39,
        up: 38,
        down: 40
      };
      this.$content.addEventListener("input", this.onEditorInput.bind(this));
      this.$root.querySelector("label").addEventListener("click", this.onLabelClick.bind(this));
      this.$toolbar.addEventListener("keydown", this.onToolbarKeydown.bind(this));
    }
    /**
     * @param {KeyboardEvent} event - Click event
     */
    onToolbarKeydown(event) {
      let $focusableButton;
      switch (event.keyCode) {
        case this.keys.right:
        case this.keys.down: {
          $focusableButton = this.$buttons.find((button) => button.getAttribute("tabindex") === "0");
          if ($focusableButton) {
            const $nextButton = $focusableButton.nextElementSibling;
            if ($nextButton && $nextButton instanceof HTMLButtonElement) {
              $nextButton.focus();
              $focusableButton.setAttribute("tabindex", "-1");
              $nextButton.setAttribute("tabindex", "0");
            }
          }
          break;
        }
        case this.keys.left:
        case this.keys.up: {
          $focusableButton = this.$buttons.find((button) => button.getAttribute("tabindex") === "0");
          if ($focusableButton) {
            const $previousButton = $focusableButton.previousElementSibling;
            if ($previousButton && $previousButton instanceof HTMLButtonElement) {
              $previousButton.focus();
              $focusableButton.setAttribute("tabindex", "-1");
              $previousButton.setAttribute("tabindex", "0");
            }
          }
          break;
        }
      }
    }
    getToolbarHtml() {
      let html = "";
      html += '<div class="moj-rich-text-editor__toolbar" role="toolbar">';
      if (this.config.toolbar.bold) {
        html += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--bold" type="button" data-command="bold"><span class="govuk-visually-hidden">Bold</span></button>';
      }
      if (this.config.toolbar.italic) {
        html += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--italic" type="button" data-command="italic"><span class="govuk-visually-hidden">Italic</span></button>';
      }
      if (this.config.toolbar.underline) {
        html += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--underline" type="button" data-command="underline"><span class="govuk-visually-hidden">Underline</span></button>';
      }
      if (this.config.toolbar.bullets) {
        html += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--unordered-list" type="button" data-command="insertUnorderedList"><span class="govuk-visually-hidden">Unordered list</span></button>';
      }
      if (this.config.toolbar.numbers) {
        html += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--ordered-list" type="button" data-command="insertOrderedList"><span class="govuk-visually-hidden">Ordered list</span></button>';
      }
      html += "</div>";
      return html;
    }
    getEnhancedHtml() {
      return `${this.getToolbarHtml()}<div class="govuk-textarea moj-rich-text-editor__content" contenteditable="true" spellcheck="false"></div>`;
    }
    hideDefault() {
      this.$textarea.classList.add("govuk-visually-hidden");
      this.$textarea.setAttribute("aria-hidden", "true");
      this.$textarea.setAttribute("tabindex", "-1");
    }
    createToolbar() {
      this.$toolbar = document.createElement("div");
      this.$toolbar.className = "moj-rich-text-editor";
      this.$toolbar.innerHTML = this.getEnhancedHtml();
      this.$root.append(this.$toolbar);
      this.$content = /** @type {HTMLElement} */
      this.$root.querySelector(".moj-rich-text-editor__content");
      this.$content.innerHTML = this.$textarea.value;
    }
    configureToolbar() {
      this.$buttons = Array.from(
        /** @type {NodeListOf<HTMLButtonElement>} */
        this.$root.querySelectorAll(".moj-rich-text-editor__toolbar-button")
      );
      this.$buttons.forEach(($button, index) => {
        $button.setAttribute("tabindex", !index ? "0" : "-1");
        $button.addEventListener("click", this.onButtonClick.bind(this));
      });
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    onButtonClick(event) {
      if (!(event.currentTarget instanceof HTMLElement)) {
        return;
      }
      document.execCommand(event.currentTarget.getAttribute("data-command"), false, void 0);
    }
    getContent() {
      return this.$content.innerHTML;
    }
    onEditorInput() {
      this.updateTextarea();
    }
    updateTextarea() {
      document.execCommand("defaultParagraphSeparator", false, "p");
      this.$textarea.value = this.getContent();
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    onLabelClick(event) {
      event.preventDefault();
      this.$content.focus();
    }
    static isSupported() {
      return "contentEditable" in document.documentElement;
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  RichTextEditor.moduleName = "moj-rich-text-editor";
  RichTextEditor.defaults = Object.freeze({
    toolbar: {
      bold: false,
      italic: false,
      underline: false,
      bullets: true,
      numbers: true
    }
  });
  RichTextEditor.schema = Object.freeze(
    /** @type {const} */
    {
      properties: {
        toolbar: {
          type: "object"
        }
      }
    }
  );

  // node_modules/@ministryofjustice/frontend/moj/components/search-toggle/search-toggle.mjs
  var SearchToggle = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for search toggle
     * @param {SearchToggleConfig} [config] - Search toggle config
     */
    constructor($root, config = {}) {
      var _this$config$searchCo, _this$config$toggleBu;
      super($root, config);
      const $searchContainer = (_this$config$searchCo = this.config.searchContainer.element) != null ? _this$config$searchCo : this.$root.querySelector(this.config.searchContainer.selector);
      const $toggleButtonContainer = (_this$config$toggleBu = this.config.toggleButtonContainer.element) != null ? _this$config$toggleBu : this.$root.querySelector(this.config.toggleButtonContainer.selector);
      if (!$searchContainer || !$toggleButtonContainer || !($searchContainer instanceof HTMLElement) || !($toggleButtonContainer instanceof HTMLElement)) {
        return this;
      }
      this.$searchContainer = $searchContainer;
      this.$toggleButtonContainer = $toggleButtonContainer;
      const svg = '<svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="moj-search-toggle__button__icon"><path d="M7.433,12.5790048 C6.06762625,12.5808611 4.75763941,12.0392925 3.79217348,11.0738265 C2.82670755,10.1083606 2.28513891,8.79837375 2.28699522,7.433 C2.28513891,6.06762625 2.82670755,4.75763941 3.79217348,3.79217348 C4.75763941,2.82670755 6.06762625,2.28513891 7.433,2.28699522 C8.79837375,2.28513891 10.1083606,2.82670755 11.0738265,3.79217348 C12.0392925,4.75763941 12.5808611,6.06762625 12.5790048,7.433 C12.5808611,8.79837375 12.0392925,10.1083606 11.0738265,11.0738265 C10.1083606,12.0392925 8.79837375,12.5808611 7.433,12.5790048 L7.433,12.5790048 Z M14.293,12.579 L13.391,12.579 L13.071,12.269 C14.2300759,10.9245158 14.8671539,9.20813198 14.866,7.433 C14.866,3.32786745 11.5381325,-1.65045755e-15 7.433,-1.65045755e-15 C3.32786745,-1.65045755e-15 -1.65045755e-15,3.32786745 -1.65045755e-15,7.433 C-1.65045755e-15,11.5381325 3.32786745,14.866 7.433,14.866 C9.208604,14.8671159 10.9253982,14.2296624 12.27,13.07 L12.579,13.39 L12.579,14.294 L18.296,20 L20,18.296 L14.294,12.579 L14.293,12.579 Z"></path></svg>';
      this.$toggleButton = document.createElement("button");
      this.$toggleButton.setAttribute("class", "moj-search-toggle__button");
      this.$toggleButton.setAttribute("type", "button");
      this.$toggleButton.setAttribute("aria-haspopup", "true");
      this.$toggleButton.setAttribute("aria-expanded", "false");
      this.$toggleButton.innerHTML = `${this.config.toggleButton.text} ${svg}`;
      this.$toggleButton.addEventListener("click", this.onToggleButtonClick.bind(this));
      this.$toggleButtonContainer.append(this.$toggleButton);
      document.addEventListener("click", this.onDocumentClick.bind(this));
      document.addEventListener("focusin", this.onDocumentClick.bind(this));
    }
    showMenu() {
      this.$toggleButton.setAttribute("aria-expanded", "true");
      this.$searchContainer.classList.remove("moj-js-hidden");
      this.$searchContainer.querySelector("input").focus();
    }
    hideMenu() {
      this.$searchContainer.classList.add("moj-js-hidden");
      this.$toggleButton.setAttribute("aria-expanded", "false");
    }
    onToggleButtonClick() {
      if (this.$toggleButton.getAttribute("aria-expanded") === "false") {
        this.showMenu();
      } else {
        this.hideMenu();
      }
    }
    /**
     * @param {MouseEvent | FocusEvent} event
     */
    onDocumentClick(event) {
      if (event.target instanceof Node && !this.$toggleButtonContainer.contains(event.target) && !this.$searchContainer.contains(event.target)) {
        this.hideMenu();
      }
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  SearchToggle.moduleName = "moj-search-toggle";
  SearchToggle.defaults = Object.freeze({
    searchContainer: {
      selector: ".moj-search"
    },
    toggleButton: {
      text: "Search"
    },
    toggleButtonContainer: {
      selector: ".moj-search-toggle__toggle"
    }
  });
  SearchToggle.schema = Object.freeze(
    /** @type {const} */
    {
      properties: {
        searchContainer: {
          type: "object"
        },
        toggleButton: {
          type: "object"
        },
        toggleButtonContainer: {
          type: "object"
        }
      }
    }
  );

  // node_modules/@ministryofjustice/frontend/moj/components/sortable-table/sortable-table.mjs
  var SortableTable = class extends ConfigurableComponent {
    /**
     * @param {Element | null} $root - HTML element to use for sortable table
     * @param {SortableTableConfig} [config] - Sortable table config
     */
    constructor($root, config = {}) {
      super($root, config);
      const $head = $root == null ? void 0 : $root.querySelector("thead");
      const $body = $root == null ? void 0 : $root.querySelector("tbody");
      if (!$head || !$body) {
        return this;
      }
      this.$head = $head;
      this.$body = $body;
      this.$caption = this.$root.querySelector("caption");
      this.$upArrow = `<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.5625 15.5L11 6.63125L15.4375 15.5H6.5625Z" fill="currentColor"/>
</svg>`;
      this.$downArrow = `<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.4375 7L11 15.8687L6.5625 7L15.4375 7Z" fill="currentColor"/>
</svg>`;
      this.$upDownArrow = `<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.1875 9.5L10.9609 3.95703L13.7344 9.5H8.1875Z" fill="currentColor"/>
<path d="M13.7344 12.0781L10.9609 17.6211L8.1875 12.0781H13.7344Z" fill="currentColor"/>
</svg>`;
      this.$headings = this.$head ? Array.from(this.$head.querySelectorAll("th")) : [];
      this.createHeadingButtons();
      this.updateCaption();
      this.updateDirectionIndicators();
      this.createStatusBox();
      this.initialiseSortedColumn();
      this.$head.addEventListener("click", this.onSortButtonClick.bind(this));
    }
    createHeadingButtons() {
      for (const $heading of this.$headings) {
        if ($heading.hasAttribute("aria-sort")) {
          this.createHeadingButton($heading);
        }
      }
    }
    /**
     * @param {HTMLTableCellElement} $heading
     */
    createHeadingButton($heading) {
      const index = this.$headings.indexOf($heading);
      const $button = document.createElement("button");
      $button.setAttribute("type", "button");
      $button.setAttribute("data-index", `${index}`);
      $button.textContent = $heading.textContent;
      $heading.textContent = "";
      $heading.appendChild($button);
    }
    createStatusBox() {
      this.$status = document.createElement("div");
      this.$status.setAttribute("aria-atomic", "true");
      this.$status.setAttribute("aria-live", "polite");
      this.$status.setAttribute("class", "govuk-visually-hidden");
      this.$status.setAttribute("role", "status");
      this.$root.insertAdjacentElement("afterend", this.$status);
    }
    initialiseSortedColumn() {
      var _$sortButton$getAttri;
      const $rows = this.getTableRowsArray();
      const $heading = this.$root.querySelector('th[aria-sort="ascending"], th[aria-sort="descending"]');
      const $sortButton = $heading == null ? void 0 : $heading.querySelector("button");
      const sortDirection = $heading == null ? void 0 : $heading.getAttribute("aria-sort");
      const columnNumber = Number.parseInt((_$sortButton$getAttri = $sortButton == null ? void 0 : $sortButton.getAttribute("data-index")) != null ? _$sortButton$getAttri : "0", 10);
      if (!$heading || !$sortButton || !(sortDirection === "ascending" || sortDirection === "descending")) {
        return;
      }
      const $sortedRows = this.sort($rows, columnNumber, sortDirection);
      this.addRows($sortedRows);
    }
    /**
     * @param {MouseEvent} event - Click event
     */
    onSortButtonClick(event) {
      var _$button$getAttribute;
      const $target = (
        /** @type {HTMLElement} */
        event.target
      );
      const $button = $target.closest("button");
      if (!$button || !($button instanceof HTMLButtonElement) || !$button.parentElement) {
        return;
      }
      const $heading = $button.parentElement;
      const sortDirection = $heading.getAttribute("aria-sort");
      const columnNumber = Number.parseInt((_$button$getAttribute = $button == null ? void 0 : $button.getAttribute("data-index")) != null ? _$button$getAttribute : "0", 10);
      const newSortDirection = sortDirection === "none" || sortDirection === "descending" ? "ascending" : "descending";
      const $rows = this.getTableRowsArray();
      const $sortedRows = this.sort($rows, columnNumber, newSortDirection);
      this.addRows($sortedRows);
      this.removeButtonStates();
      this.updateButtonState($button, newSortDirection);
      this.updateDirectionIndicators();
    }
    updateCaption() {
      if (!this.$caption) {
        return;
      }
      let assistiveText = this.$caption.querySelector(".govuk-visually-hidden");
      if (assistiveText) {
        return;
      }
      assistiveText = document.createElement("span");
      assistiveText.classList.add("govuk-visually-hidden");
      assistiveText.textContent = "\u2008(column headers with buttons are sortable).";
      this.$caption.appendChild(assistiveText);
    }
    /**
     * @param {HTMLButtonElement} $button
     * @param {string} direction
     */
    updateButtonState($button, direction) {
      if (!(direction === "ascending" || direction === "descending")) {
        return;
      }
      $button.parentElement.setAttribute("aria-sort", direction);
      let message = this.config.statusMessage;
      message = message.replace(/%heading%/, $button.textContent);
      message = message.replace(/%direction%/, this.config[`${direction}Text`]);
      this.$status.textContent = message;
    }
    updateDirectionIndicators() {
      for (const $heading of this.$headings) {
        const $button = (
          /** @type {HTMLButtonElement} */
          $heading.querySelector("button")
        );
        if ($heading.hasAttribute("aria-sort") && $button) {
          var _$button$querySelecto;
          const direction = $heading.getAttribute("aria-sort");
          (_$button$querySelecto = $button.querySelector("svg")) == null || _$button$querySelecto.remove();
          switch (direction) {
            case "ascending":
              $button.insertAdjacentHTML("beforeend", this.$upArrow);
              break;
            case "descending":
              $button.insertAdjacentHTML("beforeend", this.$downArrow);
              break;
            default:
              $button.insertAdjacentHTML("beforeend", this.$upDownArrow);
          }
        }
      }
    }
    removeButtonStates() {
      for (const $heading of this.$headings) {
        $heading.setAttribute("aria-sort", "none");
      }
    }
    /**
     * @param {HTMLTableRowElement[]} $rows
     */
    addRows($rows) {
      for (const $row of $rows) {
        this.$body.append($row);
      }
    }
    getTableRowsArray() {
      return Array.from(this.$body.querySelectorAll("tr"));
    }
    /**
     * @param {HTMLTableRowElement[]} $rows
     * @param {number} columnNumber
     * @param {string} sortDirection
     */
    sort($rows, columnNumber, sortDirection) {
      return $rows.sort(($rowA, $rowB) => {
        const $tdA = $rowA.querySelectorAll("td, th")[columnNumber];
        const $tdB = $rowB.querySelectorAll("td, th")[columnNumber];
        if (!$tdA || !$tdB || !($tdA instanceof HTMLElement) || !($tdB instanceof HTMLElement)) {
          return 0;
        }
        const valueA = sortDirection === "ascending" ? this.getCellValue($tdA) : this.getCellValue($tdB);
        const valueB = sortDirection === "ascending" ? this.getCellValue($tdB) : this.getCellValue($tdA);
        return !(typeof valueA === "number" && typeof valueB === "number") ? valueA.toString().localeCompare(valueB.toString()) : valueA - valueB;
      });
    }
    /**
     * @param {HTMLElement} $cell
     */
    getCellValue($cell) {
      const val = $cell.getAttribute("data-sort-value") || $cell.innerHTML;
      const valAsNumber = Number(val);
      return Number.isFinite(valAsNumber) ? valAsNumber : val;
    }
    /**
     * Name for the component used when initialising using data-module attributes.
     */
  };
  SortableTable.moduleName = "moj-sortable-table";
  SortableTable.defaults = Object.freeze({
    statusMessage: "Sort by %heading% (%direction%)",
    ascendingText: "ascending",
    descendingText: "descending"
  });
  SortableTable.schema = Object.freeze(
    /** @type {const} */
    {
      properties: {
        statusMessage: {
          type: "string"
        },
        ascendingText: {
          type: "string"
        },
        descendingText: {
          type: "string"
        }
      }
    }
  );

  // node_modules/@ministryofjustice/frontend/moj/all.mjs
  function initAll2(scopeOrConfig) {
    for (const Component2 of [AddAnother, Alert, ButtonMenu, DatePicker, MultiSelect, PasswordReveal, PdsHeader, RichTextEditor, SearchToggle, SortableTable]) {
      createAll(Component2, void 0, scopeOrConfig);
    }
  }

  // assets/js/cookieConsent.ts
  var CookieConsent = function __CookieConsent() {
    const cookieName = "cookie_consent";
    const cookieMaxAgeDays = 365;
    this.acceptCookies = function __acceptCookies() {
      this.setCookie(cookieName, "accepted", cookieMaxAgeDays);
      this.hideCookieBanners();
    };
    this.rejectCookies = function __rejectCookies() {
      this.setCookie(cookieName, "rejected", cookieMaxAgeDays);
      this.hideCookieBanners();
    };
    this.start = function __start() {
      const banner = document.querySelector(".govuk-cookie-banner");
      if (banner) {
        const acceptButton = banner.querySelector('button[value="yes"]');
        const rejectButton = banner.querySelector('button[value="no"]');
        if (acceptButton) {
          acceptButton.addEventListener("click", this.acceptCookies);
        }
        if (rejectButton) {
          rejectButton.addEventListener("click", this.rejectCookies);
        }
        this.hideCookieBanners();
      }
    };
    this.setCookie = function __setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1e3).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    };
    this.getCookie = function __getCookie(name) {
      const prefix = `${name}=`;
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const match = cookies.find((cookie) => cookie.startsWith(prefix));
      return match ? decodeURIComponent(match.substring(prefix.length)) : null;
    };
    this.hideCookieBanners = function __hideCookieBanners() {
      const consent = this.getCookie(cookieName);
      if (consent === "accepted" || consent === "rejected") {
        const banner = document.querySelector(".govuk-cookie-banner");
        if (banner) {
          banner.setAttribute("hidden", "hidden");
        }
      }
    };
    this.start();
    return this;
  };
  var cookieConsent_default = CookieConsent;

  // assets/js/index.js
  initAll();
  initAll2();
  document.addEventListener("DOMContentLoaded", function initialiseCookieConsent() {
    window.cookieConsent = new cookieConsent_default();
  });
})();
/*! Bundled license information:

govuk-frontend/dist/govuk/components/accordion/accordion.mjs:
  (**
   * Accordion component
   *
   * This allows a collection of sections to be collapsed by default, showing only
   * their headers. Sections can be expanded or collapsed individually by clicking
   * their headers. A "Show all sections" button is also added to the top of the
   * accordion, which switches to "Hide all sections" when all the sections are
   * expanded.
   *
   * The state of each section is saved to the DOM via the `aria-expanded`
   * attribute, which also provides accessibility.
   *
   * @preserve
   * @augments ConfigurableComponent<AccordionConfig>
   *)

govuk-frontend/dist/govuk/components/button/button.mjs:
  (**
   * JavaScript enhancements for the Button component
   *
   * @preserve
   * @augments ConfigurableComponent<ButtonConfig>
   *)

govuk-frontend/dist/govuk/components/character-count/character-count.mjs:
  (**
   * Character count component
   *
   * Tracks the number of characters or words in the `.govuk-js-character-count`
   * `<textarea>` inside the element. Displays a message with the remaining number
   * of characters/words available, or the number of characters/words in excess.
   *
   * You can configure the message to only appear after a certain percentage
   * of the available characters/words has been entered.
   *
   * @preserve
   * @augments ConfigurableComponent<CharacterCountConfig>
   *)

govuk-frontend/dist/govuk/components/checkboxes/checkboxes.mjs:
  (**
   * Checkboxes component
   *
   * @preserve
   *)

govuk-frontend/dist/govuk/components/error-summary/error-summary.mjs:
  (**
   * Error summary component
   *
   * Takes focus on initialisation for accessible announcement, unless disabled in
   * configuration.
   *
   * @preserve
   * @augments ConfigurableComponent<ErrorSummaryConfig>
   *)

govuk-frontend/dist/govuk/components/exit-this-page/exit-this-page.mjs:
  (**
   * Exit this page component
   *
   * @preserve
   * @augments ConfigurableComponent<ExitThisPageConfig>
   *)

govuk-frontend/dist/govuk/components/file-upload/file-upload.mjs:
  (**
   * File upload component
   *
   * @preserve
   * @augments ConfigurableComponent<FileUploadConfig>
   *)

govuk-frontend/dist/govuk/components/notification-banner/notification-banner.mjs:
  (**
   * Notification Banner component
   *
   * @preserve
   * @augments ConfigurableComponent<NotificationBannerConfig>
   *)

govuk-frontend/dist/govuk/components/password-input/password-input.mjs:
  (**
   * Password input component
   *
   * @preserve
   * @augments ConfigurableComponent<PasswordInputConfig>
   *)

govuk-frontend/dist/govuk/components/radios/radios.mjs:
  (**
   * Radios component
   *
   * @preserve
   *)

govuk-frontend/dist/govuk/components/service-navigation/service-navigation.mjs:
  (**
   * Service Navigation component
   *
   * @preserve
   *)

govuk-frontend/dist/govuk/components/skip-link/skip-link.mjs:
  (**
   * Skip link component
   *
   * @preserve
   * @augments Component<HTMLAnchorElement>
   *)

govuk-frontend/dist/govuk/components/tabs/tabs.mjs:
  (**
   * Tabs component
   *
   * @preserve
   *)
*/
//# sourceMappingURL=index.S7F2I6KO.js.map
