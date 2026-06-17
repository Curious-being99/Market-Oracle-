#!/bin/bash
# ==============================================================================
#      SOVEREIGN FABLES SELF-HOSTED EGRESS PROXY (SOCKS5/DANTE) BLUEPRINT
# ==============================================================================
# This script automates the installation and configuration of Dante, an 
# industry-standard, lightweight, open-source SOCKS5 proxy on Ubuntu/Debian.
#
# Use this on any cheap or free-tier cloud instance (AWS t2.micro, GCP e2-micro,
# or Oracle Cloud Free Tier) to get a dedicated permanent static outbound IP.
# ==============================================================================

set -e

# Ensuring script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Please run this script as root (sudo)."
  exit 1
fi

echo "🚀 Initiating Dante SOCKS5 Proxy Server Installation..."

# 1. Update system package index and install Dante-server
apt-get update -y
apt-get install -y dante-server

# 2. Extract primary active network interface
NET_IFACE=$(ip route show default | awk '{print $5}')
if [ -z "$NET_IFACE" ]; then
  NET_IFACE="eth0"
fi

echo "📡 Detected primary network interface: $NET_IFACE"

# 3. Create a highly secure, clean dande configuration (/etc/daded.conf)
# This configuration enables username/password authentication and routes 
# all traffic out of your static network interface.
cat <<EOF > /etc/daded.conf
logoutput: syslog
logoutput: /var/log/danted.log

# Port to bind to (Default SOCKS port is 1080)
internal: 0.0.0.0 port = 1080

# External interface used for outbound traffic
external: $NET_IFACE

# Authentication mechanism (uses system users accounts)
socksmethod: username
clientmethod: none

# Client rules
client pass {
    from: 0.0.0.0/0 to: 0.0.0.0/0
    log: error
}

# Proxy transit rules - require authentication
socks pass {
    from: 0.0.0.0/0 to: 0.0.0.0/0
    command: connect
    log: error
    socksmethod: username
}
EOF

echo "📝 Compiled configuration saved to /etc/daded.conf"

# 4. Generate a dedicated system user for proxy requests
# This isolates your proxy traffic and secures access to your static IP.
PROXY_USER="fable_agent"
PROXY_PASS=$(openssl rand -hex 12)

# Check if user already exists, if not, create it
if id "$PROXY_USER" &>/dev/null; then
    echo "👤 User $PROXY_USER already exists. Resetting credential..."
    echo "$PROXY_USER:$PROXY_PASS" | chpasswd
else
    useradd -r -s /usr/sbin/nologin "$PROXY_USER"
    echo "$PROXY_USER:$PROXY_PASS" | chpasswd
fi

# 5. Enable and restart Dante service
systemctl enable danted
systemctl restart danted

# 6. Retrieve public IP
PUBLIC_IP=$(curl -s https://api.ipify.org || echo "YOUR_VM_PUBLIC_STATIC_IP")

echo "=============================================================================="
echo "⚡ SUCCESS: SOCKS5 egress proxy is live and locked down!"
echo "=============================================================================="
echo "Configured Connection String (Set this in your App environment variables):"
echo ""
echo "  PROXY_URL=socks5://$PROXY_USER:$PROXY_PASS@$PUBLIC_IP:1080"
echo ""
echo "Security Credentials Established:"
echo "  Username: $PROXY_USER"
echo "  Password: $PROXY_PASS"
echo "  Port:     1080 (TCP)"
echo "=============================================================================="
echo "⚠️  REMEMBER: Ensure to open incoming TCP Port 1080 on your cloud provider's"
echo "   firewall (e.g., Security Group, VPC Firewall Rules) to allow access."
echo "=============================================================================="
