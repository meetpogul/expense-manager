import { FilterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import type { Category } from "@/features/categories/domain/types";

type TransactionFiltersProps = {
  categories: Category[];
  type?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

export function TransactionFilters({
  categories,
  type,
  categoryId,
  from,
  to,
}: TransactionFiltersProps) {
  return (
    <form className="border-border/80 bg-card grid gap-3 rounded-lg border p-3 shadow-sm shadow-black/5 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
      <Select defaultValue={type ?? "all"} name="type" aria-label="Type">
        <option value="all">All types</option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </Select>
      <Select
        defaultValue={categoryId ?? "all"}
        name="category"
        aria-label="Category"
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input
        aria-label="From date"
        defaultValue={from ?? ""}
        name="from"
        type="date"
      />
      <Input
        aria-label="To date"
        defaultValue={to ?? ""}
        name="to"
        type="date"
      />
      <Button variant="secondary">
        <FilterIcon data-icon="inline-start" />
        Filter
      </Button>
    </form>
  );
}
