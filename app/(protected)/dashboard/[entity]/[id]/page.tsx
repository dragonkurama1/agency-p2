import { notFound } from "next/navigation";
import { entities } from "@/lib/entities";
import { getEntityRowById } from "@/lib/dashboard-data";
import { updateEntityRow } from "@/actions/content";
import { EntityForm } from "@/components/dashboard/entity-form";
import { getDynamicOptions } from "@/data/categories";

export default async function EditEntityPage({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  const config = entities[entity];
  if (!config) notFound();

  const [row, dynamicOptions] = await Promise.all([
    getEntityRowById(entity, id),
    getDynamicOptions(config.fields),
  ]);
  if (!row) notFound();

  const action = updateEntityRow.bind(null, entity, id);

  return (
    <div>
      <h1 className="font-serif text-2xl">Modifier — {config.label}</h1>
      <div className="mt-8">
        <EntityForm config={config} initialValues={row} action={action} dynamicOptions={dynamicOptions} />
      </div>
    </div>
  );
}
