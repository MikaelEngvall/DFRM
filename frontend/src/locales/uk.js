export default {
  common: {
    loading: 'Завантаження...',
    error: 'Сталася помилка',
    save: 'Зберегти',
    cancel: 'Скасувати',
    delete: 'Видалити',
    edit: 'Редагувати',
    add: 'Додати',
    search: 'Пошук',
    required: 'Обов\'язково',
    yes: 'Так',
    no: 'Ні',
  },

  navigation: {
    dashboard: 'Панель керування',
    apartments: 'Квартири',
    tenants: 'Орендарі',
    keys: 'Ключі',
    logout: 'Вийти',
  },

  auth: {
    login: {
      title: 'Увійти в DFRM',
      email: 'Електронна пошта',
      password: 'Пароль',
      submit: 'Увійти',
      error: {
        invalidCredentials: 'Невірні дані для входу',
        tooManyAttempts: 'Забагато спроб входу. Спробуйте пізніше.',
        general: 'Сталася помилка під час входу. Спробуйте пізніше.',
      },
    },
    session: {
      warning: {
        title: 'Сесія скоро закінчиться',
        message: 'Ви будете автоматично виходити через {minutes} {minutes, plural, one {хвилину} other {хвилин}}.',
        question: 'Бажаєте продовжити сесію?',
        extend: 'Продовжити сесію',
        logout: 'Вийти',
      },
    },
  },

  dashboard: {
    stats: {
      totalApartments: 'Всього квартир',
      activeTenantsCount: 'Активні орендарі',
      totalKeys: 'Видані ключі',
      vacantApartments: 'Вільні квартири',
    },
    sections: {
      recentActivity: 'Остання активність',
      upcomingEvents: 'Майбутні події',
      noActivity: 'Немає активності для відображення',
      noEvents: 'Немає майбутніх подій',
    },
  },

  apartments: {
    title: 'Квартири',
    addNew: 'Додати квартиру',
    edit: 'Редагувати квартиру',
    fields: {
      street: 'Вулиця',
      number: 'Номер',
      apartmentNumber: 'Номер квартири',
      postalCode: 'Поштовий індекс',
      city: 'Місто',
      rooms: 'Кімнати',
      area: 'Площа (м²)',
      price: 'Оренда (SEK)',
      features: {
        electricity: 'Електроенергія включена',
        storage: 'Комора включена',
        internet: 'Інтернет включений',
      },
    },
    confirmDelete: 'Ви впевнені, що хочете видалити цю квартиру?',
    messages: {
      saveSuccess: 'Квартиру збережено',
      saveError: 'Сталася помилка під час збереження квартири',
      deleteSuccess: 'Квартиру видалено',
      deleteError: 'Сталася помилка під час видалення квартири',
    },
  },

  tenants: {
    title: 'Орендарі',
    addNew: 'Додати орендаря',
    edit: 'Редагувати орендаря',
    fields: {
      firstName: 'Ім\'я',
      lastName: 'Прізвище',
      personnummer: 'Персональний номер',
      phoneNumber: 'Телефон',
      email: 'Електронна пошта',
      street: 'Вулиця',
      postalCode: 'Поштовий індекс',
      city: 'Місто',
      movedInDate: 'Дата в\'їзду',
      resiliationDate: 'Дата виселення',
      comment: 'Коментар',
    },
    confirmDelete: 'Ви впевнені, що хочете видалити цього орендаря?',
    messages: {
      saveSuccess: 'Орендаря збережено',
      saveError: 'Сталася помилка під час збереження орендаря',
      deleteSuccess: 'Орендаря видалено',
      deleteError: 'Сталася помилка під час видалення орендаря',
    },
  },

  keys: {
    title: 'Ключі',
    addNew: 'Додати ключ',
    edit: 'Редагувати ключ',
    fields: {
      type: 'Тип',
      serie: 'Серія',
      number: 'Номер',
      apartment: 'Квартира',
      tenant: 'Орендар',
    },
    types: {
      main: 'Головний ключ',
      apartment: 'Ключ від квартири',
      storage: 'Ключ від комори',
      gate: 'Ключ від воріт',
    },
    confirmDelete: 'Ви впевнені, що хочете видалити цей ключ?',
    messages: {
      saveSuccess: 'Ключ збережено',
      saveError: 'Сталася помилка під час збереження ключа',
      deleteSuccess: 'Ключ видалено',
      deleteError: 'Сталася помилка під час видалення ключа',
    },
  },

  validation: {
    required: 'Поле {field} обов\'язкове',
    email: 'Невірна адреса електронної пошти',
    password: {
      length: 'Пароль повинен містити щонайменше 8 символів',
      uppercase: 'Пароль повинен містити щонайменше одну велику літеру',
      lowercase: 'Пароль повинен містити щонайменше одну малу літеру',
      number: 'Пароль повинен містити щонайменше одну цифру',
    },
    personnummer: 'Невірний персональний номер (формат: YYYYMMDD-XXXX)',
    phoneNumber: 'Невірний номер телефону',
    postalCode: 'Невірний поштовий індекс',
    date: 'Невірна дата',
    number: {
      invalid: 'Поле {field} повинно бути числом',
      min: 'Поле {field} повинно бути не менше {min}',
      max: 'Поле {field} повинно бути не більше {max}',
    },
  },
}; 