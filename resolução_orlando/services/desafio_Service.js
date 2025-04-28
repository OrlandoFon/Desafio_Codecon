import { EntityId } from "redis-om";
import { getRepository } from "../models/user_Model.js";
import RedisClient from "../config/db.js";

class DesafioService {
  static async insertUsers(userData) {
    const repo = await getRepository();
    try {
      const ids = [];
      for (const item of userData) {
        const entity = await repo.save(item);
        ids.push(entity[EntityId]);
      }

      return ids.length;
    } catch (err) {
      console.error("Error:", err);
    }
  }
  static async searchSuperUsers() {
    const repo = await getRepository();
    const start = process.hrtime.bigint();
    try {
      const result = await repo
        .search()
        .where("active")
        .is.true()
        .and("score")
        .gte(900)
        .return.all();

      const executionTime = Number(process.hrtime.bigint() - start) / 1e6;
      return {
        data: result,
        execution_time: executionTime.toFixed(3),
      };
    } catch (err) {
      console.error("Error:", err);
    }
  }
  static async getTopCountries() {
    const start = process.hrtime.bigint();
    try {
      const { data } = await this.searchSuperUsers();
      let superUsers = data;

      const countryCounts = superUsers.reduce((acc, user) => {
        const country = user.pais || "Country not informed";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      const topCountries = Object.entries(countryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({ country: country, total: count }));

      const executionTime = Number(process.hrtime.bigint() - start) / 1e6;
      return {
        data: topCountries,
        execution_time: executionTime.toFixed(3),
      };
    } catch (err) {
      console.error("Error:", err);
    }
  }
  static async getTeamInsights() {
    const client = await RedisClient.getClient();
    const start = process.hrtime.bigint();
    try {
      const membersResult = await client.sendCommand([
        "FT.AGGREGATE",
        "user:index",
        "*",
        "GROUPBY",
        "1",
        "@team_name",
        "REDUCE",
        "COUNT",
        "0",
        "AS",
        "num_membros",
      ]);

      const activeMembersResult = await client.sendCommand([
        "FT.AGGREGATE",
        "user:index",
        "@active:{true}",
        "GROUPBY",
        "1",
        "@team_name",
        "REDUCE",
        "COUNT",
        "0",
        "AS",
        "num_membros_ativos",
      ]);

      const leadersResult = await client.sendCommand([
        "FT.AGGREGATE",
        "user:index",
        "@team_leader:{true}",
        "GROUPBY",
        "1",
        "@team_name",
        "REDUCE",
        "COUNT",
        "0",
        "AS",
        "num_lideres",
      ]);

      const projectsResult = await client.sendCommand([
        "FT.AGGREGATE",
        "user:index",
        "@team_projects_completed:{true}",
        "GROUPBY",
        "1",
        "@team_name",
        "REDUCE",
        "COUNT",
        "0",
        "AS",
        "num_projetos_completos",
      ]);

      const teamsMap = new Map();

      membersResult.slice(1).forEach(([_, teamName, __, numMembros]) => {
        teamsMap.set(teamName, {
          team: teamName,
          total_members: parseInt(numMembros),
          active_percentage: 0.0,
          leaders: 0,
          completed_projects: 0,
        });
      });

      activeMembersResult
        .slice(1)
        .forEach(([_, teamName, __, numMembrosAtivos]) => {
          if (teamsMap.has(teamName)) {
            const team = teamsMap.get(teamName);
            const numMembros = team.total_members;
            team.active_percentage =
              numMembros > 0
                ? parseFloat(
                    ((parseInt(numMembrosAtivos) / numMembros) * 100).toFixed(
                      1,
                    ),
                  )
                : 0.0;
          } else {
            teamsMap.set(teamName, {
              team: teamName,
              total_members: 0,
              active_percentage: parseFloat(
                ((parseInt(numMembrosAtivos) / 1) * 100).toFixed(1),
              ),
              leaders: 0,
              completed_projects: 0,
            });
          }
        });

      leadersResult.slice(1).forEach(([_, teamName, __, numLideres]) => {
        if (teamsMap.has(teamName)) {
          teamsMap.get(teamName).leaders = parseInt(numLideres);
        } else {
          teamsMap.set(teamName, {
            team: teamName,
            total_members: 0,
            active_percentage: 0.0,
            leaders: parseInt(numLideres),
            completed_projects: 0,
          });
        }
      });

      projectsResult
        .slice(1)
        .forEach(([_, teamName, __, numProjetosCompletos]) => {
          if (teamsMap.has(teamName)) {
            teamsMap.get(teamName).completed_projects =
              parseInt(numProjetosCompletos);
          } else {
            teamsMap.set(teamName, {
              team: teamName,
              total_members: 0,
              active_percentage: 0.0,
              leaders: 0,
              completed_projects: parseInt(numProjetosCompletos),
            });
          }
        });

      const result = Array.from(teamsMap.values());

      const executionTime = Number(process.hrtime.bigint() - start) / 1e6;
      return {
        data: result,
        execution_time: executionTime.toFixed(3),
      };
    } catch (err) {
      console.error("Error:", err);
    }
  }
  static async getActiveUsersPerDay() {
    const client = await RedisClient.getClient();
    const start = process.hrtime.bigint();
    try {
      const datesResult = await client.sendCommand([
        "FT.AGGREGATE",
        "user:index",
        "*",
        "GROUPBY",
        "1",
        "@logs_date",
        "REDUCE",
        "COUNT",
        "0",
        "AS",
        "total_logs",
      ]);
      const mappedResult = datesResult.slice(1).map(([_, date, __, total]) => ({
        date,
        total: parseInt(total),
      }));
      const executionTime = Number(process.hrtime.bigint() - start) / 1e6;
      return {
        data: mappedResult,
        execution_time: executionTime.toFixed(3),
      };
    } catch (err) {
      console.error("Error:", err);
    }
  }
  //Ação Extra
  static async flushUsers() {
    try {
      const client = await RedisClient.getClient();
      await client.flushDb();
      return true;
    } catch (err) {
      console.error("Error:", err);
    }
  }
}

export default DesafioService;
