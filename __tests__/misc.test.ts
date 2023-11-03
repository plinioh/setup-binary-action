import * as misc from '../src/misc'

describe('misc', () => {
  // Never validated running on windows or linux
  it('should test getBinaryDestinationPath', async () => {
    const destPath = misc.getBinaryDestinationPath()
    expect(destPath).toMatch(/\/Users|\/home|C::\/[^/]+\/bin/)
  })
})
