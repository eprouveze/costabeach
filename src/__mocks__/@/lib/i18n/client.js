const translations = {
  'common.contact': 'Contact',
  'auth.signIn': 'Sign In',
  'landing.heroTitle': 'Welcome to Costa Beach 3 HOA Portal',
  'landing.heroSubtitle': 'Access community information, documents, and more',
  'landing.registerCTA': 'Register',
  'landing.contactCTA': 'Contact Us',
  'landing.featuresTitle': 'Features',
  'landing.features.documents.title': 'Documents',
  'landing.features.documents.description': 'Access important HOA documents',
  'landing.features.community.title': 'Community',
  'landing.features.community.description': 'Connect with your community',
  'landing.features.notifications.title': 'Notifications',
  'landing.features.notifications.description': 'Stay updated with notifications',
  'landing.features.information.title': 'Information',
  'landing.features.information.description': 'Access community information',
  'landing.aboutTitle': 'About Costa Beach 3',
  'landing.aboutDescription1': 'Costa Beach 3 is a beautiful community',
  'landing.aboutDescription2': 'Join our community today',
  'landing.learnMoreCTA': 'Learn More',
  'landing.footer.description': 'Your community portal',
  'landing.footer.quickLinks': 'Quick Links',
  'landing.footer.contact': 'Contact',
  'common.home': 'Home',
  'auth.signUp': 'Sign Up',
  'landing.footer.copyright': 'All rights reserved'
};

const mockSetLocale = jest.fn();
const mockUseI18n = jest.fn(() => ({
  locale: 'en',
  setLocale: mockSetLocale,
  t: (key) => translations[key] || key,
  isLoading: false,
}));

module.exports = {
  useI18n: mockUseI18n
}; 