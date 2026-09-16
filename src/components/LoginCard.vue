<script setup></script>

<template>
  <div class="login-card">
    <div id="roleSelectView">
      <h2>Welcome</h2>
      <p class="subtitle">Choose your account type to continue</p>
      <div class="account-options">
        <button type="button" class="account-btn" @click="selectRole('student')">
          <div class="account-btn-icon">🎓</div>
          <div class="account-btn-text">
            <span>Student</span>
            <small>Find schools and explore courses</small>
          </div>
        </button>
        <button type="button" class="account-btn" @click="selectRole('institution')">
          <div class="account-btn-icon">🏛️</div>
          <div class="account-btn-text">
            <span>School / Institution</span>
            <small>Manage offerings and institution profile</small>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  background: white;
  padding: 38px;
  border-radius: 20px;
  box-shadow: 0 20px 60px #09284b44;
  transition: all 0.3s ease;
}
.login-card h2 {
  font-size: 28px;
  margin-bottom: 8px;
  color: var(--blue-dark);
}
.subtitle {
  color: var(--muted);
  margin-bottom: 24px;
}
.account-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.account-btn {
  border: 1px solid var(--border);
  background: white;
  padding: 18px 20px;
  text-align: left;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
}
.account-btn:hover {
  border-color: var(--blue);
  background: #f5faff;
  transform: translateY(-2px);
}
.account-btn-icon {
  width: 46px;
  height: 46px;
  background: #eef6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  transition: 0.2s;
}
.account-btn:hover .account-btn-icon {
  background: #dcecff;
  transform: scale(1.05);
}
.account-btn-text span {
  display: block;
  font-weight: 700;
  color: var(--blue-dark);
  font-size: 16px;
}
.account-btn-text small {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 13px;
}
</style>
