const rules = new Intl.PluralRules("uk");

export type PluralForms = { one: string; few: string; many: string };

export function selectPlural(count: number, forms: PluralForms): string {
  const category = rules.select(count);

  if (category === "one") {
    return forms.one;
  }

  if (category === "few") {
    return forms.few;
  }

  return forms.many;
}
