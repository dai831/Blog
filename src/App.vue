<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="tb-page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
</template>
