// somewhere in your client form submit
import { newId } from '@/utils/ids';
import log, { setActionId } from '@/utils/logs';

async function onSubmit(data: any) {
    const actionId = newId();
    setActionId(actionId);                 // make FE errors include this actionId
    log.warn('register.start', { actionId });

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-action-id': actionId },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        log.error('register.failed', { actionId, status: res.status });
    }
}
