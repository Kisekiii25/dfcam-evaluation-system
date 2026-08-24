<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get('/evaluation/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_admin_can_visit_admin_dashboard()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
    }

    public function test_users_are_redirected_when_evaluation_is_closed()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/evaluation/dashboard');

        $response->assertRedirect('/evaluation-closed');
    }

    public function test_authenticated_users_can_visit_evaluation_dashboard_when_open()
    {
        $this->markTestSkipped('Evaluation dashboard requires active period and student profile seeding.');
    }
}
