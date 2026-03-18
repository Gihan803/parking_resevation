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
        Schema::table('users', function (Blueprint $table) {
            // Rename name to full_name
            $table->renameColumn('name', 'full_name');
            // Add phone column
            $table->string('phone')->nullable()->after('full_name');
            // Add role column
            $table->enum('role', ['customer', 'admin'])->default('customer')->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('full_name', 'name');
            $table->dropColumn('phone');
            $table->dropColumn('role');
        });
    }
};
