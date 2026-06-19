import { notFound } from "next/navigation";
import { entities } from "@/lib/entities";
import { createEntityRow } from "@/actions/content";
import { EntityForm } from "@/components/dashboard/entity-form";

export default async function NewEntityPage({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const config = entities[entity];
  if (!config) notFound();

  const action = createEntityRow.bind(null, entity);

  return (
    <div>
      <h1 className="font-serif text-2xl">Nouveau — {config.label}</h1>
      <div className="mt-8">
        <EntityForm config={config} action={action} />
      </div>
    </div>
  );
}
