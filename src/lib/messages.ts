export const messages = {
  nav: {
    logout: "Вийти",
  },
  status: {
    draft: "Чернетка",
    published: "Опубліковано",
  },
  login: {
    heading: "Вхід до адмін-панелі",
    email: "Електронна пошта",
    password: "Пароль",
    submit: "Увійти",
    invalidCredentials: "Неправильна пошта або пароль",
    rateLimited: "Забагато спроб. Спробуйте пізніше",
  },
  adminList: {
    heading: "Товари",
    edit: "Редагувати",
  },
  catalog: {
    heading: "Каталог товарів",
    empty: "Тут поки немає жодного опублікованого товару",
  },
  product: {
    name: "Назва",
    status: "Статус",
    attributes: "Характеристики",
  },
  editor: {
    name: "Назва",
    description: "Опис товару",
    seoTitle: "SEO-заголовок",
    seoDescription: "SEO-опис",
    status: "Статус",
    save: "Зберегти",
    saved: "Збережено",
    conflict: "Дані змінили в іншому місці, оновіть сторінку",
    saveFailed: "Не вдалося зберегти. Спробуйте ще раз",
  },
} as const;
