import { notFound } from "next/navigation";
import { entities } from "@/lib/entities";
import { getEntityRows } from "@/lib/dashboard-data";
import { EntityTable } from "@/components/dashboard/entity-table";

export default async function EntityListPage({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const config = entities[entity];
  if (!config) notFound();

  const rows = await getEntityRows(entity);

  return <EntityTable entityKey={entity} config={config} rows={rows} />;
}
