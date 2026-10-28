# Changelog

## 0.1.7-lite

- Built-in Wi-Fi on VLANs: each Wi-Fi network can join the hotspot LAN or any
  hotspot VLAN, so the router's own Wi-Fi can serve a remote-AP VLAN area too.
- Wi-Fi now comes up on its own after a fresh flash on OpenWrt 24.10 devices.
- VLAN customers reach the portal reliably.
- Bug fixes and stability improvements.

## 0.1.6-lite

- New Interface Settings page:
  - ISP Setup with Dual ISP: use a second internet connection as a failover backup or
    to load balance between both.
  - Choose a role for each port.
  - Private LAN bridges: group ports into separate private networks.
  - Network changes that cut off access to the admin page are undone automatically.
- On low-memory routers the second-ISP check runs less often, and up to 2 private
  LANs are allowed.

## 0.1.5-lite

- Router Pro: reach the router's console and portal from anywhere with a public
  link (boards with 256 MB of RAM or more).

## 0.1.4-lite

- Shared database: run several routers on one shared database, so customers, their
  remaining time, vouchers and sales follow them from router to router.
- Auto-pause now tells correctly when a customer has left the network, for Wi-Fi
  clients and for clients on an extra access point or a cable.
- Lower memory use over long uptimes.

## 0.1.3-lite

- Pro routers: recover a forgotten admin password with a one-time code from the
  operator dashboard.
- Pro operators can reword the portal's buttons and messages.
- Uploaded logo and coin sound now show up.

## 0.1.2-lite

- With auto-pause on, customers keep their remaining time through a power outage.

## 0.1.1-lite

- Remote access point VLANs.
- Debug log download fixed; admin pages laid out for phones.
- Security hardening.

## 0.1.0-lite

- First release of CVFi Lite: captive portal, coin node support, vouchers, coin rates,
  sales reports, Telegram alerts and firmware updates for low-memory routers.
- Images for the full CVFi router lineup, plus PC (x86-64), Raspberry Pi and Orange Pi.
