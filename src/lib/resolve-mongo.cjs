const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dns.resolveSrv('_mongodb._tcp.cluster0.ojivzqg.mongodb.net', (err, addrs) => {
  if (err) {
    console.error('SRV lookup failed:', err.message);
    return;
  }
  console.log('MongoDB hosts:');
  addrs.forEach(a => console.log(`  ${a.name}:${a.port}`));
  
  // Also resolve TXT for options
  dns.resolveTxt('cluster0.ojivzqg.mongodb.net', (err2, records) => {
    if (!err2) {
      console.log('TXT records:', records.flat().join(''));
    }
    
    // Build the direct connection string
    const hosts = addrs.map(a => `${a.name}:${a.port}`).join(',');
    console.log('\nDirect connection string:');
    console.log(`mongodb://rugvedpathe1509_db_user:34EDH50W81mlrQJT@${hosts}/getmegig?ssl=true&authSource=admin&replicaSet=atlas-xxxx&retryWrites=true&w=majority`);
  });
});
