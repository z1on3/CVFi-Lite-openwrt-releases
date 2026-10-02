# CVFi Lite — firmware releases

Flashable OpenWrt images for **CVFi Lite**, the low-memory edition of the CVFi PisoWiFi
system. It brings the same captive portal and admin console to small routers (64 MB RAM
and up).

Images are attached to the [Releases](../../releases) page. Each release lists a
`SHA256SUMS.txt`; verify your download before flashing.

## Supported devices

Router images are named `CVFi-Lite-<device>-<openwrt>-<version>.bin`.

| Device | `<device>` | OpenWrt | Notes |
|---|---|---|---|
| ASUS RT-AX52 | `asus-rt-ax52` | 25.12.0, 25.12.5 | |
| ZBT WG3526 (16M) | `zbt-wg3526-16m` | 24.10.3 | |
| Comfast CF-N5 v2 | `comfast-cf-n5-v2` | 24.10.3 | |
| AIRPHO AR-W410 | `airpho-ar-w410` | 24.10.3 | ZBT WG3526 (16M) clone, flashed through Breed |
| Ruijie RG-EW1200G PRO v1.1 | `ruijie-rg-ew1200g-pro-v1.1` | 24.10.3 | |
| Newifi D2 | `newifi-d2` | 24.10.3 | |
| Linksys EA8300 | `linksys-ea8300` | 24.10.3 | ⚠ upgrading this board to 24.10.x can fail to boot or sysupgrade ([openwrt#17979](https://github.com/openwrt/openwrt/issues/17979)); keep a recovery path |
| Linksys WRT1900ACS | `linksys-wrt1900acs` | 24.10.3 | |
| EDUP EP-RT2983 | `edup-ep-rt2983` | 25.12.4 | |
| Mercusys MR70X v1 / MR1800X | `mercusys-mr70x-v1` | 25.12.5 | |
| Ruijie RG-EW3200GX PRO | `ruijie-rg-ew3200gx-pro` | 24.10.5 | |
| Comfast CF-EW72 v2 | `comfast-cf-ew72-v2` | 25.12.5 | |
| Comfast CF-EW71 v2 | `comfast-cf-ew71-v2` | 25.12.5 | 64 MB RAM board |
| ASUS RT-AC68U | `asus-rt-ac68u` | 24.10.5 | ⚠ no Wi-Fi under OpenWrt: wired or with an external AP only. First flash from stock uses this file as a `.trx` |
| TP-Link EAP225 v1 / v3 / v4 | `eap225-v1`, `eap225-v3`, `eap225-v4` | 24.10.3 | ⚠ experimental single-port image (PoE port = WAN, Wi-Fi = hotspot). EAP225 v2 uses the v1 image |
| TP-Link EAP225-Outdoor v1 / v3 | `eap225-outdoor-v1`, `eap225-outdoor-v3` | 24.10.3 | ⚠ experimental single-port image |
| TP-Link EAP225-Wall v2 | `eap225-wall-v2` | 24.10.3 | ⚠ experimental single-port image |

PC and single-board computers use a whole-disk image, `CVFi-Lite-<device>-<openwrt>-<version>.img.gz`.
Write it to a disk or SD card; it is not offered as an in-place update. The first
ethernet port becomes the uplink; extra ports and the onboard Wi-Fi form the hotspot.

| Device | `<device>` | OpenWrt | Notes |
|---|---|---|---|
| PC / x86-64 | `x86-64` | 24.10.3 | BIOS `.img.gz` and UEFI `-efi.img.gz` |
| Raspberry Pi 3 / 4 / 5 | `raspberry-pi-3`, `raspberry-pi-4`, `raspberry-pi-5` | 24.10.3 | |
| Orange Pi One / PC | `orange-pi-one`, `orange-pi-pc` | 24.10.3 | no onboard Wi-Fi: add a USB Ethernet adapter or an AP for the hotspot |
| Orange Pi Zero 3 | `orange-pi-zero-3` | 24.10.3 | |

Whole-disk images are verified against `SHA256SUMS-appliance.txt`.

## Installing

1. Flash the `.bin` for your device from OpenWrt (System → Backup / Flash firmware, or
   `sysupgrade -n <file>` over SSH). Choose **not** to keep settings when coming from
   another firmware.
2. Connect to the router's Wi-Fi or a LAN port and open `http://10.0.0.1/admin/`.
3. The first sign-in creates the admin account.
4. Activate your **Router Pro** license under Settings → License. CVFi Lite sells time
   only on an activated router; until then the portal shows "not activated".

## Updating

Activated routers find new versions under Settings → System Update → Check for updates.
A firmware file can also be uploaded there directly.

## Disclaimer

Flash at your own risk. We're not responsible for any damage to your device.
