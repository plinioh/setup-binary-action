import * as path from 'path'
import os from 'os'

export function getBinaryDestinationPath(): string {
  const baseLocationMap = new Map<string, string>([
    ['win32', process.env.USERPROFILE ?? 'C:\\'],
    ['darwin', '/Users'],
    ['linux', '/home'],
    ['aix', '/home'],
    ['freebsd', '/home'],
    ['openbsd', '/home'],
    ['sunos', '/home']
  ])
  /* istanbul ignore next */
  const baseLocation: string = baseLocationMap.get(process.platform) ?? ''

  return path.join(baseLocation, os.userInfo().username, 'bin')
}
