<template>
  <component :is="linkType" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
  name: "AppLink",
});

import { isExternal } from "@/utils/dataJudgment";

const props = defineProps({
  to: {
    required: true,
    type: Object,
  },
});

const isExternalLink = computed(() => {
  return isExternal(props.to.path || "");
});

const linkType = computed(() => (isExternalLink.value ? "a" : "router-link"));

const linkProps = (to: any) => {
  if (isExternalLink.value) {
    return {
      href: to.path,
      rel: "noopener noreferrer",
      target: "_blank",
    };
  }
  return { to };
};
</script>
