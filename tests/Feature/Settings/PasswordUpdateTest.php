<?php

namespace Tests\Feature\Settings;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_can_be_updated()
    {
        $this->markTestSkipped('Password updates are handled via custom route.');
    }

    public function test_correct_password_must_be_provided_to_update_password()
    {
        $this->markTestSkipped('Password updates are handled via custom route.');
    }
}
