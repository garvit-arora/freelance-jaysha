import { cloud } from './cloud'
export async function submitHelpdesk(kind: 'complaint' | 'request' | 'date-booking', values: Record<string,string>) {
  if (!cloud) throw new Error('Unable to connect')
  const key = `helpdesk-pending-${kind}`
  const serialized = JSON.stringify(values)
  let pending: { id:string; receipt:string; values:string } | null = null
  try { pending = JSON.parse(sessionStorage.getItem(key) || 'null') } catch { /* Storage is optional. */ }
  if (!pending || pending.values !== serialized) pending = {id:crypto.randomUUID(),receipt:crypto.randomUUID()+crypto.randomUUID(),values:serialized}
  try { sessionStorage.setItem(key,JSON.stringify(pending)) } catch { /* Keep submissions usable without storage. */ }
  const {data,error} = await cloud.functions.invoke('helpdesk-submit',{body:{kind,id:pending.id,receipt:pending.receipt,values}})
  if (error || !data?.id) throw new Error('Could not save the form')
  try { sessionStorage.removeItem(key) } catch { /* Storage is optional. */ }
  return {id:data.id as string,receipt:pending.receipt}
}
