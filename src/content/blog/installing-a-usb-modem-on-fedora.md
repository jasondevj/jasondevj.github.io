---
title: "Installing a USB Modem on Fedora (Mobile Broadband Dongle)"
description: "Getting a 3G USB modem working on Fedora 12 by switching it out of mass-storage mode with usb_modeswitch."
pubDate: 2010-09-30
tags: [linux]
originalUrl: https://web.archive.org/web/20140127041348/http://blog.jasondevj.com:80/2010/09/installing-usb-modem-on-fedora-mobile.html
originalSource: my old blog
syndicate: false
---

The other day I had to set up one of these 3G mobile internet USB modems on a Fedora 12 box. It didn't work out of the box, though in hindsight it should have. So for anyone who's googling around on how to set this up (or whether it can be set up at all), here's the gist. After spending hours on it i found out that, this is actually a bug in Fedora (**[582869](https://bugzilla.redhat.com/show_bug.cgi?id=582869)** ) and there is a work around to make it work.

The modem looks like a mass storage device. If you plug the modem in, dmesg has this to say:

```
usb 1-2: new high speed USB device using ehci_hcd and address 6
usb 1-2: New USB device found, idVendor=12d1, idProduct=1520
usb 1-2: New USB device strings: Mfr=3, Product=2, SerialNumber=0
usb 1-2: Product: HUAWEI Mobile
usb 1-2: Manufacturer: HUAWEI Technology
usb 1-2: configuration #1 chosen from 1 choice
scsi5 : SCSI emulation for USB Mass Storage devices
usb-storage: device found at 6
usb-storage: waiting for device to settle before scanning
usb-storage: device scan complete
scsi 5:0:0:0: CD-ROM            Vodafone CD ROM (Huawei)  2.31 PQ: 0 ANSI: 2
sr1: scsi-1 drive
sr 5:0:0:0: Attached scsi CD-ROM sr1
sr 5:0:0:0: Attached scsi generic sg4 type 5
```

As I said above, these modems look like mass storage devices or some times like a CD-ROM thats why it did not work and it needs to be switched to the actual modem mode. The nifty program usb_modeswitch does exactly that only thing that you need to do is install this programme. you can use yum to do that.

```bash
yum install usb_modeswitch
```

The following are the details about the programme.

```
yum info usb_modeswitch
[sudo] password for harald:
Loaded plugins: presto, refresh-packagekit
Installed Packages
Name       : usb_modeswitch
Arch       : x86_64
Version    : 1.0.5
Release    : 1.fc12
Size       : 87 k
Repo       : installed
From repo  : fedora
Summary    : USB Modeswitch gets 4G cards in operational mode
URL        : http://www.draisberghof.de/usb_modeswitch/
License    : GPLv2+
Description: USB Modeswitch brings up your datacard into operational mode. When
plugged
           : in they identify themselves as cdrom and present some non-Linux
compatible
           : installation files. This tool deactivates this cdrom-devices and
enables
           : the real communication device. It supports most devices built and
           : sold by Huawei, T-Mobile, Vodafone, Option, ZTE, Novatel.
```

Even if your modem is not listed here it tends to work with other modems as well. I tried it with a Alcatel modem it worked ;)
