# CVFi Lite — firmware releases

Flashable OpenWrt images for **CVFi Lite**, the low-memory edition of the CVFi PisoWiFi
system. It brings the same captive portal and admin console to small routers (64 MB RAM
and up).

Images are attached to the [Releases](../../releases) page. Each release lists a
`SHA256SUMS.txt`; verify your download before flashing.

## Supported devices

| Device | Image | Notes |
|---|---|---|
| ASUS RT-AX52 | `CVFi-Lite-asus-rt-ax52-<openwrt>-<version>.bin` | |
| Comfast CF-EW71 v2 | `CVFi-Lite-comfast-cf-ew71-v2-<openwrt>-<version>.bin` | 64 MB RAM board |
| PC / x86-64 | `CVFi-Lite-x86-64-<openwrt>-<version>.img.gz` (BIOS) / `-efi.img.gz` (UEFI) | write to disk; not offered as an in-place update |

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
