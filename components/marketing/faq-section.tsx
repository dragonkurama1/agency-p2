import { Accordion } from "@/components/ui/accordion";

export function FaqSection({ items }: { items: { question: string; answer: string }[] }) {
  if (!items.length) return null;
  return <Accordion items={items} />;
}
