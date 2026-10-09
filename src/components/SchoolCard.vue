<script setup>
defineProps({
  school: {
    type: Object,
    required: true,
  },
  isSaved: {
    type: Boolean,
    default: false,
  },
  tag: {
    type: String,
    default: 'University',
  },
  isSavedView: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['view', 'toggle-save'])
</script>

<template>
  <div class="school-card">
    <div class="school-cover">{{ school.abbreviation }}</div>
    <div class="school-body">
      <span class="school-tag">{{ tag }}</span>
      <h3>{{ school.name }}</h3>
      <p>{{ school.address || 'Address not yet available' }}</p>
      <p v-if="school.distance_km != null" class="school-distance">
        📍 {{ school.distance_km }} km away
      </p>
      <p>
        <template v-if="school.institution_type">{{ school.institution_type }} · </template>
        {{ school.courses_count ?? school.courses?.length ?? 0 }} program{{ (school.courses_count ?? school.courses?.length ?? 0) === 1 ? '' : 's' }} offered
      </p>
      <div class="card-actions">
        <button type="button" class="view-btn" @click="$emit('view', school)">View School</button>
        <button
          type="button"
          class="save-btn"
          :class="{ saved: isSaved }"
          @click="$emit('toggle-save', school.id)"
        >
          <template v-if="isSavedView">Remove</template>
          <template v-else>{{ isSaved ? 'Saved' : 'Save School' }}</template>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.school-distance {
  font-weight: 700;
  color: var(--blue);
}

.school-tag {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
