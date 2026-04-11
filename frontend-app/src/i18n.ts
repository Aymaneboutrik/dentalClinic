import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@assets/translations/en.json";
import mm from "@assets/translations/mm.json";
import useUserPreference from "@stores/user-preference";

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: en, // Fallback to English for French browsers for now
  },
  mm: {
    translation: mm,
  },
};


i18n.use(initReactI18next).init({
  resources,
  lng: useUserPreference.getState().lang || "en",
  fallbackLng: useUserPreference.getState().lang || "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
