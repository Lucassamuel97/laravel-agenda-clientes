<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use App\Models\EventType;
use App\Models\Product;
use App\Models\User;
use App\Models\Customer;
use App\Policies\EventPolicy;
use App\Policies\ProductPolicy;
use App\Policies\UserPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\EventTypePolicy;
use Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Product::class => ProductPolicy::class,
        User::class => UserPolicy::class,
        Event::class => EventPolicy::class,
        Customer::class => CustomerPolicy::class,
        EventType::class => EventTypePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('manage-users', function (User $user) {
            return $user->can('viewAny', User::class);
        });

        Gate::define('manage-event-types', function (User $user) {
            return $user->can('viewAny', EventType::class);
        });
    }
}
