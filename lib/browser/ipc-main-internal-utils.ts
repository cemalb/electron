import { ipcMainInternal } from '@electron/internal/browser/ipc-main-internal'
import * as errorUtils from '@electron/internal/common/error-utils'

type IPCHandler = (...args: any[]) => any

const callHandler = async function (handler: IPCHandler, event: ElectronInternal.IpcMainInternalEvent, args: any[], reply: (args: any[]) => void) {
  try {
    const result = await handler(event, ...args)
    reply([null, result])
  } catch (error) {
    reply([errorUtils.serialize(error)])
  }
}

export const handle = function <T extends IPCHandler> (channel: string, handler: T) {
  ipcMainInternal.on(channel, (event, requestId, ...args) => {
    callHandler(handler, event, args, responseArgs => {
      if (requestId) {
        event._replyInternal(`${channel}_RESPONSE_${requestId}`, ...responseArgs)
      } else {
        event.returnValue = responseArgs
      }
    })
  })
}
