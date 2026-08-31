/**
 * 礼卡兑换系统 - 数据库抽象层
 * localStorage 数据存储 + 简单加密
 */

const DB_ADAPTER = 'local';
const ENCRYPT_KEY = 'YZN_GIFT_CARD_2026'; // 简单密钥
const DB_VERSION = '19'; // 修改种子数据后递增此版本号

const DB = {
  // ── 工具函数 ──────────────────────────────────────────────
  _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  },
  _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  _nextId(arr) {
    return arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1;
  },

  // ── 简单加密/解密 (XOR + Base64) ──────────────────────────
  _encrypt(text) {
    if (!text) return '';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length));
    }
    return btoa(result);
  },
  _decrypt(encrypted) {
    if (!encrypted) return '';
    try {
      const text = atob(encrypted);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length));
      }
      return result;
    } catch {
      return '';
    }
  },

  // ── 初始化种子数据 ─────────────────────────────────────────
  init() {
    const storedVersion = localStorage.getItem('_db_version');
    if (storedVersion === DB_VERSION) return;

    console.log(`初始化礼卡兑换系统数据库... (v${DB_VERSION})`);
    // 清除旧数据，确保干净初始化
    localStorage.clear();

    // 店铺信息
    this._set('store', {
      id: 1,
      name: '牧美满',
      brand: '牧羊天成 美满人席',
      phone: '0471-3353365',
      service_hours: '9:00-17:30（法定节假日除外）',
      philosophy: '源自内蒙古大草原的优质牛羊肉，传承匠心品质'
    });

    // 产品分类（牛肉、羊肉）- 分发货地
    this._set('product_categories', [
      { id: 1, name: '安格斯牛肉', code: 'angus_beef', icon: '🥩', shipping_location: '苏尼特右旗东部' },
      { id: 2, name: '苏尼特右旗羊肉', code: 'sunite_lamb', icon: '🐑', shipping_location: '苏尼特右旗' }
    ]);

    // 供应商
    this._set('suppliers', [
      {
        id: 1,
        name: '内蒙古优质牛肉供应商',
        category_id: 1,
        contact_person: '张经理',
        phone: '13800001111',
        email: 'beef@supplier.com',
        address: '内蒙古苏尼特右旗东部',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: '苏尼特右旗羊肉供应商',
        category_id: 2,
        contact_person: '李经理',
        phone: '13800002222',
        email: 'lamb@supplier.com',
        address: '内蒙古苏尼特右旗',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]);

    // 产品（原料）
    this._set('products', [
      {
        id: 1,
        category_id: 1,
        supplier_id: 1,
        name: '安格斯牛肉',
        description: '精选优质安格斯牛肉，大理石花纹，全球顶奢之选',
        features: ['进口品质', '冷链配送', '真空包装', '品质保证'],
        intro_images: ['Pic/牧美满宣传册06.png', 'Pic/牧美满宣传册07.png', 'Pic/牧美满宣传册08.png', 'Pic/牧美满宣传册09.png'],
        status: 'active'
      },
      {
        id: 2,
        category_id: 2,
        supplier_id: 2,
        name: '苏尼特右旗羊肉',
        description: '三朝贡品，肉中人参，天然草原放养',
        features: ['草原散养', '天然健康', '肉质鲜美', '营养丰富'],
        intro_images: ['Pic/牧美满宣传册12.png', 'Pic/牧美满宣传册13.png', 'Pic/牧美满宣传册14.png'],
        status: 'active'
      },
      {
        id: 3,
        category_id: 1,
        supplier_id: 1,
        name: '和牛牛肉',
        description: '日本品种和牛，油花丰富，入口即化',
        features: ['A5级和牛', '顶级品质', '限量供应', '高端定制'],
        intro_images: ['Pic/牧美满宣传册06.png'],
        status: 'active'
      }
    ]);

    // 礼盒产品 - 12个（6个牛肉 + 6个羊肉）
    this._set('gift_boxes', [
      // === 安格斯牛肉礼盒 ===
      {
        id: 1,
        name: '悦享初味 牛肉礼盒',
        price: 398,
        weight: '2.1kg',
        product_id: 1,
        category_id: 1,
        description: '安心品质礼盒，优选品质牛肉，品种多样，适合中式烹饪，接受定制',
        contents: ['精选牛肉块 600g×1', '牛腱牛腩筋 500g×1', '安格斯牛肉筋 500g×1', '精选腱子肉 500g×1'],
        images: ['Pic/牧美满宣传册10.png'],
        card_types: ['398'],
        status: 'active'
      },
      {
        id: 2,
        name: '金樽初味 牛肉礼盒',
        price: 588,
        weight: '2.98kg',
        product_id: 1,
        category_id: 1,
        description: '安心品质礼盒，优选品质牛肉，品种多样，适合中式烹饪，接受定制',
        contents: ['安格斯上脑牛排 180g×1', '安格斯眼肉牛腱排 200g×1', '安格斯牛肉块 600g×1', '安格斯牛骨 1000g×1', '安格斯筋头巴脑 500g×1', '安格斯牛肉筋 500g×1'],
        images: ['Pic/牧美满宣传册10.png'],
        card_types: ['588'],
        status: 'active'
      },
      {
        id: 3,
        name: '炙味醇享 牛肉礼盒',
        price: 888,
        weight: '2.74kg',
        product_id: 1,
        category_id: 1,
        description: '三阶段定制饲养的安格斯小公牛，20-24个月龄，72小时排酸，产品鲜嫩，打造牛肉经典美味，精美礼盒，亲朋送礼佳选',
        contents: ['安格斯上脑牛排 180g×2', '安格斯眼肉牛排 180g×1', '安格斯牛腱 500g×1', '安格斯牛肉块 500g×1', '安格斯牛骨 900g×1', '安格斯牛肉筋 500g×1'],
        images: ['Pic/牧美满宣传册11.png'],
        card_types: ['888'],
        status: 'active'
      },
      {
        id: 4,
        name: '琅链臻品 牛肉礼盒',
        price: 1018,
        weight: '3.66kg',
        product_id: 1,
        category_id: 1,
        description: '三阶段定制饲养的安格斯小公牛，20-24个月龄，72小时排酸，产品鲜嫩，打造牛肉经典美味，精美礼盒，亲朋送礼佳选',
        contents: ['安格斯上脑牛排 180g×2', '安格斯眼肉烤牛腱排 200g×2', '安格斯牛腱 300g×1', '安格斯牛肉块 500g×1', '安格斯牛骨 1000g×1', '安格斯牛肉筋 500g×1', '安格斯筋头巴脑 500g×1', '安格斯牛肉块 600g×1'],
        images: ['Pic/牧美满宣传册11.png'],
        card_types: ['1018'],
        status: 'active'
      },
      {
        id: 5,
        name: '福瑞呈祥 牛肉礼盒',
        price: 1588,
        weight: '4.98kg',
        product_id: 1,
        category_id: 1,
        description: '肉质细嫩，煎烤炖炒，皆是珍品。过节送礼，就选牧美满',
        contents: ['安格斯上脑牛排 180g×1', '安格斯牛腱腱块 500g×2', '安格斯牛腱肉粒 300g×3', '安格斯牛肉肉 500g×1', '安格斯牛骨 1000g×1', '安格斯牛骨 1000g×1', '安格斯筋头巴脑 500g×1'],
        images: ['Pic/牧美满宣传册11.png'],
        card_types: ['1588'],
        status: 'active'
      },
      {
        id: 6,
        name: '御宴华章 牛肉礼盒',
        price: 2288,
        weight: '1.98kg',
        product_id: 1,
        category_id: 1,
        description: '美国优佳级别牛排，厚切牛排，牛肉雪花丰富，味道鲜美，肉质细嫩，满足高端需求',
        contents: ['美国安格斯台阶极佳西冷牛排 180g×1', '美国安格斯台阶极佳眼肉牛排 180g×2', '美国安格斯台阶极佳上脑牛排 180g×4', '美国安格斯台阶极佳牛小排 180g×1', '安格斯上脑牛排 180g×3'],
        images: ['Pic/牧美满宣传册11.png'],
        card_types: ['2288'],
        status: 'active'
      },
      // === 苏尼特右旗羊肉礼盒 ===
      {
        id: 7,
        name: '羊悦清欢 羊肉礼盒',
        price: 398,
        weight: '2.5kg',
        product_id: 2,
        category_id: 2,
        description: '严选苏尼特草原羊肉，多种肉品科学搭配，鲜嫩不腻，适合家庭火锅或家常烹煮，操作省心，接受定制',
        contents: ['羊小卷 500g×1', '羊大卷 1000g×1', '羊寸排 1000g×1', '清炖火锅底料 117g×1', '二八酱 120g×1'],
        images: ['Pic/牧美满宣传册15.png'],
        card_types: ['398'],
        status: 'active'
      },
      {
        id: 8,
        name: '福瑞盈门 羊肉礼盒',
        price: 898,
        weight: '6.0kg',
        product_id: 2,
        category_id: 2,
        description: '精选苏尼特羊肉组合，有大块肉的满足感，也有带骨肉的醇厚鲜味，尽显心意',
        contents: ['羊后腿包 2500g×1', '羊里脊块 500g×3', '羊寸排 1000g×1', '羊蝎子 1000g×1'],
        images: ['Pic/牧美满宣传册16.png'],
        card_types: ['898'],
        status: 'active'
      },
      {
        id: 9,
        name: '珍馐盛筵 羊肉礼盒',
        price: 598,
        weight: '4.0kg',
        product_id: 2,
        category_id: 2,
        description: '严选品质羊肉礼盒，严选苏尼特羊肉，肥瘦相间，内质丰富，满足多人聚餐需求，烟、涮、焖皆宜，是节日家宴或朋友聚餐的实惠之选',
        contents: ['羊小卷 500g×4', '羊蝎子 1000g×1', '羊寸排 1000g×1'],
        images: ['Pic/牧美满宣传册15.png'],
        card_types: ['598'],
        status: 'active'
      },
      {
        id: 10,
        name: '岁序珍品 羊肉礼盒',
        price: 1118,
        weight: '7.5kg',
        product_id: 2,
        category_id: 2,
        description: '甄选优质苏尼特羊肉，肥瘦相间，肉质细嫩，无膻味，品质上乘，无愧节庆时刻的珍馐佳宴',
        contents: ['羊小卷 500g×1', '羊蝎子 1000g×1', '羊寸排 1000g×1', '羊后腿 2500g×1', '羊里脊块 500g×3'],
        images: ['Pic/牧美满宣传册16.png'],
        card_types: ['1118'],
        status: 'active'
      },
      {
        id: 11,
        name: '瑞彩华章 羊肉礼盒',
        price: 1288,
        weight: '8.5kg',
        product_id: 2,
        category_id: 2,
        description: '高端苏尼特羊肉礼盒，多样分割态，肉品饱满，层次丰富，是高端劳保礼或亲友之选',
        contents: ['羊后腿包 2500g×1', '羊蝎子 1000g×1', '羊肉块 2500g×1', '羊寸排 1000g×1', '羊小卷 500g×3'],
        images: ['Pic/牧美满宣传册16.png'],
        card_types: ['1288'],
        status: 'active'
      }
    ]);

    // 权限定义（所有可用的页面权限）
    this._set('permissions', [
      // 商家运营后台权限
      { id: 1, permission_key: 'merchant:order-review', name: '订单审核', backend: 'merchant', page: 'orders.html', group: '订单管理', sort_order: 1, description: '查看和审核客户订单', created_at: new Date().toISOString() },
      { id: 2, permission_key: 'merchant:customer-cards', name: '客户礼卡', backend: 'merchant', page: 'customer-cards.html', group: '订单管理', sort_order: 2, description: '查看客户礼卡信息', created_at: new Date().toISOString() },
      { id: 3, permission_key: 'merchant:logistics', name: '物流核销', backend: 'merchant', page: 'logistics.html', group: '订单管理', sort_order: 3, description: '处理物流核销', created_at: new Date().toISOString() },
      { id: 4, permission_key: 'merchant:card-generate', name: '生成礼卡', backend: 'merchant', page: 'card-generate.html', group: '礼卡管理', sort_order: 4, description: '生成新的礼卡', created_at: new Date().toISOString() },
      { id: 5, permission_key: 'merchant:card-status', name: '卡状态查询', backend: 'merchant', page: 'card-status.html', group: '礼卡管理', sort_order: 5, description: '查询礼卡状态', created_at: new Date().toISOString() },
      { id: 6, permission_key: 'merchant:card-types', name: '礼卡类型', backend: 'merchant', page: 'card-types.html', group: '礼卡管理', sort_order: 6, description: '管理礼卡类型配置', created_at: new Date().toISOString() },
      { id: 7, permission_key: 'merchant:giftbox-manage', name: '礼盒管理', backend: 'merchant', page: 'giftbox-manage.html', group: '产品管理', sort_order: 7, description: '管理礼盒产品', created_at: new Date().toISOString() },
      { id: 8, permission_key: 'merchant:product-manage', name: '产品管理', backend: 'merchant', page: 'product-manage.html', group: '产品管理', sort_order: 8, description: '管理产品信息', created_at: new Date().toISOString() },
      { id: 9, permission_key: 'merchant:supplier-manage', name: '供应商管理', backend: 'merchant', page: 'supplier-manage.html', group: '产品管理', sort_order: 9, description: '管理供应商信息', created_at: new Date().toISOString() },
      { id: 10, permission_key: 'merchant:logistics-companies', name: '物流公司', backend: 'merchant', page: 'logistics-companies.html', group: '产品管理', sort_order: 10, description: '管理物流公司', created_at: new Date().toISOString() },
      { id: 11, permission_key: 'merchant:customer-info', name: '客户信息', backend: 'merchant', page: 'customer-info.html', group: '客户管理', sort_order: 11, description: '管理客户信息', created_at: new Date().toISOString() },
      { id: 12, permission_key: 'merchant:basic-config', name: '基本配置', backend: 'merchant', page: 'basic-config.html', group: '系统配置', sort_order: 12, description: '系统基本配置', created_at: new Date().toISOString() },

      // 系统管理后台权限
      { id: 13, permission_key: 'admin:user-list', name: '用户列表', backend: 'admin', page: 'users.html', group: '用户管理', sort_order: 1, description: '管理系统用户', created_at: new Date().toISOString() },
      { id: 14, permission_key: 'admin:role-permissions', name: '角色权限', backend: 'admin', page: 'roles.html', group: '用户管理', sort_order: 2, description: '管理角色权限配置', created_at: new Date().toISOString() },
      { id: 15, permission_key: 'admin:permission-manage', name: '权限管理', backend: 'admin', page: 'permissions.html', group: '用户管理', sort_order: 3, description: '管理系统权限项', created_at: new Date().toISOString() },
      { id: 16, permission_key: 'admin:basic-config', name: '基本配置', backend: 'admin', page: 'basic-config.html', group: '系统配置', sort_order: 4, description: '系统基本配置', created_at: new Date().toISOString() }
    ]);

    // 角色定义
    this._set('roles', [
      {
        id: 1,
        name: '系统管理员',
        role_key: 'admin',
        description: '拥有系统最高权限，可以管理所有用户、角色和系统配置',
        permissions: [
          'admin:user-list',
          'admin:role-permissions',
          'admin:permission-manage',
          'admin:basic-config'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: '商家运营',
        role_key: 'merchant',
        description: '负责日常业务运营，包括礼卡生成、订单审核、物流管理等',
        permissions: [
          'merchant:order-review',
          'merchant:customer-cards',
          'merchant:logistics',
          'merchant:card-generate',
          'merchant:card-status',
          'merchant:card-types',
          'merchant:giftbox-manage',
          'merchant:product-manage',
          'merchant:supplier-manage',
          'merchant:logistics-companies',
          'merchant:customer-info',
          'merchant:basic-config'
        ],
        created_at: new Date().toISOString()
      }
    ]);

    // 用户账号
    this._set('users', [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: '系统管理员',
        phone: '13800000001',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'merchant',
        password: 'merchant123',
        role: 'merchant',
        name: '商家运营',
        phone: '13800000002',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]);

    // 礼卡类型配置 - 每个礼盒对应一种礼卡
    this._set('card_types', [
      { id: 1, name: '398型', amount: 398, prefix: 'LK398', validity_days: 1825, color: '#C4612F' },
      { id: 2, name: '588型', amount: 588, prefix: 'LK588', validity_days: 1825, color: '#8B4513' },
      { id: 3, name: '598型', amount: 598, prefix: 'LK598', validity_days: 1825, color: '#D2691E' },
      { id: 4, name: '888型', amount: 888, prefix: 'LK888', validity_days: 1825, color: '#A0522D' },
      { id: 5, name: '898型', amount: 898, prefix: 'LK898', validity_days: 1825, color: '#CD853F' },
      { id: 6, name: '1018型', amount: 1018, prefix: 'LK1018', validity_days: 1825, color: '#8B6914' },
      { id: 7, name: '1118型', amount: 1118, prefix: 'LK1118', validity_days: 1825, color: '#B8860B' },
      { id: 8, name: '1288型', amount: 1288, prefix: 'LK1288', validity_days: 1825, color: '#DAA520' },
      { id: 9, name: '1588型', amount: 1588, prefix: 'LK1588', validity_days: 1825, color: '#CD9B1D' },
      { id: 10, name: '2288型', amount: 2288, prefix: 'LK2288', validity_days: 1825, color: '#B8860B' }
    ]);

    // 礼卡数据 - 为每个类型生成2张测试卡片
    const initialCards = [];
    const cardTypes = [
      { id: 1, name: '398型', amount: 398, prefix: 'LK398', validity_days: 1825 },
      { id: 2, name: '588型', amount: 588, prefix: 'LK588', validity_days: 1825 },
      { id: 3, name: '598型', amount: 598, prefix: 'LK598', validity_days: 1825 },
      { id: 4, name: '888型', amount: 888, prefix: 'LK888', validity_days: 1825 },
      { id: 5, name: '898型', amount: 898, prefix: 'LK898', validity_days: 1825 },
      { id: 6, name: '1018型', amount: 1018, prefix: 'LK1018', validity_days: 1825 },
      { id: 7, name: '1118型', amount: 1118, prefix: 'LK1118', validity_days: 1825 },
      { id: 8, name: '1288型', amount: 1288, prefix: 'LK1288', validity_days: 1825 },
      { id: 9, name: '1588型', amount: 1588, prefix: 'LK1588', validity_days: 1825 },
      { id: 10, name: '2288型', amount: 2288, prefix: 'LK2288', validity_days: 1825 }
    ];

    const now = new Date();
    let cardId = 1;

    // 礼卡绑定分配：多位客户各自持有礼卡（cardId -> customer_id）
    // 刘备(1) 持有较多卡，其余客户各持有若干张，部分卡保持未绑定
    const cardOwners = {
      1: 1, 2: 1, 3: 1, 4: 1, 5: 1,   // 刘备 5 张
      6: 2, 7: 2, 8: 2,               // 关羽 3 张
      9: 3, 10: 3,                    // 张飞 2 张
      11: 4, 12: 4, 13: 4,            // 赵云 3 张
      14: 5, 15: 5                    // 黄忠 2 张
      // 16-20 保持未绑定
    };

    cardTypes.forEach(type => {
      for (let i = 0; i < 2; i++) {
        const cardNo = `${type.prefix}${String(cardId).padStart(8, '0')}`;
        const password = String(100000 + cardId).substring(0, 6);
        const expireAt = new Date(now.getTime() + type.validity_days * 24 * 60 * 60 * 1000);
        const ownerId = cardOwners[cardId] || null;

        initialCards.push({
          id: cardId,
          card_no_encrypted: this._encrypt(cardNo),
          password_encrypted: this._encrypt(password),
          type_id: type.id,
          amount: type.amount,
          status: 'active',
          bind_status: ownerId ? 'bound' : 'unbound',
          redeem_status: 'unredeemed',
          customer_id: ownerId,
          order_id: null,
          bound_at: ownerId ? now.toISOString() : null,
          created_at: now.toISOString(),
          expire_at: expireAt.toISOString(),
          created_by: 2
        });
        cardId++;
      }
    });

    // 演示用异常状态：卡17冻结、卡19锁定
    const frozenCard = initialCards.find(c => c.id === 17);
    if (frozenCard) frozenCard.status = 'frozen';
    const lockedCard = initialCards.find(c => c.id === 19);
    if (lockedCard) lockedCard.status = 'locked';

    this._set('gift_cards', initialCards);

    // 客户数据
    this._set('customers', [
      {
        id: 1,
        name: '刘备',
        phone: '13900000001',
        email: '',
        wechat_id: '',
        username: 'liubei',
        password: 'user123',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: '关羽',
        phone: '13800001001',
        email: 'guanyu@example.com',
        wechat_id: '',
        username: 'guanyu',
        password: 'user123',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: '张飞',
        phone: '13800003003',
        email: 'zhangfei@example.com',
        wechat_id: '',
        username: 'zhangfei',
        password: 'user123',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: '赵云',
        phone: '13800004004',
        email: 'zhaoyun@example.com',
        wechat_id: '',
        username: 'zhaoyun',
        password: 'user123',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        name: '黄忠',
        phone: '13800005005',
        email: 'huangzhong@example.com',
        wechat_id: '',
        username: 'huangzhong',
        password: 'user123',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]);

    // 客户收货地址表
    this._set('customer_addresses', [
      {
        id: 1,
        customer_id: 1,
        receiver_name: '刘备',
        receiver_phone: '13900000001',
        receiver_address: '内蒙古呼和浩特市赛罕区大学东街110号',
        is_default: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        customer_id: 2,
        receiver_name: '关羽',
        receiver_phone: '13800001001',
        receiver_address: '北京市朝阳区建国路88号',
        is_default: true,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        customer_id: 3,
        receiver_name: '张飞',
        receiver_phone: '13800003003',
        receiver_address: '广州市天河区珠江新城',
        is_default: true,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        customer_id: 4,
        receiver_name: '赵云',
        receiver_phone: '13800004004',
        receiver_address: '上海市浦东新区世纪大道1号',
        is_default: true,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        customer_id: 5,
        receiver_name: '黄忠',
        receiver_phone: '13800005005',
        receiver_address: '深圳市南山区科技园',
        is_default: true,
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        customer_id: 2,
        receiver_name: '关羽',
        receiver_phone: '13800001001',
        receiver_address: '北京市朝阳区朝阳门外大街19号',
        is_default: false,
        created_at: new Date().toISOString()
      },
      {
        id: 7,
        customer_id: 4,
        receiver_name: '李娜',
        receiver_phone: '13800002002',
        receiver_address: '深圳市南山区科技园',
        is_default: false,
        created_at: new Date().toISOString()
      },
      {
        id: 8,
        customer_id: 3,
        receiver_name: '李娜',
        receiver_phone: '13800002002',
        receiver_address: '深圳市南山区科技园',
        is_default: false,
        created_at: new Date().toISOString()
      }
    ]);

    // 父订单组 - 一个用户一次购买形成一个组
    const baseTime = new Date('2026-08-01T09:00:00').getTime();
    this._set('order_groups', [
      {
        id: 1,
        group_no: 'DD20260801001',
        customer_id: 1,
        customer_name: '刘备',
        customer_phone: '13900000001',
        receiver_name: '刘备',
        receiver_phone: '13900000001',
        receiver_address: '内蒙古呼和浩特市赛罕区大学东街110号',
        note: '过节送礼',
        item_count: 3,
        total_amount: 1884,
        status: 'partial', // all_pending/approved/partial/shipped/completed/rejected/cancelled
        created_at: new Date(baseTime + 10000000).toISOString()
      },
      {
        id: 2,
        group_no: 'DD20260801002',
        customer_id: 2,
        customer_name: '关羽',
        customer_phone: '13800001001',
        receiver_name: '关羽',
        receiver_phone: '13800001001',
        receiver_address: '北京市朝阳区建国路88号',
        note: '',
        item_count: 1,
        total_amount: 398,
        status: 'pending',
        created_at: new Date(baseTime).toISOString()
      },
      {
        id: 3,
        group_no: 'DD20260802003',
        customer_id: 2,
        customer_name: '李娜',
        customer_phone: '13800002002',
        receiver_name: '王芳',
        receiver_phone: '13800003003',
        receiver_address: '上海市浦东新区张江高科技园区',
        note: '请尽快发货，送给父母的礼物',
        item_count: 1,
        total_amount: 888,
        status: 'approved',
        created_at: new Date(baseTime + 86400000).toISOString()
      },
      {
        id: 4,
        group_no: 'DD20260803004',
        customer_id: 3,
        customer_name: '张飞',
        customer_phone: '13800003003',
        receiver_name: '张飞',
        receiver_phone: '13800003003',
        receiver_address: '广州市天河区珠江新城',
        note: '',
        item_count: 1,
        total_amount: 398,
        status: 'shipped',
        created_at: new Date(baseTime + 172800000).toISOString()
      },
      {
        id: 5,
        group_no: 'DD20260804005',
        customer_id: 4,
        customer_name: '赵云',
        customer_phone: '13800004004',
        receiver_name: '赵云',
        receiver_phone: '13800004004',
        receiver_address: '成都市锦江区春熙路',
        note: '',
        item_count: 1,
        total_amount: 588,
        status: 'completed',
        created_at: new Date(baseTime + 259200000).toISOString()
      },
      {
        id: 6,
        group_no: 'DD20260805006',
        customer_id: 5,
        customer_name: '黄忠',
        customer_phone: '13800005005',
        receiver_name: '黄忠',
        receiver_phone: '13800005005',
        receiver_address: '深圳市南山区科技园',
        note: '',
        item_count: 1,
        total_amount: 898,
        status: 'rejected',
        created_at: new Date(baseTime + 345600000).toISOString()
      },
      {
        id: 7,
        group_no: 'DD20260806007',
        customer_id: 2,
        customer_name: '关羽',
        customer_phone: '13800001001',
        receiver_name: '关羽',
        receiver_phone: '13800001001',
        receiver_address: '北京市朝阳区建国路88号',
        note: '',
        item_count: 1,
        total_amount: 398,
        status: 'pending',
        created_at: new Date(baseTime + 432000000).toISOString()
      },
      {
        id: 8,
        group_no: 'DD20260807008',
        customer_id: 3,
        customer_name: '张飞',
        customer_phone: '13800003003',
        receiver_name: '张飞',
        receiver_phone: '13800003003',
        receiver_address: '广州市天河区珠江新城',
        note: '',
        item_count: 1,
        total_amount: 888,
        status: 'approved',
        created_at: new Date(baseTime + 518400000).toISOString()
      }
    ]);

    // 兑换订单明细 - 每行对应一张礼卡+一个礼盒
    this._set('orders', [
      // 父订单组1：刘备的3件礼盒
      {
        id: 9,
        group_id: 1,
        order_no: 'DD202608010009',
        customer_id: 1,
        customer_name: '刘备',
        customer_phone: '13900000001',
        card_number: 'LK39800000001',
        gift_box_id: 1,
        gift_box_name: '悦享初味 牛肉礼盒',
        gift_box_price: 398,
        category_id: 1,
        receiver_name: '刘备',
        receiver_phone: '13900000001',
        receiver_address: '内蒙古呼和浩特市赛罕区大学东街110号',
        note: '',
        status: 'approved',
        created_at: new Date(baseTime + 10000000).toISOString(),
        updated_at: new Date(baseTime + 10800000).toISOString()
      },
      {
        id: 10,
        group_id: 1,
        order_no: 'DD202608020010',
        customer_id: 1,
        customer_name: '刘备',
        customer_phone: '13900000001',
        card_number: 'LK88800000007',
        card_password: '100007',
        gift_box_id: 3,
        gift_box_name: '炙味醇享 牛肉礼盒',
        gift_box_price: 888,
        category_id: 1,
        receiver_name: '刘备',
        receiver_phone: '13900000001',
        receiver_address: '内蒙古呼和浩特市赛罕区大学东街110号',
        note: '',
        status: 'pending',
        created_at: new Date(baseTime + 20000000).toISOString()
      },
      {
        id: 11,
        group_id: 1,
        order_no: 'DD202608030011',
        customer_id: 1,
        customer_name: '刘备',
        customer_phone: '13900000001',
        card_number: 'LK59800000006',
        gift_box_id: 9,
        gift_box_name: '珍馐盛筵 羊肉礼盒',
        gift_box_price: 598,
        category_id: 2,
        receiver_name: '刘备',
        receiver_phone: '13900000001',
        receiver_address: '内蒙古呼和浩特市赛罕区大学东街110号',
        note: '过节送礼',
        status: 'shipped',
        created_at: new Date(baseTime + 30000000).toISOString(),
        updated_at: new Date(baseTime + 36000000).toISOString()
      },
      {
        id: 1,
        group_id: 2,
        order_no: 'DD202608010001',
        customer_id: 2,
        customer_name: '关羽',
        customer_phone: '13800001001',
        card_number: 'LK39800000001',
        card_password: '888888',
        gift_box_id: 1,
        gift_box_name: '悦享初味 牛肉礼盒',
        gift_box_price: 398,
        category_id: 1,
        receiver_name: '关羽',
        receiver_phone: '13800001001',
        receiver_address: '北京市朝阳区建国路88号',
        note: '',
        status: 'pending',
        created_at: new Date(baseTime).toISOString()
      },
      {
        id: 2,
        group_id: 3,
        order_no: 'DD202608020002',
        customer_id: 2,
        customer_name: '李娜',
        customer_phone: '13800002002',
        card_number: 'LK88800000003',
        gift_box_id: 3,
        gift_box_name: '炙味醇享 牛肉礼盒',
        gift_box_price: 888,
        category_id: 1,
        receiver_name: '王芳',
        receiver_phone: '13800003003',
        receiver_address: '上海市浦东新区张江高科技园区',
        note: '请尽快发货，送给父母的礼物',
        status: 'approved',
        created_at: new Date(baseTime + 86400000).toISOString(),
        updated_at: new Date(baseTime + 90000000).toISOString()
      },
      {
        id: 3,
        group_id: 4,
        order_no: 'DD202608030003',
        customer_id: 3,
        customer_name: '张飞',
        customer_phone: '13800003003',
        card_number: 'LK39800000002',
        gift_box_id: 7,
        gift_box_name: '羊悦清欢 羊肉礼盒',
        gift_box_price: 398,
        category_id: 2,
        receiver_name: '张飞',
        receiver_phone: '13800003003',
        receiver_address: '广州市天河区珠江新城',
        note: '',
        status: 'shipped',
        created_at: new Date(baseTime + 172800000).toISOString(),
        updated_at: new Date(baseTime + 180000000).toISOString()
      },
      {
        id: 4,
        group_id: 5,
        order_no: 'DD202608040004',
        customer_id: 4,
        customer_name: '赵云',
        customer_phone: '13800004004',
        card_number: 'LK128800000008',
        gift_box_id: 11,
        gift_box_name: '瑞彩华章 羊肉礼盒',
        gift_box_price: 1288,
        category_id: 2,
        receiver_name: '赵云',
        receiver_phone: '13800004004',
        receiver_address: '成都市高新区天府大道南段',
        note: '',
        status: 'completed',
        created_at: new Date(baseTime + 259200000).toISOString(),
        updated_at: new Date(baseTime + 300000000).toISOString()
      },
      {
        id: 5,
        group_id: 7,
        order_no: 'DD202608050005',
        customer_id: 2,
        customer_name: '关羽',
        customer_phone: '13800001001',
        card_number: 'LK158800000017',
        card_password: '100017',
        gift_box_id: 5,
        gift_box_name: '福瑞呈祥 牛肉礼盒',
        gift_box_price: 1588,
        category_id: 1,
        receiver_name: '关羽父母',
        receiver_phone: '13800005005',
        receiver_address: '内蒙古呼和浩特市新城区',
        note: '',
        status: 'pending',
        created_at: new Date(baseTime + 345600000).toISOString()
      },
      {
        id: 6,
        group_id: 6,
        order_no: 'DD202608060006',
        customer_id: 5,
        customer_name: '黄忠',
        customer_phone: '13800005005',
        card_number: 'LK89800000005',
        gift_box_id: 8,
        gift_box_name: '福瑞盈门 羊肉礼盒',
        gift_box_price: 898,
        category_id: 2,
        receiver_name: '黄忠',
        receiver_phone: '13800005005',
        receiver_address: '杭州市西湖区文三路',
        note: '地址有误，请确认',
        status: 'rejected',
        status_note: '收货地址不完整，请客户补充详细地址',
        created_at: new Date(baseTime + 432000000).toISOString(),
        updated_at: new Date(baseTime + 435000000).toISOString()
      },
      {
        id: 7,
        group_id: 7,
        order_no: 'DD202608070007',
        customer_id: 2,
        customer_name: '李娜',
        customer_phone: '13800002002',
        card_number: 'LK228800000019',
        card_password: '100019',
        gift_box_id: 6,
        gift_box_name: '御宴华章 牛肉礼盒',
        gift_box_price: 2288,
        category_id: 1,
        receiver_name: '李娜',
        receiver_phone: '13800002002',
        receiver_address: '深圳市南山区科技园',
        note: '',
        status: 'pending',
        created_at: new Date(baseTime + 518400000).toISOString()
      },
      {
        id: 8,
        group_id: 8,
        order_no: 'DD202608080008',
        customer_id: 3,
        customer_name: '张飞',
        customer_phone: '13800003003',
        card_number: 'LK111800000007',
        gift_box_id: 10,
        gift_box_name: '岁序珍品 羊肉礼盒',
        gift_box_price: 1118,
        category_id: 2,
        receiver_name: '张飞',
        receiver_phone: '13800003003',
        receiver_address: '广州市天河区珠江新城花城大道',
        note: '',
        status: 'approved',
        created_at: new Date(baseTime + 604800000).toISOString(),
        updated_at: new Date(baseTime + 607000000).toISOString()
      }
    ]);

    // 物流信息
    this._set('logistics', [
      {
        id: 1,
        order_id: 11,
        order_no: 'DDWL202608030011',
        logistics_no: 'YT88960001795',
        logistics_company: '圆通快递',
        logistics_company_id: 3,
        courier_name: '黎师傅',
        courier_phone: '18200000001',
        receiver_name: '刘备',
        receiver_phone: '13900000001',
        receiver_address: '内蒙古呼和浩特市赛罕区大学东街110号',
        delivery_method: '上门配送',
        status: 'delivered',
        created_at: new Date(baseTime + 30000000).toISOString(),
        shipped_at: new Date(baseTime + 31000000).toISOString(),
        delivered_at: new Date(baseTime + 36000000).toISOString(),
        tracking_details: [
          {
            time: '2026-08-27 10:49:56',
            location: '呼和浩特市赛罕区',
            status: 'delivered',
            description: '您的快件已送达，收件人：办公室门口。如遇找不到包裹等问题，请联系快递员:18200000001，或致电专属客服95554，处理更快捷！感谢使用圆通速递，期待再次为您服务！'
          },
          {
            time: '2026-08-27 10:09:36',
            location: '呼和浩特市赛罕区',
            status: 'in_transit',
            description: '【呼和浩特市赛罕区大学东街】的黎师傅(18200000001)正在为您派件(95161和18521号段的上海号码为圆通快递员专属号码，请放心接听。如遇物流问题，请联系快递员为您解决，或致电专属客服95554）'
          },
          {
            time: '2026-08-27 01:13:25',
            location: '呼和浩特市赛罕区城西',
            status: 'in_transit',
            description: '您的快件已经到达【呼和浩特市赛罕区城西】【物流问题请致电（专属热线:95554）更快解决】'
          },
          {
            time: '2026-08-26 21:23:53',
            location: '呼和浩特转运中心',
            status: 'in_transit',
            description: '您的快件离开【呼和浩特转运中心】，已发往【呼和浩特市赛罕区城西】'
          },
          {
            time: '2026-08-26 20:57:58',
            location: '呼和浩特转运中心',
            status: 'in_transit',
            description: '您的快件已经到达【呼和浩特转运中心】【物流问题请致电（专属热线:95554）更快解决】'
          },
          {
            time: '2026-08-26 15:32:10',
            location: '苏尼特右旗网点',
            status: 'shipped',
            description: '【苏尼特右旗网点】已收件（揽件人：张三，电话:13500000001）'
          }
        ]
      }
    ]);

    // 物流公司
    this._set('logistics_companies', [
      {
        id: 1,
        name: '顺丰速运',
        contact: '95338',
        address: '全国各地',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: '京东物流',
        contact: '950616',
        address: '全国各地',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: '圆通快递',
        contact: '95554',
        address: '全国各地',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]);

    // 系统配置
    this._set('system_config', {
      card_validity_days: 1825, // 5年有效期
      auto_verify_days: 7, // 收货后7天自动核销
      logistics_providers: ['顺丰速运', '京东物流', '德邦快递'],
      service_phone: '0471-3353365',
      service_phone_1: '13354716045',
      service_phone_2: '15104861913',
      service_hours: '9:00-17:30',
      company_name: '内蒙古诚友网络科技有限公司'
    });

    localStorage.setItem('_db_version', DB_VERSION);
    console.log('数据库初始化完成');
  },

  // ── 礼卡管理 ──────────────────────────────────────────────
  // 批量生成礼卡
  generateCards(type_id, count, operator_id) {
    const cards = this._get('gift_cards');
    const cardType = this._get('card_types').find(t => t.id === type_id);
    if (!cardType) throw new Error('礼卡类型不存在');

    const newCards = [];
    const now = new Date();
    const expireAt = new Date(now.getTime() + cardType.validity_days * 24 * 60 * 60 * 1000);

    for (let i = 0; i < count; i++) {
      const cardNo = this._generateCardNo(cardType.prefix);
      const password = this._generatePassword();

      newCards.push({
        id: this._nextId([...cards, ...newCards]),
        card_no_encrypted: this._encrypt(cardNo), // 加密存储
        password_encrypted: this._encrypt(password),
        card_no_plain: cardNo, // 仅生成时返回，不存储
        password_plain: password,
        type_id,
        amount: cardType.amount,
        status: 'active', // active/frozen/used/expired
        bind_status: 'unbound', // unbound/bound
        redeem_status: 'unredeemed', // unredeemed/redeemed
        customer_id: null,
        order_id: null,
        created_at: now.toISOString(),
        expire_at: expireAt.toISOString(),
        created_by: operator_id
      });
    }

    // 移除临时明文字段
    const cardsToStore = newCards.map(c => {
      const { card_no_plain, password_plain, ...rest } = c;
      return rest;
    });

    this._set('gift_cards', [...cards, ...cardsToStore]);
    return newCards; // 返回包含明文的数据（仅用于显示）
  },

  // 批量生成礼卡（自定义16位卡号：年份2+固定20+批次2+随机4+顺序5+校验1）
  batchGenerateCards({ year, batch, count, startSeq = 0, amount = 0, expireAt = null, generateQR = false, operator_id = null }) {
    const cards = this._get('gift_cards');
    const newCards = [];
    const now = new Date();
    const expireDate = expireAt
      ? new Date(expireAt)
      : new Date(now.getTime() + 3 * 365 * 24 * 60 * 60 * 1000); // 默认3年
    const yyyy = String(year).padStart(4, '0');
    const random4 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    for (let i = 0; i < count; i++) {
      const sequence = (startSeq + i).toString().padStart(5, '0');
      const base15 = yyyy + batch + random4 + sequence;
      const cardNo = base15 + this._luhnCheckDigit(base15);
      const password = this._generatePassword();

      const card = {
        id: this._nextId([...cards, ...newCards]),
        card_no_encrypted: this._encrypt(cardNo),
        password_encrypted: this._encrypt(password),
        card_no_plain: cardNo,
        password_plain: password,
        type_id: null,
        amount: Number(amount) || 0,
        batch,
        year: Number(year),
        has_qrcode: !!generateQR,
        status: 'active',
        bind_status: 'unbound',
        redeem_status: 'unredeemed',
        customer_id: null,
        order_id: null,
        created_at: now.toISOString(),
        expire_at: expireDate.toISOString(),
        created_by: operator_id
      };

      // 生成二维码
      if (generateQR && typeof QRCode !== 'undefined') {
        card.qrcode_data = this._generateQRCode(cardNo, password);
      }

      newCards.push(card);
    }

    const cardsToStore = newCards.map(c => {
      const { card_no_plain, password_plain, qrcode_data, ...rest } = c;
      return rest;
    });

    this._set('gift_cards', [...cards, ...cardsToStore]);
    return newCards;
  },

  // 生成二维码 data URL
  _generateQRCode(cardNo, password) {
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    try {
      const qrcode = new QRCode(tempDiv, {
        text: cardNo,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      const canvas = tempDiv.querySelector('canvas');
      const dataURL = canvas ? canvas.toDataURL('image/png') : null;

      document.body.removeChild(tempDiv);
      return dataURL;
    } catch (error) {
      console.error('QR code generation failed:', error);
      document.body.removeChild(tempDiv);
      return null;
    }
  },

  // Luhn 校验位。传入不含校验位的号码，校验位将附加在最右侧(i=0)，
  // 因此传入号码最右位在最终号中处于 i=1（需翻倍）。
  _luhnCheckDigit(number) {
    let sum = 0;
    for (let i = 0; i < number.length; i++) {
      let digit = parseInt(number[number.length - 1 - i], 10);
      if (i % 2 === 0) { // 最终号中的奇数位（i=1,3,...）翻倍
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return (10 - (sum % 10)) % 10;
  },

  _generateCardNo(prefix) {
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${prefix}${random}`;
  },

  _generatePassword() {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  },

  // 获取礼卡列表（解密）
  getCards(filters = {}) {
    let cards = this._get('gift_cards');

    // 解密卡号和密码
    cards = cards.map(c => ({
      ...c,
      card_no: this._decrypt(c.card_no_encrypted),
      password: this._decrypt(c.password_encrypted)
    }));

    // 过滤
    if (filters.status) cards = cards.filter(c => c.status === filters.status);
    if (filters.bind_status) cards = cards.filter(c => c.bind_status === filters.bind_status);
    if (filters.redeem_status) cards = cards.filter(c => c.redeem_status === filters.redeem_status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      cards = cards.filter(c =>
        c.card_no.toLowerCase().includes(s) ||
        (c.customer_id && this.getCustomer(c.customer_id)?.name?.toLowerCase().includes(s))
      );
    }

    return cards;
  },

  // 更新礼卡状态
  updateCardStatus(id, status) {
    const cards = this._get('gift_cards');
    const index = cards.findIndex(c => c.id === id);
    if (index === -1) throw new Error('礼卡不存在');

    cards[index].status = status;
    this._set('gift_cards', cards);
    return cards[index];
  },

  // 验证礼卡
  verifyCard(cardNo, password) {
    const cards = this._get('gift_cards');
    const card = cards.find(c =>
      this._decrypt(c.card_no_encrypted) === cardNo &&
      this._decrypt(c.password_encrypted) === password
    );

    if (!card) return { valid: false, message: '卡号或密码错误' };
    if (card.status === 'frozen') return { valid: false, message: '礼卡已冻结' };
    if (card.status === 'used') return { valid: false, message: '礼卡已使用' };
    if (card.status === 'expired') return { valid: false, message: '礼卡已过期' };
    if (new Date(card.expire_at) < new Date()) return { valid: false, message: '礼卡已过期' };

    return { valid: true, card: { ...card, card_no: cardNo, password } };
  },

  // 审核核验：比对客户填写的卡号+密码与发出的礼卡，并返回礼卡真实状态
  // 返回 { ok, checks: [...], card, issues: [...] }
  inspectOrderCard(orderId) {
    const orders = this._get('orders') || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return { ok: false, issues: ['订单不存在'], checks: [] };

    const enteredNo = order.card_number || '';
    // 老数据没有单独记录客户填写的密码，视为与发卡一致
    const enteredPwd = order.card_password != null ? order.card_password : null;

    const cards = this._get('gift_cards') || [];
    const card = cards.find(c => this._decrypt(c.card_no_encrypted) === enteredNo);

    const checks = [];
    const issues = [];

    // 1. 卡号是否存在
    if (!card) {
      checks.push({ label: '卡号核验', pass: false, detail: '系统中不存在该卡号' });
      issues.push('卡号错误');
      return { ok: false, checks, issues, card: null, enteredNo, enteredPwd };
    }
    checks.push({ label: '卡号核验', pass: true, detail: '卡号存在且匹配' });

    // 2. 密码是否一致
    const realPwd = this._decrypt(card.password_encrypted);
    if (enteredPwd == null) {
      checks.push({ label: '密码核验', pass: true, detail: '历史订单未单独记录密码，默认一致' });
    } else if (String(enteredPwd) === String(realPwd)) {
      checks.push({ label: '密码核验', pass: true, detail: '密码与发卡一致' });
    } else {
      checks.push({ label: '密码核验', pass: false, detail: '密码与发卡不一致' });
      issues.push('密码错误');
    }

    // 3. 礼卡状态
    const statusTextMap = {
      active:   { pass: true,  text: '正常（未锁定/未冻结）' },
      unlocked: { pass: true,  text: '已解锁' },
      frozen:   { pass: false, text: '已冻结' },
      locked:   { pass: false, text: '已锁定' },
      expired:  { pass: false, text: '已过期' },
      used:     { pass: false, text: '已使用' }
    };
    const st = statusTextMap[card.status] || { pass: false, text: card.status };
    checks.push({ label: '状态核验', pass: st.pass, detail: st.text });
    if (!st.pass) issues.push(st.text);

    // 4. 有效期
    const expired = card.expire_at && new Date(card.expire_at) < new Date();
    if (expired) {
      checks.push({ label: '有效期核验', pass: false, detail: '礼卡已过期（' + new Date(card.expire_at).toLocaleDateString('zh-CN') + '）' });
      if (!issues.includes('已过期')) issues.push('已过期');
    } else {
      checks.push({ label: '有效期核验', pass: true, detail: card.expire_at ? ('有效期至 ' + new Date(card.expire_at).toLocaleDateString('zh-CN')) : '长期有效' });
    }

    return {
      ok: issues.length === 0,
      checks,
      issues,
      enteredNo,
      enteredPwd,
      card: { ...card, card_no: enteredNo, real_password: realPwd, card_no_encrypted: undefined, password_encrypted: undefined }
    };
  },

  // 绑定礼卡到客户
  bindCard(cardNo, password, customerId) {
    const cards = this._get('gift_cards');

    // 如果提供了密码，则验证卡号和密码；否则仅验证卡号
    const index = cards.findIndex(c => {
      const cardMatches = this._decrypt(c.card_no_encrypted) === cardNo;
      if (!password) return cardMatches; // 不验证密码
      return cardMatches && this._decrypt(c.password_encrypted) === password;
    });

    if (index === -1) {
      throw new Error(password ? '卡号或密码错误' : '卡号错误');
    }
    if (cards[index].bind_status === 'bound') throw new Error('礼卡已被绑定');

    cards[index].bind_status = 'bound';
    cards[index].customer_id = customerId;
    cards[index].bound_at = new Date().toISOString();
    // 记录绑定时是否已验证密码；未验证则兑换时需补填密码
    cards[index].password_verified = !!password;

    this._set('gift_cards', cards);
    return cards[index];
  },

  // ── 客户管理 ──────────────────────────────────────────────
  getCustomers(filters = {}) {
    let customers = this._get('customers');
    if (filters.search) {
      const s = filters.search.toLowerCase();
      customers = customers.filter(c =>
        c.name?.toLowerCase().includes(s) ||
        c.phone?.includes(s) ||
        c.wechat_id?.toLowerCase().includes(s)
      );
    }
    return customers;
  },

  getCustomer(id) {
    return this._get('customers').find(c => c.id === id);
  },

  createOrUpdateCustomer(data) {
    const customers = this._get('customers');

    // 通过手机号查找现有客户
    let customer = customers.find(c => c.phone === data.phone);

    if (customer) {
      // 更新
      Object.assign(customer, {
        ...data,
        updated_at: new Date().toISOString()
      });
    } else {
      // 新建
      customer = {
        id: this._nextId(customers),
        ...data,
        created_at: new Date().toISOString()
      };
      customers.push(customer);
    }

    this._set('customers', customers);
    return customer;
  },

  // 按 id 更新客户资料（用于设置页面）
  updateCustomerProfile(id, data) {
    const customers = this._get('customers');
    const customer = customers.find(c => c.id === id);
    if (!customer) {
      return { success: false, message: '用户不存在' };
    }

    // 手机号唯一性校验
    if (data.phone) {
      const dup = customers.find(c => c.phone === data.phone && c.id !== id);
      if (dup) {
        return { success: false, message: '该手机号已被其他账号使用' };
      }
    }

    // 用户名唯一性校验
    if (data.username) {
      const dup = customers.find(c => c.username === data.username && c.id !== id);
      if (dup) {
        return { success: false, message: '该用户名已被占用' };
      }
    }

    Object.assign(customer, {
      ...data,
      updated_at: new Date().toISOString()
    });
    this._set('customers', customers);
    return { success: true, customer };
  },

  // 修改客户密码
  changeCustomerPassword(id, oldPassword, newPassword) {
    const customers = this._get('customers');
    const customer = customers.find(c => c.id === id);
    if (!customer) {
      return { success: false, message: '用户不存在' };
    }
    if (customer.password !== oldPassword) {
      return { success: false, message: '当前密码错误' };
    }
    customer.password = newPassword;
    customer.updated_at = new Date().toISOString();
    this._set('customers', customers);
    return { success: true };
  },

  // 统一登录 / 自动注册
  // credential 可以是 账号(username) / 手机号(phone) / 邮箱(email)
  customerAuth(credential, password) {
    const raw = (credential || '').trim();
    if (!raw) {
      return { success: false, message: '请输入账号、手机号或邮箱' };
    }
    if (!password) {
      return { success: false, message: '请输入密码' };
    }

    const customers = this._get('customers');
    const lower = raw.toLowerCase();

    // 判断凭证类型
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
    const isPhone = /^1\d{10}$/.test(raw);

    // 在三个字段中查找
    const customer = customers.find(c =>
      (c.username && c.username.toLowerCase() === lower) ||
      (c.phone && c.phone === raw) ||
      (c.email && c.email.toLowerCase() === lower)
    );

    if (customer) {
      // 已存在，校验密码
      if (customer.password !== password) {
        return { success: false, message: '密码错误' };
      }
      return { success: true, customer, isNew: false };
    }

    // 不存在，自动注册
    const newCustomer = {
      id: this._nextId(customers),
      username: isEmail || isPhone ? '' : raw,
      phone: isPhone ? raw : '',
      email: isEmail ? raw : '',
      name: '',
      password: password,
      profile_completed: false,
      created_at: new Date().toISOString()
    };
    customers.push(newCustomer);
    this._set('customers', customers);
    return { success: true, customer: newCustomer, isNew: true };
  },

  // ── 订单管理 ──────────────────────────────────────────────
  createOrder(orderData) {
    const orders = this._get('orders');

    // 验证礼卡
    const cards = this._get('gift_cards');
    const card = cards.find(c => this._decrypt(c.card_no_encrypted) === orderData.card_number);
    if (!card) {
      return { success: false, message: '礼卡不存在' };
    }
    if (card.status !== 'active') {
      return { success: false, message: '礼卡状态异常' };
    }
    if (card.redeem_status === 'redeemed') {
      return { success: false, message: '礼卡已被使用' };
    }

    // 验证礼盒
    const giftBox = this.getGiftBox(orderData.gift_box_id);
    if (!giftBox) {
      return { success: false, message: '礼盒不存在' };
    }

    const order = {
      id: this._nextId(orders),
      order_no: `DD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      customer_id: orderData.customer_id,
      card_number: orderData.card_number,
      gift_box_id: orderData.gift_box_id,
      gift_box_name: giftBox.name,
      gift_box_price: giftBox.price,
      category_id: giftBox.category_id, // 产品类别，用于区分发货地
      receiver_name: orderData.receiver_name,
      receiver_phone: orderData.receiver_phone,
      receiver_address: orderData.receiver_address,
      note: orderData.note || '',
      status: 'pending', // pending/approved/rejected/shipped/completed/cancelled
      created_at: new Date().toISOString()
    };

    orders.push(order);
    this._set('orders', orders);

    // 更新礼卡状态
    card.redeem_status = 'redeemed';
    card.redeemed_at = new Date().toISOString();
    this._set('gift_cards', cards);

    return { success: true, order };
  },

  getOrders(filters = {}) {
    let orders = this._get('orders');
    if (filters.status) orders = orders.filter(o => o.status === filters.status);
    if (filters.customer_id) orders = orders.filter(o => o.customer_id === filters.customer_id);
    if (filters.group_id) orders = orders.filter(o => o.group_id === filters.group_id);
    return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getOrderGroups(filters = {}) {
    let groups = this._get('order_groups') || [];
    if (filters.status) groups = groups.filter(g => g.status === filters.status);
    if (filters.customer_id) groups = groups.filter(g => g.customer_id === filters.customer_id);
    return groups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // 计算父订单的聚合状态
  calcGroupStatus(items) {
    if (!items || items.length === 0) return 'pending';
    const statuses = items.map(o => o.status);
    if (statuses.every(s => s === 'completed')) return 'completed';
    if (statuses.every(s => s === 'cancelled' || s === 'rejected')) return 'cancelled';
    if (statuses.every(s => s === 'shipped' || s === 'completed')) return 'shipped';
    if (statuses.every(s => s === 'approved' || s === 'shipped' || s === 'completed')) return 'approved';
    if (statuses.every(s => s === 'pending')) return 'pending';
    return 'partial'; // 混合状态
  },

  updateOrderStatus(id, status, note = '') {
    const orders = this._get('orders');
    const order = orders.find(o => o.id === id);
    if (!order) throw new Error('订单不存在');

    order.status = status;
    order.status_note = note;
    if (note) order.reject_reason = note; // 兼容拒绝原因字段
    order.updated_at = new Date().toISOString();

    // 如果订单完成，标记礼卡为已使用
    if (status === 'completed' && order.card_number) {
      const cards = this._get('gift_cards');
      const card = cards.find(c => this._decrypt(c.card_no_encrypted) === order.card_number);
      if (card) {
        card.status = 'used';
        this._set('gift_cards', cards);
      }
    }

    // 如果订单取消或拒绝，释放礼卡
    if ((status === 'cancelled' || status === 'rejected') && order.card_number) {
      const cards = this._get('gift_cards');
      const card = cards.find(c => this._decrypt(c.card_no_encrypted) === order.card_number);
      if (card) {
        card.redeem_status = 'unredeemed';
        card.redeemed_at = null;
        this._set('gift_cards', cards);
      }
    }

    this._set('orders', orders);
    return order;
  },

  // 客户请求取消订单（待审核状态）
  requestCancelOrder(orderId, customerId) {
    const orders = this._get('orders');
    const order = orders.find(o => o.id === orderId);

    if (!order) return { success: false, message: '订单不存在' };
    if (order.customer_id !== customerId) return { success: false, message: '无权操作此订单' };
    if (order.status !== 'pending') return { success: false, message: '只能取消待审核的订单' };

    order.status = 'cancel_requested';
    order.cancel_requested_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();
    this._set('orders', orders);

    // 注意：此时不释放礼卡，等待商家确认后才释放

    return { success: true, message: '取消请求已提交，等待商家确认' };
  },

  // 商家确认取消订单
  confirmCancelOrder(orderId, confirmed = true, note = '') {
    const orders = this._get('orders');
    const order = orders.find(o => o.id === orderId);

    if (!order) return { success: false, message: '订单不存在' };
    if (order.status !== 'cancel_requested') return { success: false, message: '订单未处于取消请求状态' };

    if (confirmed) {
      // 商家同意取消，释放礼卡
      order.status = 'cancelled';
      order.cancel_confirmed_at = new Date().toISOString();
      order.status_note = note || '客户取消订单';
      order.updated_at = new Date().toISOString();

      // 释放礼卡
      if (order.card_number) {
        const cards = this._get('gift_cards');
        const card = cards.find(c => this._decrypt(c.card_no_encrypted) === order.card_number);
        if (card) {
          card.redeem_status = 'unredeemed';
          card.redeemed_at = null;
          this._set('gift_cards', cards);
        }
      }

      this._set('orders', orders);
      return { success: true, message: '订单已取消，礼卡已释放' };
    } else {
      // 商家拒绝取消，恢复待审核状态
      order.status = 'pending';
      order.cancel_rejected_at = new Date().toISOString();
      order.status_note = note || '商家拒绝取消';
      order.updated_at = new Date().toISOString();
      this._set('orders', orders);
      return { success: true, message: '已拒绝取消请求' };
    }
  },

  // 购物车功能
  getCart(customerId) {
    const cart = this._get('cart') || [];
    return cart.filter(item => item.customer_id === customerId);
  },

  addToCart(customerId, cardId, giftBoxId) {
    const cart = this._get('cart') || [];

    // 验证礼卡
    const cards = this._get('gift_cards');
    const card = cards.find(c => c.id === cardId);
    if (!card) return { success: false, message: '礼卡不存在' };
    if (card.customer_id !== customerId) return { success: false, message: '礼卡不属于当前用户' };
    if (card.status !== 'active') return { success: false, message: '礼卡状态异常' };
    if (card.redeem_status === 'redeemed') return { success: false, message: '礼卡已被使用' };

    // 检查礼卡是否已在购物车
    const existing = cart.find(item => item.card_id === cardId);
    if (existing) return { success: false, message: '此礼卡已在购物车中' };

    // 验证礼盒
    const box = this.getGiftBox(giftBoxId);
    if (!box) return { success: false, message: '礼盒不存在' };

    const item = {
      id: this._nextId(cart),
      customer_id: customerId,
      card_id: cardId,
      card_number: this._decrypt(card.card_no_encrypted),
      gift_box_id: giftBoxId,
      gift_box_name: box.name,
      gift_box_price: box.price,
      category_id: box.category_id,
      created_at: new Date().toISOString()
    };

    cart.push(item);
    this._set('cart', cart);
    return { success: true, item };
  },

  removeFromCart(customerId, itemId) {
    let cart = this._get('cart') || [];
    const item = cart.find(i => i.id === itemId && i.customer_id === customerId);
    if (!item) return { success: false, message: '购物车项不存在' };

    cart = cart.filter(i => i.id !== itemId);
    this._set('cart', cart);
    return { success: true };
  },

  clearCart(customerId) {
    let cart = this._get('cart') || [];
    cart = cart.filter(item => item.customer_id !== customerId);
    this._set('cart', cart);
    return { success: true };
  },

  checkoutCart(customerId, receiverInfo) {
    const cartItems = this.getCart(customerId);
    if (cartItems.length === 0) {
      return { success: false, message: '购物车为空' };
    }

    const orders = this._get('orders');
    const orderGroups = this._get('order_groups') || [];

    // 创建订单组
    const group = {
      id: this._nextId(orderGroups),
      group_no: `DD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      customer_id: customerId,
      status: 'pending',
      total_items: cartItems.length,
      created_at: new Date().toISOString()
    };
    orderGroups.push(group);
    this._set('order_groups', orderGroups);

    // 创建订单
    const createdOrders = [];
    const cards = this._get('gift_cards');

    for (const item of cartItems) {
      const order = {
        id: this._nextId(orders),
        order_no: `DD${Date.now()}${Math.floor(Math.random() * 1000)}`,
        group_id: group.id,
        customer_id: customerId,
        card_number: item.card_number,
        gift_box_id: item.gift_box_id,
        gift_box_name: item.gift_box_name,
        gift_box_price: item.gift_box_price,
        category_id: item.category_id,
        receiver_name: receiverInfo.receiver_name,
        receiver_phone: receiverInfo.receiver_phone,
        receiver_address: receiverInfo.receiver_address,
        note: receiverInfo.note || '',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      orders.push(order);
      createdOrders.push(order);

      // 更新礼卡状态
      const card = cards.find(c => this._decrypt(c.card_no_encrypted) === item.card_number);
      if (card) {
        card.redeem_status = 'redeemed';
        card.redeemed_at = new Date().toISOString();
      }
    }

    this._set('orders', orders);
    this._set('gift_cards', cards);

    // 清空购物车
    this.clearCart(customerId);

    return { success: true, group, orders: createdOrders };
  },

  // ── 物流管理 ──────────────────────────────────────────────
  createLogistics(data) {
    const logistics = this._get('logistics');
    const log = {
      id: this._nextId(logistics),
      order_no: data.order_no || `DDWL${Date.now()}${Math.floor(Math.random() * 1000)}`,
      ...data,
      status: 'preparing', // preparing/shipped/in_transit/delivered/signed
      created_at: new Date().toISOString()
    };

    logistics.push(log);
    this._set('logistics', logistics);

    // 更新订单状态
    if (data.order_id) {
      this.updateOrderStatus(data.order_id, 'shipped');
    }

    return log;
  },

  getLogistics(order_id = null) {
    const logistics = this._get('logistics');
    if (order_id) {
      // 返回数组，支持多个物流；合并发货时匹配 order_ids 数组
      return logistics.filter(l =>
        l.order_id === order_id ||
        (Array.isArray(l.order_ids) && l.order_ids.includes(order_id))
      );
    }
    return logistics;
  },

  updateLogisticsStatus(id, status) {
    const logistics = this._get('logistics');
    const log = logistics.find(l => l.id === id);
    if (!log) throw new Error('物流信息不存在');

    log.status = status;
    log.updated_at = new Date().toISOString();

    // 记录状态变更时间
    if (status === 'shipped') log.shipped_at = new Date().toISOString();
    if (status === 'delivered') log.delivered_at = new Date().toISOString();
    if (status === 'signed') log.signed_at = new Date().toISOString();

    if (status === 'signed') {
      // 检查该订单的所有物流是否都已签收
      const orderLogistics = logistics.filter(l => l.order_id === log.order_id);
      const allSigned = orderLogistics.every(l => l.status === 'signed' || l.id === id);

      if (allSigned) {
        // 所有物流都签收了，更新订单状态为完成
        this.updateOrderStatus(log.order_id, 'completed');

        // 更新礼卡状态为已使用
        const orders = this._get('orders');
        const order = orders.find(o => o.id === log.order_id);
        if (order && order.card_number) {
          const cards = this._get('gift_cards');
          const card = cards.find(c => this._decrypt(c.card_no_encrypted) === order.card_number);
          if (card) {
            card.status = 'used';
            card.used_at = new Date().toISOString();
            this._set('gift_cards', cards);
          }
        }
      }
    }

    this._set('logistics', logistics);
    return { success: true, logistics: log };
  },

  // ── 产品管理 ──────────────────────────────────────────────
  getProducts(filters = {}) {
    let products = this._get('products');
    if (filters.supplier_id) {
      products = products.filter(p => p.supplier_id === filters.supplier_id);
    }
    if (filters.category_id) {
      products = products.filter(p => p.category_id === filters.category_id);
    }
    if (filters.status) {
      products = products.filter(p => p.status === filters.status);
    }
    return products;
  },

  getProduct(id) {
    return this._get('products').find(p => p.id === id);
  },

  createProduct(data) {
    const products = this._get('products');
    const newProduct = {
      id: this._nextId(products),
      category_id: data.category_id,
      supplier_id: data.supplier_id,
      name: data.name,
      description: data.description || '',
      features: data.features || [],
      intro_images: data.intro_images || [],
      status: 'active',
      created_at: new Date().toISOString()
    };
    products.push(newProduct);
    this._set('products', products);
    return newProduct;
  },

  updateProduct(id, data) {
    const products = this._get('products');
    const product = products.find(p => p.id === id);
    if (!product) return null;

    Object.assign(product, {
      category_id: data.category_id !== undefined ? data.category_id : product.category_id,
      supplier_id: data.supplier_id !== undefined ? data.supplier_id : product.supplier_id,
      name: data.name !== undefined ? data.name : product.name,
      description: data.description !== undefined ? data.description : product.description,
      features: data.features !== undefined ? data.features : product.features,
      intro_images: data.intro_images !== undefined ? data.intro_images : product.intro_images,
      status: data.status !== undefined ? data.status : product.status,
      updated_at: new Date().toISOString()
    });

    this._set('products', products);
    return product;
  },

  deleteProduct(id) {
    const products = this._get('products');
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    this._set('products', products);
    return true;
  },

  getGiftBoxes(filters = {}) {
    let boxes = this._get('gift_boxes').filter(b => b.status === 'active');
    if (filters.product_id) {
      boxes = boxes.filter(b => b.product_id === filters.product_id);
    }
    return boxes;
  },

  getGiftBox(id) {
    return this._get('gift_boxes').find(b => b.id === id);
  },

  // ── 用户认证 ──────────────────────────────────────────────
  login(username, password, role) {
    const users = this._get('users');
    const user = users.find(u =>
      u.username === username &&
      u.password === password &&
      u.role === role &&
      u.status === 'active'
    );

    if (!user) return null;

    // 记录登录会话
    localStorage.setItem('_current_user', JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    }));

    return user;
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('_current_user'));
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('_current_user');
  },

  // ── 客户地址管理 ──────────────────────────────────────────────
  getCustomerAddresses(customerId) {
    const addresses = this._get('customer_addresses');
    return addresses.filter(addr => addr.customer_id === customerId);
  },

  getCustomerDefaultAddress(customerId) {
    const addresses = this._get('customer_addresses');
    return addresses.find(addr => addr.customer_id === customerId && addr.is_default);
  },

  addCustomerAddress(data) {
    const addresses = this._get('customer_addresses');
    const newAddress = {
      id: this._nextId(addresses),
      customer_id: data.customer_id,
      receiver_name: data.receiver_name,
      receiver_phone: data.receiver_phone,
      receiver_address: data.receiver_address,
      is_default: data.is_default || false,
      created_at: new Date().toISOString()
    };

    // 如果设置为默认地址，取消该客户其他地址的默认状态
    if (newAddress.is_default) {
      addresses.forEach(addr => {
        if (addr.customer_id === data.customer_id) {
          addr.is_default = false;
        }
      });
    }

    addresses.push(newAddress);
    this._set('customer_addresses', addresses);
    return newAddress;
  },

  updateCustomerAddress(id, data) {
    const addresses = this._get('customer_addresses');
    const address = addresses.find(a => a.id === id);
    if (!address) return null;

    // 如果设置为默认地址，取消该客户其他地址的默认状态
    if (data.is_default) {
      addresses.forEach(addr => {
        if (addr.customer_id === address.customer_id && addr.id !== id) {
          addr.is_default = false;
        }
      });
    }

    Object.assign(address, data);
    this._set('customer_addresses', addresses);
    return address;
  },

  deleteCustomerAddress(id) {
    const addresses = this._get('customer_addresses');
    const index = addresses.findIndex(a => a.id === id);
    if (index === -1) return false;

    // 不允许删除默认地址
    if (addresses[index].is_default) {
      throw new Error('不能删除默认地址，请先设置其他地址为默认');
    }

    addresses.splice(index, 1);
    this._set('customer_addresses', addresses);
    return true;
  },

  // ── 物流公司管理 ──────────────────────────────────────────────
  getLogisticsCompanies(filters = {}) {
    let companies = this._get('logistics_companies');
    if (filters.search) {
      const s = filters.search.toLowerCase();
      companies = companies.filter(c =>
        c.name?.toLowerCase().includes(s) ||
        c.contact?.includes(s) ||
        c.address?.toLowerCase().includes(s)
      );
    }
    if (filters.status) {
      companies = companies.filter(c => c.status === filters.status);
    }
    return companies;
  },

  getLogisticsCompany(id) {
    return this._get('logistics_companies').find(c => c.id === id);
  },

  createLogisticsCompany(data) {
    const companies = this._get('logistics_companies');
    const newCompany = {
      id: this._nextId(companies),
      name: data.name,
      contact: data.contact || '',
      address: data.address || '',
      status: 'active',
      created_at: new Date().toISOString()
    };
    companies.push(newCompany);
    this._set('logistics_companies', companies);
    return newCompany;
  },

  updateLogisticsCompany(id, data) {
    const companies = this._get('logistics_companies');
    const company = companies.find(c => c.id === id);
    if (!company) return null;

    Object.assign(company, {
      name: data.name !== undefined ? data.name : company.name,
      contact: data.contact !== undefined ? data.contact : company.contact,
      address: data.address !== undefined ? data.address : company.address,
      status: data.status !== undefined ? data.status : company.status,
      updated_at: new Date().toISOString()
    });

    this._set('logistics_companies', companies);
    return company;
  },

  deleteLogisticsCompany(id) {
    const companies = this._get('logistics_companies');
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return false;
    companies.splice(index, 1);
    this._set('logistics_companies', companies);
    return true;
  },

  // ── 供应商管理 ──────────────────────────────────────────────
  getSuppliers(filters = {}) {
    let suppliers = this._get('suppliers');
    if (filters.search) {
      const s = filters.search.toLowerCase();
      suppliers = suppliers.filter(sp =>
        sp.name?.toLowerCase().includes(s) ||
        sp.contact_person?.toLowerCase().includes(s) ||
        sp.phone?.includes(s) ||
        sp.email?.toLowerCase().includes(s)
      );
    }
    if (filters.category_id) {
      suppliers = suppliers.filter(sp => sp.category_id === filters.category_id);
    }
    if (filters.status) {
      suppliers = suppliers.filter(sp => sp.status === filters.status);
    }
    return suppliers;
  },

  getSupplier(id) {
    return this._get('suppliers').find(sp => sp.id === id);
  },

  createSupplier(data) {
    const suppliers = this._get('suppliers');
    const newSupplier = {
      id: this._nextId(suppliers),
      name: data.name,
      category_id: data.category_id || null,
      contact_person: data.contact_person || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      status: 'active',
      created_at: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    this._set('suppliers', suppliers);
    return newSupplier;
  },

  updateSupplier(id, data) {
    const suppliers = this._get('suppliers');
    const supplier = suppliers.find(sp => sp.id === id);
    if (!supplier) return null;

    Object.assign(supplier, {
      name: data.name !== undefined ? data.name : supplier.name,
      category_id: data.category_id !== undefined ? data.category_id : supplier.category_id,
      contact_person: data.contact_person !== undefined ? data.contact_person : supplier.contact_person,
      phone: data.phone !== undefined ? data.phone : supplier.phone,
      email: data.email !== undefined ? data.email : supplier.email,
      address: data.address !== undefined ? data.address : supplier.address,
      status: data.status !== undefined ? data.status : supplier.status,
      updated_at: new Date().toISOString()
    });

    this._set('suppliers', suppliers);
    return supplier;
  },

  deleteSupplier(id) {
    const suppliers = this._get('suppliers');
    const index = suppliers.findIndex(sp => sp.id === id);
    if (index === -1) return false;
    suppliers.splice(index, 1);
    this._set('suppliers', suppliers);
    return true;
  },

  // ── 礼卡类型管理 ──────────────────────────────────────────────
  getCardTypes(filters = {}) {
    let types = this._get('card_types');
    if (filters.search) {
      const s = filters.search.toLowerCase();
      types = types.filter(t =>
        t.name?.toLowerCase().includes(s) ||
        t.amount?.toString().includes(s)
      );
    }
    return types;
  },

  getCardType(id) {
    return this._get('card_types').find(t => t.id === id);
  },

  createCardType(data) {
    const types = this._get('card_types');
    const newType = {
      id: this._nextId(types),
      name: data.name,
      amount: data.amount,
      prefix: data.prefix || `LK${data.amount}`,
      validity_days: data.validity_days || 1825,
      color: data.color || '#C4612F',
      created_at: new Date().toISOString()
    };
    types.push(newType);
    this._set('card_types', types);
    return newType;
  },

  updateCardType(id, data) {
    const types = this._get('card_types');
    const type = types.find(t => t.id === id);
    if (!type) return null;

    Object.assign(type, {
      name: data.name !== undefined ? data.name : type.name,
      amount: data.amount !== undefined ? data.amount : type.amount,
      prefix: data.prefix !== undefined ? data.prefix : type.prefix,
      validity_days: data.validity_days !== undefined ? data.validity_days : type.validity_days,
      color: data.color !== undefined ? data.color : type.color,
      updated_at: new Date().toISOString()
    });

    this._set('card_types', types);
    return type;
  },

  deleteCardType(id) {
    const types = this._get('card_types');
    const index = types.findIndex(t => t.id === id);
    if (index === -1) return false;
    types.splice(index, 1);
    this._set('card_types', types);
    return true;
  },

  // ── 角色权限管理 ──────────────────────────────────────────────
  getRoles() {
    return this._get('roles');
  },

  getRole(roleKey) {
    const roles = this._get('roles');
    return roles.find(r => r.role_key === roleKey);
  },

  getRoleById(id) {
    const roles = this._get('roles');
    return roles.find(r => r.id === id);
  },

  updateRolePermissions(roleId, permissions) {
    const roles = this._get('roles');
    const role = roles.find(r => r.id === roleId);
    if (!role) return false;

    role.permissions = permissions;
    this._set('roles', roles);
    return true;
  },

  hasPermission(roleKey, permissionKey) {
    const role = this.getRole(roleKey);
    if (!role) return false;
    return role.permissions.includes(permissionKey);
  },

  // ── 权限管理 ──────────────────────────────────────────────
  getPermissions() {
    return this._get('permissions');
  },

  getPermissionById(id) {
    const permissions = this._get('permissions');
    return permissions.find(p => p.id === id);
  },

  addPermission(data) {
    const permissions = this._get('permissions');
    const newPermission = {
      id: this._nextId(permissions),
      permission_key: data.permission_key,
      name: data.name,
      backend: data.backend,
      page: data.page,
      group: data.group || '',
      sort_order: data.sort_order || 0,
      description: data.description || '',
      created_at: new Date().toISOString()
    };
    permissions.push(newPermission);
    this._set('permissions', permissions);
    return newPermission;
  },

  updatePermission(id, data) {
    const permissions = this._get('permissions');
    const permission = permissions.find(p => p.id === id);
    if (!permission) return null;

    const oldKey = permission.permission_key;
    Object.assign(permission, {
      permission_key: data.permission_key !== undefined ? data.permission_key : permission.permission_key,
      name: data.name !== undefined ? data.name : permission.name,
      backend: data.backend !== undefined ? data.backend : permission.backend,
      page: data.page !== undefined ? data.page : permission.page,
      group: data.group !== undefined ? data.group : permission.group,
      sort_order: data.sort_order !== undefined ? data.sort_order : permission.sort_order,
      description: data.description !== undefined ? data.description : permission.description,
      updated_at: new Date().toISOString()
    });

    this._set('permissions', permissions);

    // 如果权限标识改变了，更新所有角色中的引用
    if (oldKey !== permission.permission_key) {
      const roles = this._get('roles');
      roles.forEach(role => {
        const index = role.permissions.indexOf(oldKey);
        if (index !== -1) {
          role.permissions[index] = permission.permission_key;
        }
      });
      this._set('roles', roles);
    }

    return permission;
  },

  deletePermission(id) {
    const permissions = this._get('permissions');
    const permission = permissions.find(p => p.id === id);
    if (!permission) return false;

    // 从所有角色中移除该权限
    const roles = this._get('roles');
    roles.forEach(role => {
      role.permissions = role.permissions.filter(p => p !== permission.permission_key);
    });
    this._set('roles', roles);

    // 删除权限
    const index = permissions.findIndex(p => p.id === id);
    permissions.splice(index, 1);
    this._set('permissions', permissions);
    return true;
  },

  // ── 数据导出 ──────────────────────────────────────────────
  exportToExcel(tableName) {
    // 返回CSV格式数据，可以被Excel打开
    const data = this._get(tableName);
    if (!data.length) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(v =>
        typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
      ).join(',')
    );

    return headers + '\n' + rows.join('\n');
  },

  // ── 重置数据库 ──────────────────────────────────────────────
  reset() {
    localStorage.clear();
    this.init();
    console.log('数据库已重置');
  }
};

// 页面加载时初始化
DB.init();
