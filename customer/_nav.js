// 用户端底部导航
const CustomerNav = {
  items: [
    { id: 'home', name: '首页', icon: 'home', page: 'index.html' },
    { id: 'cards', name: '我的礼卡', icon: 'card_giftcard', page: 'cards.html' },
    { id: 'orders', name: '我的订单', icon: 'shopping_bag', page: 'orders.html' },
    { id: 'profile', name: '我的', icon: 'person', page: 'profile.html' }
  ],

  render(activeId) {
    return `
<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E1D7] z-50 safe-area-inset-bottom">
  <div class="flex items-center justify-around px-2 py-2">
    ${this.items.map(item => `
      <a href="${item.page}"
         class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
           activeId === item.id
             ? 'text-[#C4612F]'
             : 'text-[#5C635D]'
         }">
        <span class="material-symbols-outlined text-2xl ${activeId === item.id ? 'font-variation-settings-fill-1' : ''}">
          ${item.icon}
        </span>
        <span class="text-xs ${activeId === item.id ? 'font-medium' : ''}">${item.name}</span>
      </a>
    `).join('')}
  </div>
</nav>

<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .font-variation-settings-fill-1 {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  body {
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
</style>
`;
  }
};

// 获取或创建匿名用户ID
function getOrCreateCustomerId() {
  let customerId = localStorage.getItem('_customer_id');
  if (!customerId) {
    // 生成匿名用户
    const customers = DB._get('customers');
    const newCustomer = {
      id: DB._nextId(customers),
      name: null,
      phone: null,
      email: null,
      wechat_id: null,
      created_at: new Date().toISOString()
    };
    customers.push(newCustomer);
    DB._set('customers', customers);
    customerId = newCustomer.id;
    localStorage.setItem('_customer_id', customerId);
  }
  return parseInt(customerId);
}
