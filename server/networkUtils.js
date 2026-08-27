const os = require('os');

/**
 * Get all available local IPv4 network addresses
 * to easily connect other devices on the same Wi-Fi/LAN
 */
function getLocalNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Filter for IPv4 and non-internal (i.e. not 127.0.0.1)
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask,
          mac: iface.mac,
        });
      }
    }
  }

  // If no external IP is found, fallback to localhost
  if (addresses.length === 0) {
    addresses.push({
      interface: 'lo0',
      address: '127.0.0.1',
      netmask: '255.0.0.0',
      mac: '00:00:00:00:00:00',
    });
  }

  return addresses;
}

/**
 * Get primary local LAN IP address
 */
function getPrimaryLocalIP() {
  const list = getLocalNetworkAddresses();
  // Prefer 192.168.x.x or 10.x.x.x or 172.x.x.x
  const lan = list.find(item => 
    item.address.startsWith('192.168.') || 
    item.address.startsWith('10.') || 
    item.address.startsWith('172.')
  );
  return lan ? lan.address : list[0].address;
}

module.exports = {
  getLocalNetworkAddresses,
  getPrimaryLocalIP,
};
