import { ComparisonOperators, FilterBuilder } from "lib/algolia/filter-builder"

interface MakeFilterProps {
  minPrice: number | null
  maxPrice: number | null
  categories: string[]
  vendors: string[]
  colors: string[]
  rating?: number | null
}
export function composeFilters(filter: FilterBuilder, parsedSearchParams: MakeFilterProps, separator: string) {
  const filterConditions = [
    {
      predicate: parsedSearchParams.categories.length > 0,
      action: () => {
        parsedSearchParams.categories.forEach((category) => {
          const level = category.split(separator).length - 1
          filter.or().group((sub) => sub.in(`hierarchicalCategories.lvl${level}`, [category]))
        })
      },
    },
    {
      predicate: parsedSearchParams.vendors.length > 0,
      action: () => filter.and().group((sub) => sub.in("vendor", parsedSearchParams.vendors)),
    },
    {
      predicate: parsedSearchParams.colors.length > 0,
      action: () => filter.and().group((sub) => sub.in("flatOptions.Color", parsedSearchParams.colors)),
    },
    {
      predicate: !!parsedSearchParams.minPrice,
      action: () => filter.and().where("minPrice", parsedSearchParams.minPrice!, ComparisonOperators.GreaterThanOrEqual),
    },
    {
      predicate: !!parsedSearchParams.maxPrice,
      action: () => filter.and().where("minPrice", parsedSearchParams.maxPrice!, ComparisonOperators.LessThanOrEqual),
    },
    {
      predicate: !!parsedSearchParams.rating,
      action: () => filter.and().where("avgRating", parsedSearchParams.rating!, ComparisonOperators.GreaterThanOrEqual),
    },
  ]

  filterConditions.forEach(({ predicate, action }) => predicate && action())
  return filter
}
