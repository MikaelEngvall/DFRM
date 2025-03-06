export default {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    required: 'Required',
    yes: 'Yes',
    no: 'No',
  },

  navigation: {
    dashboard: 'Dashboard',
    apartments: 'Apartments',
    tenants: 'Tenants',
    keys: 'Keys',
    logout: 'Log out',
  },

  auth: {
    login: {
      title: 'Log in to DFRM',
      email: 'Email',
      password: 'Password',
      submit: 'Log in',
      error: {
        invalidCredentials: 'Invalid credentials',
        tooManyAttempts: 'Too many login attempts. Please try again later.',
        general: 'An error occurred during login. Please try again later.',
      },
    },
    session: {
      warning: {
        title: 'Session is about to expire',
        message: 'You will be automatically logged out in {minutes} {minutes, plural, one {minute} other {minutes}}.',
        question: 'Would you like to continue your session?',
        extend: 'Continue session',
        logout: 'Log out',
      },
    },
  },

  dashboard: {
    stats: {
      totalApartments: 'Total apartments',
      activeTenantsCount: 'Active tenants',
      totalKeys: 'Issued keys',
      vacantApartments: 'Vacant apartments',
    },
    sections: {
      recentActivity: 'Recent activity',
      upcomingEvents: 'Upcoming events',
      noActivity: 'No activity to show',
      noEvents: 'No upcoming events',
    },
  },

  apartments: {
    title: 'Apartments',
    addNew: 'Add apartment',
    edit: 'Edit apartment',
    fields: {
      street: 'Street',
      number: 'Number',
      apartmentNumber: 'Apartment number',
      postalCode: 'Postal code',
      city: 'City',
      rooms: 'Rooms',
      area: 'Area (m²)',
      price: 'Rent (SEK)',
      features: {
        electricity: 'Electricity included',
        storage: 'Storage included',
        internet: 'Internet included',
      },
    },
    confirmDelete: 'Are you sure you want to delete this apartment?',
    messages: {
      saveSuccess: 'Apartment has been saved',
      saveError: 'An error occurred while saving the apartment',
      deleteSuccess: 'Apartment has been deleted',
      deleteError: 'An error occurred while deleting the apartment',
    },
  },

  tenants: {
    title: 'Tenants',
    addNew: 'Add tenant',
    edit: 'Edit tenant',
    fields: {
      firstName: 'First name',
      lastName: 'Last name',
      personnummer: 'Personal number',
      phoneNumber: 'Phone',
      email: 'Email',
      street: 'Street',
      postalCode: 'Postal code',
      city: 'City',
      movedInDate: 'Move-in date',
      resiliationDate: 'Termination date',
      comment: 'Comment',
    },
    confirmDelete: 'Are you sure you want to delete this tenant?',
    messages: {
      saveSuccess: 'Tenant has been saved',
      saveError: 'An error occurred while saving the tenant',
      deleteSuccess: 'Tenant has been deleted',
      deleteError: 'An error occurred while deleting the tenant',
    },
  },

  keys: {
    title: 'Keys',
    addNew: 'Add key',
    edit: 'Edit key',
    fields: {
      type: 'Type',
      serie: 'Series',
      number: 'Number',
      apartment: 'Apartment',
      tenant: 'Tenant',
    },
    types: {
      main: 'Master key',
      apartment: 'Apartment key',
      storage: 'Storage key',
      gate: 'Gate key',
    },
    confirmDelete: 'Are you sure you want to delete this key?',
    messages: {
      saveSuccess: 'Key has been saved',
      saveError: 'An error occurred while saving the key',
      deleteSuccess: 'Key has been deleted',
      deleteError: 'An error occurred while deleting the key',
    },
  },

  validation: {
    required: '{field} is required',
    email: 'Invalid email address',
    password: {
      length: 'Password must be at least 8 characters long',
      uppercase: 'Password must contain at least one uppercase letter',
      lowercase: 'Password must contain at least one lowercase letter',
      number: 'Password must contain at least one number',
    },
    personnummer: 'Invalid personal number (format: YYYYMMDD-XXXX)',
    phoneNumber: 'Invalid phone number',
    postalCode: 'Invalid postal code',
    date: 'Invalid date',
    number: {
      invalid: '{field} must be a number',
      min: '{field} must be at least {min}',
      max: '{field} must be at most {max}',
    },
  },
}; 