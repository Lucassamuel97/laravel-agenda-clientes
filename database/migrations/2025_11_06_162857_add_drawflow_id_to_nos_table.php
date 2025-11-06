<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('nos', function (Blueprint $table) {
            $table->string('drawflow_id')->nullable()->after('id');
            $table->index('drawflow_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nos', function (Blueprint $table) {
            $table->dropIndex(['drawflow_id']);
            $table->dropColumn('drawflow_id');
        });
    }
};
