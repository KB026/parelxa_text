const fs = require('fs');
const path = require('path');

const dataTsPath = path.join(__dirname, '..', 'lib', 'data.ts');
let content = fs.readFileSync(dataTsPath, 'utf8');

// 1. Replace "has_india_pricing" to "global_availability"
content = content.replace(/has_india_pricing/g, 'global_availability');

// 2. Replace "inr_price" to "usd_price"
content = content.replace(/inr_price/g, 'usd_price');

// 3. Replace India related words in descriptions and names
// Being somewhat careful to change "Indian businesses" -> "global businesses"
content = content.replace(/India's/g, "The world's");
content = content.replace(/Indian context/g, "global context");
content = content.replace(/Indian businesses/g, "global businesses");
content = content.replace(/Bharat/g, "Global Enterprises");
content = content.replace(/in India/g, "worldwide");
content = content.replace(/for India/g, "globally");
content = content.replace(/Indian dialects/g, "global dialects");
content = content.replace(/Indian languages/g, "multiple languages");
content = content.replace(/Indian/g, "global");

// 4. Price conversion
// We use a regex to find "â‚¹" followed by a number (maybe with commas)
const priceRegex = /â‚¹([0-9,]+)/g;

content = content.replace(priceRegex, (match, p1) => {
  // Removing commas
  const amountStr = p1.replace(/,/g, '');
  const inrAmount = parseInt(amountStr, 10);
  
  if (isNaN(inrAmount)) return match;
  
  // Approximate conversion: 1 USD = ~83 INR, let's round
  let usdAmount = Math.round(inrAmount / 83);
  
  // If it's a very large number, maybe round nicer (e.g. 1000s)
  if (usdAmount > 1000) {
     usdAmount = Math.round(usdAmount / 100) * 100;
  } else if (usdAmount > 100) {
     usdAmount = Math.round(usdAmount / 10) * 10;
  } else if (usdAmount > 50) {
     usdAmount = Math.round(usdAmount / 5) * 5;
  }
  
  if (usdAmount === 0 && inrAmount > 0) usdAmount = 1;
  
  return '$' + usdAmount.toLocaleString('en-US');
});

// Since the seed data arrays still have hardcoded strings like "â‚¹2,999/month", they will be fixed naturally by the Regex.
// Same for the "inr_price": "â‚¹XX" lines which got renamed to "usd_price": "â‚¹XX" then converted to "$XX".

fs.writeFileSync(dataTsPath, content);
console.log('Successfully globalized lib/data.ts');
