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
            // Add full_name, phone, and role if they don't exist
            if (!Schema::hasColumn('users', 'full_name')) {
                $table->string('full_name')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('full_name');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['customer', 'admin'])->default('customer')->after('password');
            }
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
