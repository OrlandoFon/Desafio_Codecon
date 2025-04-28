import { Schema, Repository } from "redis-om";
import RedisClient from "../config/db.js";

const dataSchema = new Schema("user", {
  id: { type: "string", path: "$.id" },
  name: { type: "string", path: "$.nome" },
  age: { type: "number", path: "$.idade" },
  score: { type: "number", path: "$.score" },
  active: { type: "boolean", path: "$.ativo" },
  country: { type: "string", path: "$.pais" },
  team_name: { type: "string", path: "$.equipe.nome" },
  team_leader: { type: "boolean", path: "$.equipe.lider" },
  team_projects_name: { type: "string[]", path: "$.equipe.projetos[*].nome" },
  team_projects_completed: {
    type: "string[]",
    path: "$.equipe.projetos[*].concluido",
  },
  logs_date: { type: "string[]", path: "$.logs[*].data" },
  logs_action: { type: "string[]", path: "$.logs[*].acao" },
});

let dataRepository = null;

export async function getRepository() {
  if (!dataRepository) {
    const client = await RedisClient.getClient();
    dataRepository = new Repository(dataSchema, client);
    await dataRepository.createIndex();
  }
  return dataRepository;
}
