<?php

namespace App\Http\Controllers;



class UserAnalysisController extends Controller
{
    public function superusers()
    {
        $start = microtime(true);

        try {
            $users = $this->loadUsersFromJson();
        } catch (\Exception $e) {
            return response()->json([
                'timestamp' => now()->toISOString(),
                'execution_time_ms' => (int)((microtime(true) - $start) * 1000),
                'data' => $e->getMessage(),
            ], $e->getCode());
        }

        $superusers = collect($users)
            ->filter(fn($user) =>
                isset($user['score'], $user['ativo']) &&
                is_numeric($user['score']) &&
                $user['score'] >= 900 &&
                filter_var($user['ativo'], FILTER_VALIDATE_BOOLEAN)
            )
            ->values();

        return response()->json([
            'timestamp' => now()->toISOString(),
            'execution_time_ms' => (int)((microtime(true) - $start) * 1000),
            'data' => $superusers,
        ]);
    }

    public function topCountries()
    {
        $start = microtime(true);

        try {
            $users = $this->loadUsersFromJson();
        } catch (\Exception $e) {
            return response()->json([
                'timestamp' => now()->toISOString(),
                'execution_time_ms' => (int)((microtime(true) - $start) * 1000),
                'data' => $e->getMessage(),
            ], $e->getCode());
        }

        $topCountries = collect($users)
            ->filter(fn($user) => isset($user['pais']))
            ->countBy('pais')
            ->sortDesc()
            ->take(10);

        return response()->json([
            'timestamp' => now()->toISOString(),
            'execution_time_ms' => (int)((microtime(true) - $start) * 1000),
            'data' => $topCountries,
        ]);
    }

    public function teamInsights()
    {
        $start = microtime(true);

        try {
            $users = $this->loadUsersFromJson();
        } catch (\Exception $e) {
            return response()->json([
                'timestamp' => now()->toISOString(),
                'execution_time_ms' => (int)((microtime(true) - $start) * 1000),
                'data' => $e->getMessage(),
            ], $e->getCode());
        }

        $insights = collect($users)
            ->filter(fn($user) =>
                isset($user['equipe']['nome'], $user['score'], $user['ativo'])
                && is_numeric($user['score'])
            )
            ->groupBy('equipe.nome')
            ->map(fn($group) => [
                'total' => $group->count(),
                'media_score' => round($group->avg('score'), 2),
                'ativos' => $group->where('ativo', true)->count(),
                'superusuarios' => $group->where('ativo', true)->where('score', '>=', 900)->count(),
            ])
            ->sortKeys();

        return response()->json([
            'timestamp' => now()->toISOString(),
            'execution_time_ms' => (int)((microtime(true) - $start) * 1000),
            'data' => $insights,
        ]);
    }

    public function loginsPerDay()
    {
        $start = microtime(true);

        try {
            $users = $this->loadUsersFromJson();
        } catch (\Exception $e) {
            return response()->json([
                'timestamp' => now()->toISOString(),
                'execution_time_ms' => (int)((microtime(true) - $start) * 1000),
                'data' => $e->getMessage(),
            ], $e->getCode());
        }

        $logins = collect($users)
            ->flatMap(fn($user) => $user['logs'] ?? [])
            ->filter(fn($log) =>
                isset($log['data'], $log['acao']) &&
                strtolower($log['acao']) === 'login'
            )
            ->countBy('data')
            ->sortKeys();

        return response()->json([
            'timestamp' => now()->toISOString(),
            'execution_time_ms' => (int)((microtime(true) - $start) * 1000),
            'data' => $logins,
        ]);
    }

    private function loadUsersFromJson(): array
    {
        ini_set('memory_limit', '-1');
        $path = storage_path('app/users/usuarios.json');

        if (!file_exists($path)) {
            throw new \Exception('Arquivo não encontrado.', 404);
        }

        try {
            return json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new \Exception('Erro ao decodificar JSON.', 500);
        }
    }
}
