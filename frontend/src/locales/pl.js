export default {
  common: {
    loading: 'Ładowanie...',
    error: 'Wystąpił błąd',
    save: 'Zapisz',
    cancel: 'Anuluj',
    delete: 'Usuń',
    edit: 'Edytuj',
    add: 'Dodaj',
    search: 'Szukaj',
    required: 'Wymagane',
    yes: 'Tak',
    no: 'Nie',
  },

  navigation: {
    dashboard: 'Panel główny',
    apartments: 'Mieszkania',
    tenants: 'Najemcy',
    keys: 'Klucze',
    logout: 'Wyloguj',
  },

  auth: {
    login: {
      title: 'Zaloguj się do DFRM',
      email: 'Email',
      password: 'Hasło',
      submit: 'Zaloguj',
      error: {
        invalidCredentials: 'Nieprawidłowe dane logowania',
        tooManyAttempts: 'Zbyt wiele prób logowania. Spróbuj ponownie później.',
        general: 'Wystąpił błąd podczas logowania. Spróbuj ponownie później.',
      },
    },
    session: {
      warning: {
        title: 'Sesja wkrótce wygaśnie',
        message: 'Zostaniesz automatycznie wylogowany za {minutes} {minutes, plural, one {minutę} other {minut}}.',
        question: 'Czy chcesz kontynuować sesję?',
        extend: 'Kontynuuj sesję',
        logout: 'Wyloguj',
      },
    },
  },

  dashboard: {
    stats: {
      totalApartments: 'Liczba mieszkań',
      activeTenantsCount: 'Aktywni najemcy',
      totalKeys: 'Wydane klucze',
      vacantApartments: 'Wolne mieszkania',
    },
    sections: {
      recentActivity: 'Ostatnia aktywność',
      upcomingEvents: 'Nadchodzące wydarzenia',
      noActivity: 'Brak aktywności do wyświetlenia',
      noEvents: 'Brak nadchodzących wydarzeń',
    },
  },

  apartments: {
    title: 'Mieszkania',
    addNew: 'Dodaj mieszkanie',
    edit: 'Edytuj mieszkanie',
    fields: {
      street: 'Ulica',
      number: 'Numer',
      apartmentNumber: 'Numer mieszkania',
      postalCode: 'Kod pocztowy',
      city: 'Miasto',
      rooms: 'Pokoje',
      area: 'Powierzchnia (m²)',
      price: 'Czynsz (SEK)',
      features: {
        electricity: 'Prąd w cenie',
        storage: 'Komórka w cenie',
        internet: 'Internet w cenie',
      },
    },
    confirmDelete: 'Czy na pewno chcesz usunąć to mieszkanie?',
    messages: {
      saveSuccess: 'Mieszkanie zostało zapisane',
      saveError: 'Wystąpił błąd podczas zapisywania mieszkania',
      deleteSuccess: 'Mieszkanie zostało usunięte',
      deleteError: 'Wystąpił błąd podczas usuwania mieszkania',
    },
  },

  tenants: {
    title: 'Najemcy',
    addNew: 'Dodaj najemcę',
    edit: 'Edytuj najemcę',
    fields: {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      personnummer: 'Numer personalny',
      phoneNumber: 'Telefon',
      email: 'Email',
      street: 'Ulica',
      postalCode: 'Kod pocztowy',
      city: 'Miasto',
      movedInDate: 'Data wprowadzenia',
      resiliationDate: 'Data wypowiedzenia',
      comment: 'Komentarz',
    },
    confirmDelete: 'Czy na pewno chcesz usunąć tego najemcę?',
    messages: {
      saveSuccess: 'Najemca został zapisany',
      saveError: 'Wystąpił błąd podczas zapisywania najemcy',
      deleteSuccess: 'Najemca został usunięty',
      deleteError: 'Wystąpił błąd podczas usuwania najemcy',
    },
  },

  keys: {
    title: 'Klucze',
    addNew: 'Dodaj klucz',
    edit: 'Edytuj klucz',
    fields: {
      type: 'Typ',
      serie: 'Seria',
      number: 'Numer',
      apartment: 'Mieszkanie',
      tenant: 'Najemca',
    },
    types: {
      main: 'Klucz główny',
      apartment: 'Klucz do mieszkania',
      storage: 'Klucz do komórki',
      gate: 'Klucz do bramy',
    },
    confirmDelete: 'Czy na pewno chcesz usunąć ten klucz?',
    messages: {
      saveSuccess: 'Klucz został zapisany',
      saveError: 'Wystąpił błąd podczas zapisywania klucza',
      deleteSuccess: 'Klucz został usunięty',
      deleteError: 'Wystąpił błąd podczas usuwania klucza',
    },
  },

  validation: {
    required: 'Pole {field} jest wymagane',
    email: 'Nieprawidłowy adres email',
    password: {
      length: 'Hasło musi mieć co najmniej 8 znaków',
      uppercase: 'Hasło musi zawierać co najmniej jedną wielką literę',
      lowercase: 'Hasło musi zawierać co najmniej jedną małą literę',
      number: 'Hasło musi zawierać co najmniej jedną cyfrę',
    },
    personnummer: 'Nieprawidłowy numer personalny (format: YYYYMMDD-XXXX)',
    phoneNumber: 'Nieprawidłowy numer telefonu',
    postalCode: 'Nieprawidłowy kod pocztowy',
    date: 'Nieprawidłowa data',
    number: {
      invalid: 'Pole {field} musi być liczbą',
      min: 'Pole {field} musi być co najmniej {min}',
      max: 'Pole {field} nie może być większe niż {max}',
    },
  },
}; 