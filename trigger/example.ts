import { logger, task } from '@trigger.dev/sdk/v3'

export const exampleTask = task({
  id: 'example-task',
  run: async (payload: { userId: string }) => {
    logger.info('example task fired', { userId: payload.userId })
    return { ok: true, userId: payload.userId }
  },
})
