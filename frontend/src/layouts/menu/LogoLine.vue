<template>
  <div class="top-menu">
    <BNavbar class="navbar ps-3 navbar-menu">
      <BNavbarBrand>
        <div alt="logo" class="logo cursor-pointer" @click="navigateTo('/')"></div>
      </BNavbarBrand>
      <BNavbarNav class="ms-auto">
        <BNavItem id="navbar-item" class="top-menu-btn bg-opacity-50 me-2" href="#" title="">
          <i class="icon icon-2xl fi_headset" />
        </BNavItem>
        <BNavItem class="top-menu-btn bg-opacity-25 me-2" href="#" title="">
          <i class="icon icon-2xl fi_help-circle" />
        </BNavItem>
      </BNavbarNav>
    </BNavbar>
  </div>
</template>
