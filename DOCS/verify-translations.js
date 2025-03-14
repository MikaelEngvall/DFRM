/**
 * Skript för att kontrollera att alla språkfiler har samma nyckelstruktur
 * 
 * För att köra: 
 * node verify-translations.js
 */

const fs = require('fs');
const path = require('path');

// Sökvägar till språkfiler
const LOCALES_DIR = path.join(__dirname, '../frontend/src/locales');
const LANGUAGES = ['sv', 'en', 'pl', 'uk'];

/**
 * Extrahera alla nycklar från ett översättningsobjekt rekursivt
 */
function extractKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((keys, key) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return [...keys, ...extractKeys(obj[key], currentKey)];
    }
    return [...keys, currentKey];
  }, []);
}

/**
 * Läs in en språkfil och returnera innehållet
 */
function readLocaleFile(language) {
  try {
    const filePath = path.join(LOCALES_DIR, `${language}.js`);
    // Eftersom vi inte kan använda require i ett skript, 
    // läser vi filen och extraherar objektet manuellt
    const content = fs.readFileSync(filePath, 'utf8');
    // Enkel parsning för att extrahera objektet (inte perfekt men bör fungera för detta syfte)
    const objectContent = content.replace(/export\s+default\s+/, '');
    // Använd eval för att konvertera sträng till objekt (endast för testverktyg)
    // eslint-disable-next-line no-eval
    return eval(`(${objectContent})`);
  } catch (error) {
    console.error(`Error reading locale file for ${language}:`, error);
    return {};
  }
}

/**
 * Huvudfunktion för att kontrollera översättningar
 */
function verifyTranslations() {
  
  // Läs in alla språkfiler
  const locales = {};
  LANGUAGES.forEach(lang => {
    locales[lang] = readLocaleFile(lang);
  });
  
  // Extrahera nycklar från svenska (referensspråk)
  const svKeys = extractKeys(locales.sv).sort();
  
  // Kontrollera varje språk mot svenska
  let hasErrors = false;
  
  LANGUAGES.filter(lang => lang !== 'sv').forEach(lang => {
    const langKeys = extractKeys(locales[lang]).sort();
    console.log(`\n${lang.toUpperCase()} contains ${langKeys.length} translation keys.`);
    
    // Hitta saknade nycklar
    const missingKeys = svKeys.filter(key => !langKeys.includes(key));
    if (missingKeys.length > 0) {
      hasErrors = true;
      console.log(`MISSING KEYS in ${lang}: ${missingKeys.length} keys are missing:`);
      missingKeys.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log(`OK: All keys from Swedish exist in ${lang}.`);
    }
    
    // Hitta extra nycklar som inte finns i svenska
    const extraKeys = langKeys.filter(key => !svKeys.includes(key));
    if (extraKeys.length > 0) {
      console.log(`EXTRA KEYS in ${lang}: ${extraKeys.length} keys are not in Swedish:`);
      extraKeys.forEach(key => console.log(`  - ${key}`));
    }
  });
  
  if (!hasErrors) {
    console.log('\nSUCCESS: All language files have the same key structure!');
  } else {
    console.log('\nFAILURE: Some language files are missing keys from the Swedish reference!');
    console.log('Please update the missing translations.');
  }
}

// Kör verifieringen
verifyTranslations(); 