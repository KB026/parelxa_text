import fs from 'fs';
import path from 'path';
import os from 'os';

const home = os.homedir();
const pathsToCheck = [
  path.join(home, '.config', 'supabase'),
  path.join(home, '.supabase'),
  path.join(home, 'AppData', 'Roaming', 'supabase'),
  path.join(home, 'AppData', 'Local', 'supabase')
];

pathsToCheck.forEach(p => {
  if (fs.existsSync(p)) {
    console.log('Found dir:', p);
    try {
      console.log('  Contents:', fs.readdirSync(p));
    } catch(e) {}
  }
});
