<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $this->markTestSkipped('Public registration is disabled.');
    }

    public function test_new_users_can_register()
    {
        $this->markTestSkipped('Public registration is disabled.');
    }
}
