// 在浏览器控制台运行这段代码来检查数据
console.log('=== 检查客户数据 ===');
const customers = JSON.parse(localStorage.getItem('customers') || '[]');
console.log('客户数量:', customers.length);
console.log('客户数据:', customers);

console.log('\n=== 检查初始化状态 ===');
console.log('已初始化:', localStorage.getItem('_db_initialized'));

console.log('\n=== 重新初始化数据库 ===');
localStorage.removeItem('_db_initialized');
DB.init();
const newCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
console.log('重新初始化后的客户数量:', newCustomers.length);
console.log('重新初始化后的客户数据:', newCustomers);
