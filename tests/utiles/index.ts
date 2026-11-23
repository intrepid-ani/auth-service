import { DataSource } from "typeorm";

export async function truncateAllEntities(connection: DataSource) {
    const entities = connection.entityMetadatas;

    for (const entity of entities) {
        const repo = connection.getRepository(entity.name);
        await repo.clear();
    }
}
