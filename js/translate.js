function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'en,hi,ur,bn,ta,te,ml,kn,gu,mr,pa',
      autoDisplay: false
    },
    'google_translate_element'
  );
}
