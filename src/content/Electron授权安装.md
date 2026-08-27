---
下面给你一份 完全兼容 Windows 7/8/10/11 + Mac + Linux 的 `getHardwareUUID()` 函数，自动尝试多种方式，任何版本都能拿到唯一 UUID：
---

### 1、代码示例

```js
import os from 'os';
import { execSync } from 'child_process';
import { dialog } from 'electron';

function getHardwareUUID() {
  try {
    let uuid = '';

    switch (os.platform()) {
      case 'win32': {
        try {
          // 方式 1：尝试 wmic（旧版 Windows）
          const stdout = execSync('wmic csproduct get uuid', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
          const lines = stdout.split('\n').filter(Boolean);
          if (lines.length > 1 && lines[1].trim()) {
            uuid = lines[1].trim();
            break;
          }
        } catch (err) {
          // 方式 2：PowerShell (Win11 推荐)
          try {
            const ps = execSync(
              'powershell -Command "(Get-CimInstance Win32_ComputerSystemProduct).UUID"',
              { stdio: ['pipe', 'pipe', 'ignore'] }
            ).toString().trim();
            if (ps) uuid = ps;
          } catch {}
        }
        break;
      }

      case 'darwin': {
        // Mac
        const stdout = execSync(
          'ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID',
          { stdio: ['pipe', 'pipe', 'ignore'] }
        ).toString();
        uuid = stdout.split('"')[3];
        break;
      }

      case 'linux': {
        // Linux
        try {
          uuid = execSync('cat /sys/class/dmi/id/product_uuid', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
        } catch {
          uuid = execSync('dmidecode -s system-uuid', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
        }
        break;
      }

      default:
        uuid = '';
    }

    if (!uuid) throw new Error('UUID 获取失败');
    return uuid.toUpperCase();
  } catch (e) {
    console.error('获取UUID失败:', e);
    dialog.showErrorBox('获取UUID失败', `${e.message}\n请联系管理员。`);
    return null;
  }
}

export default getHardwareUUID;

```

