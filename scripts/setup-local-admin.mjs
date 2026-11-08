import fs from 'node:fs';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
const encode=value=>{const salt=randomBytes(16);return ['pbkdf2-sha256',100000,salt.toString('hex'),pbkdf2Sync(value,salt,100000,32,'sha256').toString('hex')].join(':')};
const password=randomBytes(12).toString('hex'),code=randomBytes(12).toString('hex');
try{fs.writeFileSync('.dev.vars','ADMIN_EMAIL=admin@gmail.com\nADMIN_PASSWORD_HASH='+encode(password)+'\nADMIN_REGISTRATION_CODE_HASH='+encode(code)+'\n',{flag:'wx'});}catch(error){if(error.code==='EEXIST'){console.error('.dev.vars already exists. Existing settings were preserved.');process.exit(1);}throw error;}
console.log('Local admin email: admin@gmail.com');console.log('Local admin password: '+password);console.log('Local registration code: '+code);console.log('Local configuration only. Keep these values private.');
