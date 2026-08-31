// 商家后台导航组件
const MerchantNav = {
  menu: [
    {
      id: 'orders',
      name: '订单管理',
      icon: 'shopping_cart',
      items: [
        { id: 'order-review', name: '订单审核', page: 'orders.html' },
        { id: 'customer-cards', name: '客户礼卡', page: 'customer-cards.html' },
        { id: 'logistics', name: '物流核销', page: 'logistics.html' }
      ]
    },
    {
      id: 'cards',
      name: '礼卡管理',
      icon: 'credit_card',
      items: [
        { id: 'card-generate', name: '批量生成', page: 'cards.html' },
        { id: 'card-status', name: '礼卡状态管理', page: 'card-status.html' },
        { id: 'card-types', name: '礼卡种类', page: 'card-types.html' }
      ]
    },
    {
      id: 'products',
      name: '产品礼盒',
      icon: 'inventory_2',
      items: [
        { id: 'giftbox-manage', name: '礼盒管理', page: 'giftboxes.html' },
        { id: 'product-manage', name: '产品管理', page: 'products.html' }
      ]
    },
    {
      id: 'suppliers',
      name: '供应商管理',
      icon: 'factory',
      items: [
        { id: 'supplier-manage', name: '供应商列表', page: 'suppliers.html' },
        { id: 'logistics-companies', name: '物流公司', page: 'logistics-companies.html' }
      ]
    },
    {
      id: 'customers',
      name: '客户管理',
      icon: 'people',
      items: [
        { id: 'customer-info', name: '客户信息', page: 'customers.html' }
      ]
    },
    {
      id: 'config',
      name: '系统配置',
      icon: 'tune',
      items: [
        { id: 'basic-config', name: '基础配置', page: 'config.html' }
      ]
    }
  ],

  render(activeId) {
    const user = DB.getCurrentUser();
    if (!user || user.role !== 'merchant') {
      window.location.href = 'login.html';
      return '';
    }

    // 找到当前激活的主菜单
    let activeGroup = null;
    for (const group of this.menu) {
      if (group.items.some(item => item.id === activeId)) {
        activeGroup = group.id;
        break;
      }
    }

    return `
<!-- 顶部导航栏 -->
<div class="fixed top-0 left-0 right-0 bg-white border-b border-[#E7E1D7] z-50 h-16">
  <div class="flex items-center justify-between h-full px-6">
    <!-- Logo -->
    <div class="flex items-center gap-3">
      <img src="../Pic/Logo.png" alt="牧美满" class="h-10 w-auto"/>
      <div class="border-l border-[#E7E1D7] pl-3">
        <h1 class="text-base font-semibold text-[#1F2421]">商家运营后台</h1>
        <p class="text-xs text-[#5C635D]">牧美满礼卡系统</p>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="flex items-center gap-4">
      <div class="text-right">
        <p class="text-sm font-medium text-[#1F2421]">${user.name || '当前用户'}</p>
        <p class="text-xs text-[#5C635D]">${user.username}</p>
      </div>
      <button onclick="MerchantNav.logout()"
              class="px-4 py-2 text-sm text-[#5C635D] hover:text-[#C4612F] transition-colors border-l border-[#E7E1D7]">
        退出
      </button>
    </div>
  </div>
</div>

<!-- 左侧边栏 -->
<div class="fixed top-16 left-0 bottom-0 w-56 bg-white border-r border-[#E7E1D7] overflow-y-auto z-40">
  <nav class="p-4 space-y-1">
    ${this.menu.map(group => `
      <div class="mb-2">
        <!-- 分组标题 -->
        <div class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#5C635D] uppercase tracking-wide">
          <span class="material-symbols-outlined text-base">${group.icon}</span>
          <span>${group.name}</span>
        </div>
        <!-- 子菜单 -->
        <div class="space-y-0.5">
          ${group.items.map(item => `
            <a href="${item.page}"
               class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                 activeId === item.id
                   ? 'bg-[#F2E3D6] text-[#C4612F] font-medium'
                   : 'text-[#5C635D] hover:bg-[#FBF9F5] hover:text-[#1F2421]'
               }">
              <span class="w-1.5 h-1.5 rounded-full ${activeId === item.id ? 'bg-[#C4612F]' : 'bg-[#E7E1D7]'}"></span>
              <span>${item.name}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </nav>
</div>

<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  body {
    padding-top: 64px;
    padding-left: 224px;
  }
</style>
`;
  },

  logout() {
    DB.logout();
    window.location.href = 'login.html';
  }
};

// 检查登录状态
function checkAuth() {
  const user = DB.getCurrentUser();
  if (!user || user.role !== 'merchant') {
    window.location.href = 'login.html';
  }
}
