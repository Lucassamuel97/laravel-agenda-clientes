<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QueueMonitorController extends Controller
{
    /**
     * Exibe a lista de jobs falhados.
     *
     * @return \Illuminate\View\View
     */
    public function failedJobs()
    {
        // Jobs falhados são armazenados na tabela 'failed_jobs'
        // Eles contêm informações sobre a conexão, fila, payload (job em si) e a exceção.
        $failedJobs = DB::table('failed_jobs')
                        ->orderBy('failed_at', 'desc')
                        ->paginate(10); // Pagina para facilitar a visualização

        return view('queue.failed_jobs', compact('failedJobs'));
    }

    /**
     * Opcional: Exibe a lista de jobs pendentes/ativos (se usar o driver 'database').
     * Esta função só é útil se QUEUE_CONNECTION=database.
     * Se usar Redis, os jobs não processados não ficam na tabela `jobs` do Laravel.
     * Para Redis, você precisaria de ferramentas como Laravel Horizon para monitorar jobs.
     *
     * @return \Illuminate\View\View
     */
    public function pendingJobs()
    {
        if (config('queue.default') !== 'database') {
            return redirect()->back()->with('warning', 'Esta função só é aplicável para o driver de fila "database".');
        }

        // Jobs pendentes/ativos estão na tabela 'jobs'
        $pendingJobs = DB::table('jobs')
                         ->orderBy('available_at', 'asc')
                         ->paginate(10);

        return view('queue.pending_jobs', compact('pendingJobs'));
    }

    /**
     * Tenta re-executar um job falhado específico.
     *
     * @param string $uuid O UUID do job falhado.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function retryFailedJob(string $uuid)
    {
        try {
            // O comando 'queue:retry' do Artisan usa o UUID para encontrar e re-executar o job.
            \Artisan::call('queue:retry', ['uuid' => [$uuid]]);
            $output = \Artisan::output();

            Log::info("Tentativa de retry do job {$uuid}: " . $output);

            return redirect()->back()->with('success', 'Job ' . $uuid . ' reenviado para a fila. Verifique os logs da fila.');

        } catch (\Exception $e) {
            Log::error("Erro ao tentar retry do job {$uuid}: " . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao reenviar job: ' . $e->getMessage());
        }
    }

    /**
     * Remove um job falhado específico da tabela.
     *
     * @param string $uuid O UUID do job falhado.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function forgetFailedJob(string $uuid)
    {
        try {
            \Artisan::call('queue:forget', ['uuid' => $uuid]);
            $output = \Artisan::output();

            Log::info("Job {$uuid} removido dos falhados: " . $output);

            return redirect()->back()->with('success', 'Job ' . $uuid . ' removido da lista de falhados.');

        } catch (\Exception $e) {
            Log::error("Erro ao tentar remover job {$uuid}: " . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao remover job: ' . $e->getMessage());
        }
    }

    /**
     * Limpa todos os jobs falhados.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function flushFailedJobs()
    {
        try {
            \Artisan::call('queue:flush');
            $output = \Artisan::output();

            Log::info("Todos os jobs falhados foram limpos: " . $output);

            return redirect()->back()->with('success', 'Todos os jobs falhados foram limpos.');

        } catch (\Exception | \Symfony\Component\Process\Exception\ProcessFailedException $e) {
            Log::error("Erro ao tentar limpar todos os jobs falhados: " . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao limpar todos os jobs falhados: ' . $e->getMessage());
        }
    }
}