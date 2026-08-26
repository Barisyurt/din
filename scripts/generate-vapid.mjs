// Tek seferlik VAPID key üretici script
// Kullanım: node scripts/generate-vapid.mjs
// Çıktıyı .env.local dosyanıza kopyalayın

import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("\n✅ VAPID Anahtarları Başarıyla Üretildi!\n");
console.log("Aşağıdaki değerleri .env.local dosyanıza ekleyin:\n");
console.log("─".repeat(60));
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your@email.com`);
console.log("─".repeat(60));
console.log("\n⚠️  VAPID_PRIVATE_KEY değerini asla paylaşmayın veya commit etmeyin!\n");
