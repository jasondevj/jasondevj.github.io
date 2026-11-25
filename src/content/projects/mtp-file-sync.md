---
name: mtp-file-sync
summary: Syncs changed files between MTP devices, such as Android phones, and a folder on your computer.
repo: https://github.com/jasondevj/mtp-file-sync
language: Java
started: 2014
lastActive: 2014
stars: 3
highlights:
  - title: Only what changed
    text: "Copies new and changed files instead of the whole folder."
  - title: Works with phones
    text: "Syncs from Android phones and other MTP devices that don't mount as drives."
  - title: Tidy destinations
    text: "An optional filter folder keeps the paths on your computer short."
---

Phones and other MTP (Media Transfer Protocol) devices don't show up as normal drives, so keeping a folder on the computer in sync with one is tedious. This small program copies only the files that changed from a directory on the device to a directory on your computer.

## Usage

```bash
./start.bat <destination> <source> [filter]
```

- **destination:** the folder on your computer
- **source:** the folder on the device
- **filter** (optional): an intermediate folder to drop from the destination path

```bash
./start.bat "c:/sync-path" "/Gallery"
./start.bat "c:/sync-path" "/Gallery" "/Gallery"
```

Without a filter, `/Gallery/images` is copied to `c:/sync-path/Gallery/images`. With the filter set to `/Gallery`, it's copied to `c:/sync-path/images`.
