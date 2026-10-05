<script setup>
// Custom select dropdown component
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  id: { type: String, default: undefined },
  ariaLabelledby: { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const rootRef = ref(null)

const selectedLabel = computed(() => {
  const match = props.options.find((o) => o.value === props.modelValue)
  if (match) return match.label
  return props.modelValue || props.options[0]?.label || ''
})

function toggle() {
  isOpen.value = !isOpen.value
}

function select(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

// Close on outside click
function handleOutsideClick(event) {
  if (isOpen.value && rootRef.value && !rootRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <div ref="rootRef" class="course-dropdown-wrapper">
    <button
      :id="id"
      type="button"
      class="type-trigger"
      :class="{ open: isOpen }"
      aria-haspopup="listbox"
      :aria-labelledby="ariaLabelledby"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown.esc="isOpen = false"
    >
      <span class="type-trigger-text">{{ selectedLabel }}</span>
      <span class="course-arrow-btn" :class="{ open: isOpen }" aria-hidden="true">▼</span>
    </button>

    <div v-if="isOpen" class="course-dropdown-menu" role="listbox">
      <div
        v-for="option in options"
        :key="option.value || 'all'"
        class="course-dropdown-item"
        :class="{ selected: modelValue === option.value }"
        role="option"
        :aria-selected="modelValue === option.value"
        @click="select(option.value)"
      >
        <span class="course-name">{{ option.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.type-trigger {
  width: 100%;
  height: var(--select-height, 48px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 10px 0 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  font-size: var(--select-font-size, 14px);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
}

.type-trigger:focus-visible,
.type-trigger.open {
  border-color: var(--blue-light);
}

.type-trigger-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
