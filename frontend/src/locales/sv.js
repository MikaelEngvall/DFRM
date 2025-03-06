export default {
  common: {
    loading: 'Laddar...',
    error: 'Ett fel uppstod',
    save: 'Spara',
    cancel: 'Avbryt',
    delete: 'Ta bort',
    edit: 'Redigera',
    add: 'Lägg till',
    search: 'Sök',
    required: 'Obligatoriskt',
    yes: 'Ja',
    no: 'Nej',
  },

  navigation: {
    dashboard: 'Översikt',
    apartments: 'Lägenheter',
    tenants: 'Hyresgäster',
    keys: 'Nycklar',
    logout: 'Logga ut',
  },

  auth: {
    login: {
      title: 'Logga in på DFRM',
      email: 'E-post',
      password: 'Lösenord',
      submit: 'Logga in',
      error: {
        invalidCredentials: 'Felaktiga inloggningsuppgifter',
        tooManyAttempts: 'För många inloggningsförsök. Försök igen senare.',
        general: 'Ett fel uppstod vid inloggning. Försök igen senare.',
      },
    },
    session: {
      warning: {
        title: 'Sessionen håller på att gå ut',
        message: 'Du kommer att loggas ut automatiskt om {minutes} {minutes, plural, one {minut} other {minuter}}.',
        question: 'Vill du fortsätta din session?',
        extend: 'Fortsätt session',
        logout: 'Logga ut',
      },
    },
  },

  dashboard: {
    stats: {
      totalApartments: 'Totalt antal lägenheter',
      activeTenantsCount: 'Aktiva hyresgäster',
      totalKeys: 'Utdelade nycklar',
      vacantApartments: 'Lediga lägenheter',
    },
    sections: {
      recentActivity: 'Senaste aktiviteter',
      upcomingEvents: 'Kommande händelser',
      noActivity: 'Ingen aktivitet att visa',
      noEvents: 'Inga kommande händelser',
    },
  },

  apartments: {
    title: 'Lägenheter',
    addNew: 'Lägg till lägenhet',
    edit: 'Redigera lägenhet',
    fields: {
      street: 'Gata',
      number: 'Nummer',
      apartmentNumber: 'Lägenhetsnummer',
      postalCode: 'Postnummer',
      city: 'Stad',
      rooms: 'Antal rum',
      area: 'Yta (m²)',
      price: 'Hyra (kr)',
      features: {
        electricity: 'El ingår',
        storage: 'Förråd ingår',
        internet: 'Internet ingår',
      },
    },
    confirmDelete: 'Är du säker på att du vill ta bort denna lägenhet?',
    messages: {
      saveSuccess: 'Lägenheten har sparats',
      saveError: 'Ett fel uppstod när lägenheten skulle sparas',
      deleteSuccess: 'Lägenheten har tagits bort',
      deleteError: 'Ett fel uppstod när lägenheten skulle tas bort',
    },
  },

  tenants: {
    title: 'Hyresgäster',
    addNew: 'Lägg till hyresgäst',
    edit: 'Redigera hyresgäst',
    fields: {
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      personnummer: 'Personnummer',
      phoneNumber: 'Telefon',
      email: 'E-post',
      street: 'Gata',
      postalCode: 'Postnummer',
      city: 'Stad',
      movedInDate: 'Inflyttningsdatum',
      resiliationDate: 'Uppsägningsdatum',
      comment: 'Kommentar',
    },
    confirmDelete: 'Är du säker på att du vill ta bort denna hyresgäst?',
    messages: {
      saveSuccess: 'Hyresgästen har sparats',
      saveError: 'Ett fel uppstod när hyresgästen skulle sparas',
      deleteSuccess: 'Hyresgästen har tagits bort',
      deleteError: 'Ett fel uppstod när hyresgästen skulle tas bort',
    },
  },

  keys: {
    title: 'Nycklar',
    addNew: 'Lägg till nyckel',
    edit: 'Redigera nyckel',
    fields: {
      type: 'Typ',
      serie: 'Serie',
      number: 'Nummer',
      apartment: 'Lägenhet',
      tenant: 'Hyresgäst',
    },
    types: {
      main: 'Huvudnyckel',
      apartment: 'Lägenhetsnyckel',
      storage: 'Förrådsnyckel',
      gate: 'Portnyckel',
    },
    confirmDelete: 'Är du säker på att du vill ta bort denna nyckel?',
    messages: {
      saveSuccess: 'Nyckeln har sparats',
      saveError: 'Ett fel uppstod när nyckeln skulle sparas',
      deleteSuccess: 'Nyckeln har tagits bort',
      deleteError: 'Ett fel uppstod när nyckeln skulle tas bort',
    },
  },

  validation: {
    required: '{field} är obligatoriskt',
    email: 'Ogiltig e-postadress',
    password: {
      length: 'Lösenordet måste vara minst 8 tecken',
      uppercase: 'Lösenordet måste innehålla minst en versal',
      lowercase: 'Lösenordet måste innehålla minst en gemen',
      number: 'Lösenordet måste innehålla minst en siffra',
    },
    personnummer: 'Ogiltigt personnummer (format: YYYYMMDD-XXXX)',
    phoneNumber: 'Ogiltigt telefonnummer',
    postalCode: 'Ogiltigt postnummer',
    date: 'Ogiltigt datum',
    number: {
      invalid: '{field} måste vara ett nummer',
      min: '{field} måste vara minst {min}',
      max: '{field} måste vara högst {max}',
    },
  },
}; 