import { DataSource } from "typeorm";

export async function truncateAllEntities(
    connection: DataSource
): Promise<void> {
    const tables = connection.entityMetadatas
        .filter(entity => entity.tableType !== "view")
        .map(entity =>
            connection
                .getRepository(entity.target)
                .metadata.tablePath.split(".")
                .map(part => `"${part.replace(/"/g, '""')}"`)
                .join(".")
        );

    if (tables.length === 0) return;

    await connection.query(
        `TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`
    );
}
