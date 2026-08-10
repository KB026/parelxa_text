import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

console.log('Available env key names:');
Object.keys(process.env).sort().forEach(key => {
  console.log('  ', key);
});
