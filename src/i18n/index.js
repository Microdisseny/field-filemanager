
import ca from './ca'
import en from './en'

const messages = (lang) => {
  const langs = {
    'ca': ca,
    'en': en
  }
  return (key) => {
    if (langs[lang] && langs[lang]['filemanager'] && langs[lang]['filemanager'][key]) {
      return langs[lang]['filemanager'][key]
    }

    return langs['en']['filemanager'][key] || key
  }
}

export default messages
