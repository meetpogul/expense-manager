export function stringFromFormData(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function optionalStringFromFormData(formData: FormData, key: string) {
  const value = stringFromFormData(formData, key).trim();

  return value.length > 0 ? value : null;
}
