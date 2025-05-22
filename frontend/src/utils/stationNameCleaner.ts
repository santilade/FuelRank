export const cleanStationName = (name: string, brand: string): string => {
  const normalizedBrand = brand.trim().toLocaleLowerCase();
  const normalizedName = name.trim().toLocaleLowerCase();

  if (normalizedName.startsWith(normalizedBrand)) {
    return name.slice(brand.length).trimStart();
  }
  return name;
};
