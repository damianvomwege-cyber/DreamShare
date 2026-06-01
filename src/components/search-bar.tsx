import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

export function SearchBar({
  defaultValue,
  placeholder = "Search dreams, users, tags, categories",
}: {
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <form action="/explore" className="flex gap-2">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
