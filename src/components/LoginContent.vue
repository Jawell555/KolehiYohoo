<script setup>
import LoginContainer from './LoginContainer.vue'
import LoginCard from './LoginCard.vue'
</script>

<template>
  <div id="loginPage" class="active">
    <LoginContainer />
    <LoginCard />
  </div>
</template>

<style scoped>
#loginPage {
  background: linear-gradient(135deg, #12345b, #4d8dcc);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 30px;
}
#loginPage.active {
  display: flex;
}
</style>
