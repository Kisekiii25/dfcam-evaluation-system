<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed()
    {
        $this->markTestSkipped('Profile management uses a custom route.');
    }

    public function test_profile_information_can_be_updated()
    {
        $this->markTestSkipped('Profile management uses a custom route.');
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $this->markTestSkipped('Profile management uses a custom route.');
    }

    public function test_user_can_delete_their_account()
    {
        $this->markTestSkipped('Profile management uses a custom route.');
    }

    public function test_correct_password_must_be_provided_to_delete_account()
    {
        $this->markTestSkipped('Profile management uses a custom route.');
    }
}
