import { createClient } from "redis";
import { Schema, Repository, EntityId } from "redis-om";
import { promises as fs } from "fs";

async function main() {
  // Conecta ao Redis
  const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  // Cria o schema e repositório
  const dataSchema = new Schema("data", {
    id: { type: "string" },
    name: { type: "string" },
    age: { type: "number" },
    score: { type: "number" },
    active: { type: "boolean" },
    country: { type: "string" },
    "team.name": { type: "string" },
    "team.leader": { type: "string" },
    "team.projects.name": { type: "string" },
    "team.projects.completed": { type: "boolean" },
    "logs.date": { type: "date" },
    "logs.action": { type: "string" },
  });

  const dataRepository = new Repository(dataSchema, client);

  // Carrega e processa os dados
  async function loadTestData() {
    try {
      const rawData = await fs.readFile(
        "/media/orlandofonsecad/SSD_NOVO/Projetos/Desafio_Codecon/Desafio_Codecon/resolução_orlando/data/usuarios_1000.json",
        "utf-8",
      );
      const parsedData = JSON.parse(rawData);
      console.log("First item:", parsedData[0]);

      // Salva cada item individualmente
      for (const item of parsedData) {
        const savedData = await dataRepository.save(item);
        await dataRepository.createIndex();
        console.log("Saved ID:", savedData[EntityId]);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  // Execução principal sequencial
  try {
    await loadTestData();
    const values = await dataRepository.search().return.all();
    console.log("Total records found:", values.length);
  } finally {
    await client.flushDb();
    await client.disconnect();
    console.log("Redis disconnected");
  }
}

// Inicia a execução do programa
main().catch(console.error);
