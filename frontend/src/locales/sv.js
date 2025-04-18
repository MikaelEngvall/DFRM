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
    select: 'Välj',
    selectOption: 'Välj alternativ',
    yes: 'Ja',
    no: 'Nej',
    close: 'Stäng',
    submit: 'Skicka',
    saveChanges: 'Spara ändringar',
    confirmDelete: 'Bekräfta borttagning',
    actions: 'Åtgärder',
    noData: 'Ingen data tillgänglig',
    back: 'Tillbaka',
    next: 'Nästa',
    none: 'Ingen',
    all: 'Alla',
    optional: 'Valfri',
    status: 'Status',
    rooms: 'rum',
    viewAll: 'Visa alla',
    clear: 'Rensa',
    apply: 'Tillämpa',
    filter: 'Filter',
    filters: 'Filter',
    noResults: 'Inga resultat',
    greeting: 'Hej',
    permissions: 'Behörigheter',
    unauthorized: 'Du har inte behörighet att utföra denna åtgärd',
    notSpecified: 'Ej angiven',
    send: 'Skicka',
    sendEmail: 'Skicka e-post',
    openLink: 'Öppna länk',
    at: 'kl.',
    forceUpdate: 'Tvinga uppdatering',
    export: 'Exportera',
    exporting: 'Exporterar...',
    email: 'E-post',
  },

  languages: {
    swedish: 'svenska',
    english: 'engelska',
    polish: 'polska',
    ukrainian: 'ukrainska',
    sv: 'Svenska',
    en: 'Engelska',
    pl: 'Polska',
    uk: 'Ukrainska'
  },

  navigation: {
    dashboard: 'Översikt',
    apartments: 'Lägenheter',
    tenants: 'Hyresgäster',
    keys: 'Nycklar',
    tasks: 'Uppgifter',
    calendar: 'Kalender',
    pendingTasks: 'Väntande uppgifter',
    interests: 'Intresseanmälningar',
    logout: 'Logga ut',
    profile: 'Profil',
    settings: 'Inställningar',
    darkMode: 'Mörkt läge',
    lightMode: 'Ljust läge',
    staff: 'Personal',
    import: 'Importera data',
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
    title: 'Översikt',
    stats: {
      totalApartments: 'Lägenheter',
      activeTenantsCount: 'Hyresgäster',
      totalKeys: 'Nycklar',
      vacantApartments: 'Lediga lgh',
    },
    sections: {
      recentActivity: 'Intresseanmälningar',
      upcomingEvents: 'Felanmälningar',
      noActivity: 'Inga just nu',
      noEvents: 'Inga just nu',
      newReportsNeedReview: 'nya behöver granskas',
      newReportNeedReview: 'ny behöver granskas',
    },
    interests: 'Intresseanmälningar',
  },

  apartments: {
    title: 'Lägenheter',
    addNew: 'Lägg till lägenhet',
    edit: 'Redigera lägenhet',
    vacant: 'Lediga lägenheter',
    all: 'Alla lägenheter',
    isVacant: 'Ledig',
    isOccupied: 'Uthyrd',
    filteredResults: 'lägenheter hittades',
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
        electricity: 'El',
        storage: 'Förråd',
        internet: 'Internet',
      },
      tenants: 'Hyresgäster',
      keys: 'Nycklar',
      noTenant: 'Ingen hyresgäst',
      noKey: 'Ingen nyckel',
    },
    confirmDelete: 'Är du säker på att du vill ta bort denna lägenhet?',
    deleteMessage: 'Är du säker på att du vill ta bort lägenheten {street} {number}, LGH {apartmentNumber}? Detta går inte att ångra.',
    messages: {
      saveSuccess: 'Lägenheten har sparats',
      saveError: 'Ett fel uppstod när lägenheten skulle sparas',
      deleteSuccess: 'Lägenheten har tagits bort',
      deleteError: 'Ett fel uppstod när lägenheten skulle tas bort',
      exportSuccess: 'Lägenheter har exporterats till SQL',
      exportError: 'Ett fel uppstod när lägenheterna skulle exporteras',
    },
    buttons: {
      add: 'Lägg till lägenhet',
      save: 'Spara lägenhet',
      cancel: 'Avbryt',
      delete: 'Ta bort',
    },
  },

  tenants: {
    title: 'Hyresgäster',
    addNew: 'Lägg till hyresgäst',
    edit: 'Redigera hyresgäst',
    keys: 'Nycklar',
    filteredResults: 'hyresgäster hittades',
    fields: {
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      personnummer: 'Personnummer',
      phoneNumber: 'Telefon',
      email: 'E-post',
      street: 'Gata',
      postalCode: 'Postnummer',
      city: 'Stad',
      movedInDate: 'IN',
      resiliationDate: 'UPS',
      comment: 'Kommentar',
      apartment: 'Lägenhet',
      noApartment: 'Ingen lägenhet',
      keys: 'Nycklar',
    },
    confirmDelete: 'Är du säker på att du vill ta bort denna hyresgäst?',
    deleteMessage: 'Är du säker på att du vill ta bort hyresgästen {firstName} {lastName}? Detta går inte att ångra.',
    messages: {
      saveSuccess: 'Hyresgästen har sparats',
      saveError: 'Ett fel uppstod när hyresgästen skulle sparas',
      deleteSuccess: 'Hyresgästen har tagits bort',
      deleteError: 'Ett fel uppstod när hyresgästen skulle tas bort',
      movedInDateRequired: 'Inflyttningsdatum krävs när en lägenhet tilldelas',
      exportSuccess: 'Hyresgäster har exporterats till SQL',
      exportError: 'Ett fel uppstod när hyresgästerna skulle exporteras',
    },
    buttons: {
      add: 'Lägg till hyresgäst',
      save: 'Spara hyresgäst',
      cancel: 'Avbryt',
      delete: 'Ta bort',
    },
  },

  keys: {
    title: 'Nycklar',
    addNew: 'Lägg till nyckel',
    edit: 'Redigera nyckel',
    details: 'Nyckeldetaljer',
    filteredResults: 'nycklar hittades',
    fields: {
      type: 'Typ',
      serie: 'Serie',
      number: 'Nummer',
      copyNumber: 'Kopia',
      apartment: 'Lägenhet',
      tenant: 'Hyresgäst',
      isAvailable: 'Tillgänglig',
      description: 'Beskrivning',
      noApartment: 'Ingen lägenhet',
      noTenant: 'Ingen hyresgäst',
    },
    types: {
      D: 'Dörr',
      P: 'Post',
      T: 'Tvätt',
      F: 'Förråd',
      G: 'Garage',
      HN: 'Huvudnyckel',
      Ö: 'Övrigt',
      selectType: 'Välj typ',
    },
    messages: {
      saveSuccess: 'Nyckeln har sparats',
      saveError: 'Ett fel uppstod när nyckeln skulle sparas',
      deleteSuccess: 'Nyckeln har tagits bort',
      deleteError: 'Ett fel uppstod när nyckeln skulle tas bort',
      exportSuccess: 'Nycklar har exporterats till SQL',
      exportError: 'Ett fel uppstod när nycklarna skulle exporteras',
    },
    confirmDelete: 'Är du säker på att du vill ta bort denna nyckel?',
    deleteMessage: 'Detta kommer att ta bort nyckeln och alla kopplingar till hyresgäster och lägenheter.',
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

  tasks: {
    title: 'Uppgifter',
    add: 'Lägg till uppgift',
    edit: 'Redigera uppgift',
    update: 'Uppdatera status',
    details: 'Uppgiftsinformation',
    information: 'Uppgiftsinformation',
    search: 'Sök uppgifter',
    view: 'Visa uppgift',
    addNew: 'Lägg till uppgift',
    pendingTitle: 'Väntande uppgifter',
    comments: 'Kommentarer',
    addComment: 'Lägg till kommentar',
    comment: 'Kommentar',
    postComment: 'Skicka kommentar',
    createSuccess: 'Skapade uppgift',
    updateSuccess: 'Uppdaterade uppgift',
    deleteSuccess: 'Tog bort uppgift',
    addCommentSuccess: 'Lade till kommentar',
    fields: {
      title: 'Titel',
      description: 'Beskrivning',
      dueDate: 'Förfallodatum',
      status: 'Status',
      priority: 'Prioritet',
      assignedUser: 'Tilldelad till',
      assignedBy: 'Tilldelad av',
      isRecurring: 'Återkommande',
      recurringPattern: 'Upprepningsmönster',
      completedDate: 'Avklarat datum',
      apartment: 'Lägenhet',
      tenant: 'Hyresgäst',
      descriptionLanguage: 'Beskrivningsspråk',
      phoneNumber: 'Telefonnummer',
      comments: 'Kommentarer',
      address: 'Adress',
      message: 'Meddelande',
      details: 'Detaljer',
      assignment: 'Tilldelning',
    },
    statuses: {
      NEW: 'Ny',
      PENDING: 'Väntande',
      IN_PROGRESS: 'Pågående',
      COMPLETED: 'Avslutad',
      CANCELLED: 'Avbruten',
      APPROVED: 'Godkänd',
      REJECTED: 'Avvisad',
      NOT_FEASIBLE: 'Ej genomförbar'
    },
    status: {
      NEW: 'Ny',
      PENDING: 'Väntande',
      IN_PROGRESS: 'Pågående',
      COMPLETED: 'Avslutad',
      CANCELLED: 'Avbruten'
    },
    priority: {
      LOW: 'Låg',
      MEDIUM: 'Medium',
      HIGH: 'Hög',
      URGENT: 'Akut',
      '1': 'Låg',
      '2': 'Medium',
      '3': 'Hög',
      '4': 'Akut',
    },
    priorities: {
      LOW: 'Låg',
      MEDIUM: 'Medium',
      HIGH: 'Hög',
      URGENT: 'Akut',
    },
    actions: {
      addNew: 'Lägg till uppgift',
      edit: 'Redigera',
      delete: 'Ta bort',
      assign: 'Tilldela',
      changeStatus: 'Ändra status',
      updateStatus: 'Uppdatera status',
      markInProgress: 'Markera som pågående',
      markCompleted: 'Markera som avslutad',
      addMessage: 'Lägg till meddelande',
      viewMessages: 'Visa meddelanden',
      startWork: 'Påbörja arbete',
      markComplete: 'Markera som avslutad',
    },
    messages: {
      updateSuccess: 'Uppgiften har uppdaterats',
      createSuccess: 'Uppgiften har skapats',
      deleteSuccess: 'Uppgiften har tagits bort',
      updateError: 'Ett fel uppstod vid uppdatering av uppgiften',
      createError: 'Ett fel uppstod vid skapande av uppgiften',
      deleteError: 'Ett fel uppstod vid borttagning av uppgiften',
      fetchError: 'Kunde inte hämta uppgiftsinformation',
      permissionError: 'Du saknar behörighet att utföra denna åtgärd',
      assignSuccess: 'Uppgiften har tilldelats',
      assignError: 'Kunde inte tilldela uppgiften',
      statusUpdateSuccess: 'Status har uppdaterats',
      statusUpdateError: 'Kunde inte uppdatera status',
      unauthorizedEdit: 'Du kan bara redigera dina egna uppgifter',
      unauthorizedCreate: 'Du har inte behörighet att skapa nya uppgifter',
      title: 'Meddelanden',
      inputPlaceholder: 'Skriv ditt meddelande här...',
      noMessages: 'Inga meddelanden att visa',
      error: 'Ett fel uppstod',
      saveError: 'Ett fel uppstod vid sparande av uppgiften',
      sendError: 'Ett fel uppstod vid skickande av meddelandet',
      translatedFrom: 'Översatt från {language}',
      translatedFrom: {
        SV: 'Översatt från svenska',
        EN: 'Översatt från engelska',
        PL: 'Översatt från polska',
        UK: 'Översatt från ukrainska'
      },
      delete: 'Ta bort',
      unknownUser: 'Okänd användare',
      exportSuccess: 'Uppgifter har exporterats till SQL',
      exportError: 'Ett fel uppstod när uppgifterna skulle exporteras',
    },
    confirmDelete: 'Är du säker på att du vill ta bort uppgiften?',
    noPendingTasks: 'Det finns inga väntande uppgifter',
    noTasks: 'Det finns inga uppgifter',
    dueOn: 'Förfaller',
    overdue: 'Försenad',
    searchPlaceholder: 'Sök uppgifter...',
    filterByStatus: 'Filtrera efter status',
    filterByPriority: 'Filtrera efter prioritet',
    assigned: 'Tilldelad',
    unassigned: 'Ej tilldelad',
    recurring: {
      title: 'Återkommande uppgift',
      pattern: 'Mönster',
      frequency: 'Frekvens',
      daily: 'Dagligen',
      weekly: 'Varje vecka',
      monthly: 'Varje månad',
      custom: 'Anpassad',
      onDay: 'På dag',
      every: 'Varje',
      days: 'dagar',
      weeks: 'veckor',
      months: 'månader',
      startDate: 'Startdatum',
      endDate: 'Slutdatum',
      noEndDate: 'Inget slutdatum'
    },
    recurringPatterns: {
      DAILY: 'Dagligen',
      WEEKLY: 'Varje vecka',
      BIWEEKLY: 'Varannan vecka',
      MONTHLY: 'Varje månad',
      QUARTERLY: 'Varje kvartal', 
      YEARLY: 'Årligen'
    },
    filters: {
      apartment: 'Lägenhet',
      tenant: 'Hyresgäst',
      priority: 'Prioritet',
      status: 'Status',
      date: 'Datum',
      all: 'Alla uppgifter',
      today: 'Idag',
      tomorrow: 'Imorgon',
      thisWeek: 'Denna vecka',
      overdue: 'Försenade',
      completed: 'Avslutade',
    },
    notFound: 'Uppgiften hittades inte',
    filteredResults: 'uppgifter hittades',
    errors: {
      updateError: 'Ett fel uppstod vid uppdatering av uppgiften',
      createError: 'Ett fel uppstod vid skapande av uppgiften',
    }
  },

  pendingTasks: {
    title: 'Väntande uppgifter',
    noTasks: 'Inga väntande uppgifter att visa',
    noApprovedTasks: 'Inga godkända uppgifter att visa',
    showApproved: 'Visa godkända',
    emailReport: 'Väntande uppgift',
    fields: {
      task: 'Uppgift',
      requestedBy: 'Efterfrågad av',
      requestedAt: 'Efterfrågad den',
      requestComments: 'Kommentarer från användare',
      reviewedBy: 'Granskad av',
      reviewedAt: 'Granskad den',
      reviewComments: 'Granskningskommentarer',
      sender: 'Från',
      contactInfo: 'Kontaktinformation',
      email: 'E-post',
      phone: 'Telefon',
      address: 'Adress',
      apt: 'lgh',
      description: 'Beskrivning'
    },
    actions: {
      approve: 'Godkänn',
      reject: 'Avvisa',
      checkEmails: 'Läs e-post'
    },
    messages: {
      approveSuccess: 'Uppgiften har godkänts',
      approveError: 'Ett fel uppstod vid godkännande av uppgiften',
      rejectSuccess: 'Uppgiften har avvisats',
      rejectError: 'Ett fel uppstod vid avvisning av uppgiften',
      createSuccess: 'Förfrågan har skapats',
      createError: 'Ett fel uppstod när förfrågan skulle skapas',
      approvedTasksError: 'Ett fel uppstod när godkända uppgifter skulle hämtas',
      emailCheckError: 'Ett fel uppstod vid läsning av e-post',
      exportSuccess: 'Väntande uppgifter har exporterats till SQL',
      exportError: 'Ett fel uppstod när väntande uppgifter skulle exporteras',
    },
    noDescription: 'Ingen beskrivning',
    reviewRequest: 'Granska förfrågan',
    addComments: 'Lägg till kommentarer',
    reviewedBy: 'Granskad av',
    reviewedAt: 'Granskad den',
  },

  calendar: {
    title: 'Kalender',
    today: 'Idag',
    month: 'Månad',
    week: 'Vecka',
    day: 'Dag',
    previousMonth: 'Föregående månad',
    nextMonth: 'Nästa månad',
    previousWeek: 'Föregående vecka',
    nextWeek: 'Nästa vecka',
    previousDay: 'Föregående dag',
    nextDay: 'Nästa dag',
    noEvents: 'Inga händelser',
    task: 'Uppgift',
    tasks: 'Uppgifter',
    showing: 'Visning',
    showings: 'Visningar',
    addTask: 'Lägg till uppgift',
    details: 'Detaljer',
    errors: {
      fetchFailed: 'Kunde inte hämta kalenderdata',
      permissionDenied: 'Du har inte behörighet att utföra denna åtgärd'
    },
    viewOnly: 'Som USER ser du alla uppgifter i kalendern men kan bara redigera dina egna',
    permissions: {
      editOwn: 'Som USER kan du bara redigera dina egna uppgifter',
      admin: 'Som ADMIN/SUPERADMIN kan du se och redigera alla uppgifter och visningar'
    },
    weekdaysShort: {
      mon: 'Mån',
      tue: 'Tis',
      wed: 'Ons',
      thu: 'Tor',
      fri: 'Fre',
      sat: 'Lör',
      sun: 'Sön',
    }
  },

  staff: {
    title: 'Personal',
    add: 'Lägg till användare',
    edit: 'Redigera personal',
    myProfile: 'Min profil',
    fields: {
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      email: 'E-post',
      phone: 'Telefonnummer',
      password: 'Lösenord',
      role: 'Roll',
      active: 'Aktiv',
      lastLogin: 'Senaste inloggning',
      leaveBlankToKeep: 'Lämna tomt för att behålla nuvarande',
      preferredLanguage: 'Föredraget språk',
    },
    roles: {
      USER: 'Användare',
      ADMIN: 'Admin',
      SUPERADMIN: 'Superadmin',
      ROLE_USER: 'Användare',
      ROLE_ADMIN: 'Admin',
      ROLE_SUPERADMIN: 'Superadmin',
    },
    messages: {
      unauthorized: 'Du har inte behörighet att utföra denna åtgärd',
      saveSuccess: 'Användaren har sparats',
      saveError: 'Ett fel uppstod vid sparande av användaren',
      deleteSuccess: 'Användaren har tagits bort',
      deleteError: 'Ett fel uppstod vid borttagning av användaren',
      cannotDeleteSelf: 'Du kan inte ta bort ditt eget konto',
    },
    confirmDelete: 'Är du säker på att du vill ta bort denna personal?',
    deleteMessage: 'Är du säker på att du vill ta bort {firstName} {lastName}? Detta går inte att ångra.',
    activeStatus: 'Aktiveringsstatus',
    activeStatusDescription: 'Användaren är aktiv och kan logga in i systemet.',
    inactiveStatusDescription: 'Användaren är inaktiverad och kan inte logga in i systemet.',
    actions: {
      activate: 'Aktivera',
      deactivate: 'Inaktivera'
    },
    permissions: {
      adminCanEdit: 'ADMIN kan lägga till, redigera och inaktivera användare med rollerna USER och ADMIN',
      adminCantEditSuperadmin: 'ADMIN kan inte hantera användare med rollen SUPERADMIN',
      superadminCanAll: 'SUPERADMIN kan hantera alla användare och roller',
      cantDeactivateSelf: 'Ingen kan inaktivera sitt eget konto',
    },
  },

  import: {
    title: 'Importera data',
    selectFile: 'Välj Excel-fil',
    upload: 'Ladda upp',
    success: 'Importen lyckades!',
    fileFormat: 'Stöder Excel-filer (.xlsx, .xls), CSV och textfiler med kommaseparerade värden.',
    results: 'Importresultat',
    tenantsCreated: 'Hyresgäster skapade',
    apartmentsCreated: 'Lägenheter skapade',
    instructions: 'Instruktioner för filformat',
    errors: {
        noFile: 'Välj en fil att ladda upp',
        uploadFailed: 'Kunde inte ladda upp filen. Kontrollera att du har rätt behörighet och att filen är i rätt format.',
        unauthorized: 'Du saknar behörighet att importera data. ADMIN eller SUPERADMIN-behörighet krävs.',
        title: 'Fel vid import'
    }
  },

  email: {
    send: 'Skicka e-post',
    sendToAll: 'Skicka e-post till alla',
    recipients: 'Mottagare',
    subject: 'Ämne',
    content: 'Innehåll',
    sending: 'Skickar...',
    success: 'E-post skickad!',
    errors: {
      sendFailed: 'Kunde inte skicka e-post',
      subjectRequired: 'Ämne krävs',
      contentRequired: 'Innehåll krävs',
      noRecipients: 'Inga mottagare valda',
      serverTimeout: 'E-postuppsändningen tar längre tid än väntat. Servern bearbetar fortfarande din förfrågan i bakgrunden. Du kan stänga detta fönster och kontrollera med mottagarna om några minuter.',
      networkError: 'Kunde inte ansluta till servern. Kontrollera din internetanslutning.',
      serverError: 'Ett fel uppstod på servern. Försök igen senare.',
      timeout: 'Tidsgränsen överskreds. Försök att skicka e-post igen.'
    },
    bcc: 'Dold kopia',
    to: 'Till',
    from: 'Från',
    addRecipients: 'Lägg till mottagare',
    recipientCount: '{{count}} mottagare',
    selectAll: 'Välj alla',
    deselectAll: 'Avmarkera alla',
    selectedCount: '{{count}} valda',
    title: 'Skicka e-postmeddelande',
    partialSuccess: '{{sent}} av {{total}} e-postmeddelanden skickades. Vissa mottagare fick inte meddelandet.',
    showRecipients: 'Visa alla mottagare',
    hideRecipients: 'Dölj mottagarna',
    testSend: 'Skicka testmeddelande',
    button: 'E-post',
    messages: {
      sendSuccess: 'E-post skickades framgångsrikt'
    },
    fields: {
      subject: 'Ämne',
      content: 'Innehåll'
    },
    placeholders: {
      subject: 'Ange ämne för e-postmeddelandet',
      content: 'Skriv ditt meddelande här...'
    }
  },

  interests: {
    title: 'Intresseanmälningar',
    new: 'Ny intresseanmälan',
    details: 'Intressedetaljer',
    edit: 'Redigera intresseanmälan',
    review: 'Granska intresseanmälan',
    noInterests: 'Inga intresseanmälningar att visa',
    thisWeek: 'Denna vecka',
    completed: 'Avslutade',
    filteredResults: 'intresseanmälningar hittades',
    emailReport: 'E-postrapport',
    showReviewed: 'Visa granskade',
    showUnreviewed: 'Visa obehandlade',
    reviewedTitle: 'Behandlade intresseanmälningar',
    addComments: 'Lägg till kommentarer',
    scheduleShowing: 'Boka visningstid',
    showingScheduled: 'Visningstid bokad',
    showingInfo: 'Boka visning för {name} på lägenhet {apartment}',
    responseHelp: 'Skriv ett meddelande till den intresserade personen. Datum och tid för visningen kommer att läggas till automatiskt i meddelandet.',
    responsePlaceholder: 'Hej!\n\nTack för din intresseanmälan. Vi erbjuder en visning av lägenheten på datum och tid enligt nedan.\n\nVänligen bekräfta om tiden passar genom att svara på detta e-postmeddelande.\n\nMed vänliga hälsningar,',
    refreshCache: 'Uppdatera intresseanmälningar',
    cacheCleared: 'Cachen för intresseanmälningar har uppdaterats',
    cacheError: 'Kunde inte uppdatera intresseanmälningar',
    confirmDelete: 'Är du säker på att du vill ta bort denna intresseanmälan?',
    thisInterest: 'denna intresseanmälan',
    fields: {
      name: 'Namn',
      email: 'E-post',
      phone: 'Telefon',
      contact: 'Kontaktinfo',
      message: 'Meddelande',
      apartment: 'Lägenhet',
      pageUrl: 'Sidans URL',
      received: 'Mottagen',
      status: 'Status',
      reviewedBy: 'Granskad av',
      reviewedAt: 'Granskad den',
      reviewComments: 'Granskningskommentarer',
      responseMessage: 'Meddelande till intressent',
      showingDate: 'Visningsdatum',
      showingTime: 'Visningstid',
      assignedTo: 'Tilldelad till',
      assignedToUserId: 'Tilldelad till'
    },
    status: {
      NEW: 'Ny',
      REVIEWED: 'Granskad',
      REJECTED: 'Avvisad',
      SHOWING_SCHEDULED: 'Visning bokad',
      SHOWING_CONFIRMED: 'Visning bekräftad',
      SHOWING_COMPLETED: 'Visning genomförd',
      SHOWING_CANCELLED: 'Visning avbokad',
      SHOWING_DECLINED: 'Tackat nej'
    },
    actions: {
      review: 'Granska',
      reject: 'Avvisa',
      checkEmails: 'Läs e-post',
      scheduleShowing: 'Boka visning',
      sendAndSchedule: 'Skicka och boka',
      exportToExcel: 'Exportera till Excel',
      updateStatus: 'Uppdatera status'
    },
    messages: {
      reviewError: 'Ett fel uppstod vid granskning av intresseanmälan',
      rejectError: 'Ett fel uppstod vid avvisning av intresseanmälan',
      emailCheckError: 'Ett fel uppstod vid läsning av e-post',
      showingScheduled: 'Visningstid bokad och e-post skickat',
      showingError: 'Ett fel uppstod vid bokning av visning',
      fieldsRequired: 'Alla fält måste fyllas i',
      emailCheckSuccess: 'E-post har lästs in utan problem',
      exportSuccess: 'Exporten slutfördes framgångsrikt',
      exportError: 'Ett fel uppstod när intresseanmälningarna skulle exporteras',
      statusUpdated: 'Status uppdaterad',
      statusUpdateError: 'Ett fel uppstod vid uppdatering av status',
      showingDateRequired: 'Visningsdatum och tid krävs för status "Visning bokad"',
      loadingReviewed: 'Laddar behandlade intresseanmälningar...',
      loadingUnreviewed: 'Laddar obehandlade intresseanmälningar...',
      noDataToExport: 'Inga data att exportera',
      deleteSuccess: 'Intresseanmälan har tagits bort',
      deleteError: 'Ett fel uppstod när intresseanmälan skulle tas bort'
    }
  },

  showings: {
    title: 'Visningar',
    add: 'Lägg till visning',
    edit: 'Redigera visning',
    details: 'Visningsinformation',
    defaultTitle: 'Visning',
    dateTime: 'Datum och tid',
    status: 'Status',
    unassigned: 'Ej tilldelad',
    actions: {
      edit: 'Redigera',
      delete: 'Ta bort',
      assign: 'Tilldela',
      complete: 'Genomförd',
      cancel: 'Avbryt'
    },
    fields: {
      title: 'Titel',
      description: 'Beskrivning',
      dateTime: 'Datum och tid',
      status: 'Status',
      assignedTo: 'Tilldelad till',
      apartmentId: 'Lägenhet',
      contactName: 'Kontaktperson',
      contactEmail: 'E-post',
      contactPhone: 'Telefon',
      notes: 'Anteckningar',
      descriptionLanguage: 'Beskrivningsspråk',
      assignedToUserId: 'Visning bokad med'
    },
    statusTypes: {
      PENDING: 'Väntar',
      CONFIRMED: 'Bekräftad',
      COMPLETED: 'Genomförd',
      CANCELLED: 'Avbruten',
      SCHEDULED: 'Schemalagd'
    },
    messages: {
      saveSuccess: 'Visningen har sparats',
      saveError: 'Ett fel uppstod när visningen skulle sparas',
      deleteSuccess: 'Visningen har tagits bort',
      deleteError: 'Ett fel uppstod när visningen skulle tas bort',
      assignSuccess: 'Visningen har tilldelats',
      assignError: 'Ett fel uppstod när visningen skulle tilldelas',
      updateSuccess: 'Visningen har uppdaterats',
      updateError: 'Ett fel uppstod när visningen skulle uppdateras'
    }
  }
}; 