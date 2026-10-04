<template>
  <div class="school-card skeleton-card-wrapper" aria-hidden="true">
    <div class="skeleton skeleton-cover"></div>
    <div class="school-body">
      <div class="skeleton skeleton-badge" style="width: 75px;"></div>
      <div class="skeleton skeleton-title" style="width: 85%;"></div>
      <div class="skeleton skeleton-text" style="width: 50%; margin-bottom: 14px;"></div>
      <div class="skeleton skeleton-text" style="width: 100%;"></div>
      <div class="skeleton skeleton-text" style="width: 90%;"></div>
      <div class="skeleton skeleton-text" style="width: 75%;"></div>
      <div class="card-actions">
        <div class="skeleton skeleton-btn" style="flex: 1;"></div>
        <div class="skeleton skeleton-btn" style="flex: 1;"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card-wrapper {
  pointer-events: none;
  user-select: none;
  border-color: #e2e8f0;
}
</style>
