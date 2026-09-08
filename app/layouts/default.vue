<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_90%_0%,var(--color-brand-50)_0,transparent_34rem)]">
    <AppHeader />
    <div class="mx-auto max-w-360 lg:grid lg:grid-cols-[230px_minmax(0,1fr)]">
      <AppSidebar />
      <main class="min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div class="mx-auto max-w-267.5">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
