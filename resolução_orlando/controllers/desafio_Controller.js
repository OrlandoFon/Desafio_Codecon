import express from "express";
import DesafioService from "../services/desafio_Service.js";

class DesafioController {
  static async insertUsers(req, res) {
    try {
      const rawData = req.body.file ? JSON.parse(req.body.file) : req.body;
      const result = await DesafioService.insertUsers(rawData);
      return res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            message: "Arquivo recebido com sucesso",
            user_count: result,
          }),
        );
    } catch (err) {
      console.error("Error found inserting users:", err);
      return res.status(500).end();
    }
  }
  static async searchSuperUsers(req, res) {
    try {
      const { data, execution_time } = await DesafioService.searchSuperUsers();
      return res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            timestamp: new Date(),
            execution_time_ms: execution_time,
            data: data,
          }),
        );
    } catch (err) {
      console.error("Error found while searching for super users:", err);
      return res.status(500).end();
    }
  }
  static async getTopCountries(req, res) {
    try {
      const { data, execution_time } = await DesafioService.getTopCountries();
      return res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            timestamp: new Date(),
            execution_time_ms: execution_time,
            countries: data,
          }),
        );
    } catch (err) {
      console.error(
        "Error found while searching for top 5 countries of super users:",
        err,
      );
      return res.status(500).end();
    }
  }
  static async getTeamInsights(req, res) {
    try {
      const { data, execution_time } = await DesafioService.getTeamInsights();
      return res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            timestamp: new Date(),
            execution_time_ms: execution_time,
            teams: data,
          }),
        );
    } catch (err) {
      console.error("Error found while searching for team insights:", err);
      return res.status(500).end();
    }
  }
  static async getActiveUsersPerDay(req, res) {
    try {
      const { data, execution_time } =
        await DesafioService.getActiveUsersPerDay();
      return res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            timestamp: new Date(),
            execution_time_ms: execution_time,
            logins: data,
          }),
        );
    } catch (err) {
      console.error("Error found while searching for team insights:", err);
      return res.status(500).end();
    }
  }
  static async getEvaluation(req, res) {
    try {
      const tested_endpoints = {};

      const createMockRes = () => {
        let statusCode = 200;
        let responseData = null;
        return {
          status: (code) => {
            statusCode = code;
            return {
              setHeader: () => ({
                end: (data) => {
                  responseData = data ? JSON.parse(data) : null;
                },
              }),
              end: () => {
                responseData = null;
              },
            };
          },
          getStatus: () => statusCode,
          getResponse: () => responseData,
        };
      };

      const mockReq = {};

      const superUsersRes = createMockRes();
      await DesafioController.searchSuperUsers(mockReq, superUsersRes);
      const superUsersData = superUsersRes.getResponse();
      tested_endpoints["/superusuarios"] = {
        status: superUsersRes.getStatus(),
        time_ms: superUsersData
          ? parseFloat(superUsersData.execution_time_ms)
          : 0,
        valid_response:
          superUsersRes.getStatus() === 200 &&
          superUsersData &&
          Array.isArray(superUsersData.data),
      };

      const topCountriesRes = createMockRes();
      await DesafioController.getTopCountries(mockReq, topCountriesRes);
      const topCountriesData = topCountriesRes.getResponse();
      tested_endpoints["/ranking-paises"] = {
        status: topCountriesRes.getStatus(),
        time_ms: topCountriesData
          ? parseFloat(topCountriesData.execution_time_ms)
          : 0,
        valid_response:
          topCountriesRes.getStatus() === 200 &&
          topCountriesData &&
          Array.isArray(topCountriesData.countries),
      };

      const teamInsightsRes = createMockRes();
      await DesafioController.getTeamInsights(mockReq, teamInsightsRes);
      const teamInsightsData = teamInsightsRes.getResponse();
      tested_endpoints["/analise-equipes"] = {
        status: teamInsightsRes.getStatus(),
        time_ms: teamInsightsData
          ? parseFloat(teamInsightsData.execution_time_ms)
          : 0,
        valid_response:
          teamInsightsRes.getStatus() === 200 &&
          teamInsightsData &&
          Array.isArray(teamInsightsData.teams),
      };

      const activeUsersRes = createMockRes();
      await DesafioController.getActiveUsersPerDay(mockReq, activeUsersRes);
      const activeUsersData = activeUsersRes.getResponse();
      tested_endpoints["/usuarios-ativos-por-dia"] = {
        status: activeUsersRes.getStatus(),
        time_ms: activeUsersData
          ? parseFloat(activeUsersData.execution_time_ms)
          : 0,
        valid_response:
          activeUsersRes.getStatus() === 200 &&
          activeUsersData &&
          Array.isArray(activeUsersData.logins),
      };

      return res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            timestamp: new Date(),
            tested_endpoints,
          }),
        );
    } catch (err) {
      console.error("Error found while executing evaluations:", err);
      return res.status(500).end();
    }
  }
  //Ação Extra
  static async flushUsers(req, res) {
    try {
      await DesafioService.flushUsers();
      return res.status(200).send("User data flushed.");
    } catch (err) {
      console.error("Error while flushing users data:", err);
      return res.status(500).end();
    }
  }
}

export default DesafioController;
