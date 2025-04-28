<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class ImportUsersJson extends Command
{
    protected $signature = 'import:users-json';
    protected $description = 'Importa o arquivo usuarios.json e armazena no cache';

    public function handle()
    {
        $path = storage_path('app/users/usuarios.json');

        if (!file_exists($path)) {
            $this->error("Arquivo não encontrado: {$path}");
            return 1;
        }

        $json = file_get_contents($path);
        $users = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($users)) {
            $this->error("Erro ao decodificar JSON: " . json_last_error_msg());
            return 1;
        }

        Cache::put('users', $users, 3600); // 1 hora de cache

        $this->info("Arquivo importado com sucesso!");
        $this->info("Total de usuários carregados: " . count($users));

        return 0;
    }
}
