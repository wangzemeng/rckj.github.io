<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from "vue";

const currentComponent = ref(null);

onMounted(() => {
  const user = localStorage.getItem("currentUser");
  if (user === "admin") {
    currentComponent.value = defineAsyncComponent(() => import("./AdminIndex.vue"));
  } else {
    currentComponent.value = defineAsyncComponent(() => import("./TestIndex.vue"));
  }
});
</script>
