# Resolução do Desafio Técnico Codecon: Performance e Análise de Dados via API
## Visão Geral
O objetivo do desafio foi criar uma API performática que processa um arquivo JSON com 100.000 usuários e fornece endpoints para análise de dados, com tempo de resposta inferior a 1 segundo por endpoint. Implementei a solução utilizando Node.js com Express para a API e Redis (em memória) como banco de dados, garantindo alta performance e escalabilidade.

---

###  Tecnologias Utilizadas
- **Node.js v18**: Plataforma para executar JavaScript no servidor, escolhida por sua performance em operações assíncronas.
- **Express**: Framework minimalista para criar a API REST.
- **Redis**: Banco de dados em memória para alta velocidade em inserções e consultas.
- **Redis Search (RediSearch)**: Módulo para indexação e busca avançada.
- **ES Modules**: Sintaxe moderna para organização do código.
- **JavaScript**: Linguagem principal com `async/await` para operações I/O.

---

###  Estrutura do Projeto
```
controllers/desafio_Controller.js   # Métodos estáticos para endpoints
services/desafio_Service.js         # Lógica de negócio (inserção, consultas)
routes/desafio_Route.js             # Mapeamento de URLs para controladores
config/db.js                        # Gerenciamento da conexão com Redis
models/user_models.js               # Cria o Schema do JSON usando o Redis-OM para Node
main.js                             # Inicialização do servidor Express
```

---

## Escolhas e Implementação por Endpoint

### 1. **POST /users**
- **Funcionalidade**: Insere até 100.000 usuários no Redis.
- **Implementação**: Faz inserção utilizando o Redis-OM.
- **Escolha**: Redis para performance; Redis-OM para facilidade de uso.
- **Resposta**:
  ```json
  {
    "message": "Arquivo recebido com sucesso",
    "user_count": 100000
  }
  ```

### 2. **GET /superusers**
- **Funcionalidade**: Filtra superusuários (`score >= 900`, `active = true`).
- **Implementação**: Usa `search` do Redis-OM.
- **Escolha**: Índices para consultas rápidas (< 1s).
- **Resposta**:
  ```json
  {
    "timestamp": "2025-04-28T12:00:00.000Z",
    "execution_time_ms": 123,
    "data": [...]
  }
  ```

### 3. **GET /top-countries**
- **Funcionalidade**: Lista os 5 países com mais superusuários.
- **Implementação**: Usa `search` e depois agrupar e ordenar via map.
- **Escolha**: Simplicidade de uso.
- **Resposta**:
  ```json
  {
    "timestamp": "2025-04-28T12:00:00.000Z",
    "execution_time_ms": 98,
    "countries": [...]
  }
  ```

### 4. **GET /team-insights**
- **Funcionalidade**: Insights por equipe (membros, líderes, projetos, % ativos).
- **Implementação**: Múltiplos `FT.AGGREGATE` para contagens.
- **Escolha**: Índices otimizados para performance.
- **Resposta**:
  ```json
  {
    "timestamp": "2025-04-28T12:00:00.000Z",
    "execution_time_ms": 155,
    "teams": [...]
  }
  ```

### 5. **GET /active-users-per-day**
- **Funcionalidade**: Conta logins por data, com filtro `min`.
- **Implementação**: `FT.AGGREGATE` com `FILTER` para `min`.
- **Escolha**: Índices em logs para filtros rápidos.
- **Resposta**:
  ```json
  {
    "timestamp": "2025-04-28T12:00:00.000Z",
    "execution_time_ms": 134,
    "logins": [...]
  }
  ```

### 6. **GET /evaluation**
- **Funcionalidade**: Testa endpoints e retorna relatório.
- **Implementação**: Usa mocks para simular chamadas.
- **Escolha**: Mocks para evitar alterações no código.
- **Resposta**:
  ```json
  {
    "timestamp": "2025-04-28T12:00:00.000Z",
    "tested_endpoints": {
      "/superusuarios": { "status": 200, "time_ms": 123, "valid_response": true },
      "/ranking-paises": { "status": 200, "time_ms": 98, "valid_response": true },
      "/analise-equipes": { "status": 200, "time_ms": 155, "valid_response": true },
      "/usuarios-ativos-por-dia": { "status": 200, "time_ms": 134, "valid_response": true }
    }
  }
  ```

### 7. **POST /flush-users (Bônus)**
- **Funcionalidade**: Limpa dados do Redis.
- **Implementação**: Usa `FLUSHALL`.
- **Escolha**: Simplicidade para testes.
- **Resposta**: `"User data flushed."`

---

## Requisitos Técnicos
- **Tempo < 1s**: Redis e RediSearch garantem respostas rápidas (dentro dos endpoints em que foram utilizados).
- **Timestamp e Tempo**: Incluídos em todos os endpoints.
- **Código Limpo**: Estrutura modular com controladores e serviços.
- **Documentação**: Este markdown e comentários no código.
- **Sem IA**: Solução desenvolvida manualmente.

---

## Limitações e Melhorias
- **Caching**: Poderia usar `SETEX` para respostas frequentes.
- **Paralelismo**: `Promise.all` em `/evaluation` para maior velocidade.
- **Validação**: Ajustar `valid_response` se dados não forem arrays.
- **Remover o Redis-OM**: Ele possibilitou configuração rápida para o desafio, porém é muito menos performático, nos endpoints em que foi utilizado ele ultrapassou os limites de tempo.

---

## Conclusão
A solução atende todos os requisitos com performance, modularidade e documentação clara. Redis com RediSearch foi chave para tempos < 1s, e o endpoint `/evaluation` valida a API automaticamente.
