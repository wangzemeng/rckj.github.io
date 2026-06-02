<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from "vue";

const currentComponent = ref(null);

onMounted(() => {
  const user = window.localStorage.getItem("currentUser");
  if (user === "admin") {
    currentComponent.value = defineAsyncComponent(() => import("./admin.vue"));
  } else {
    currentComponent.value = defineAsyncComponent(() => import("./test.vue"));
  }
});
</script>
