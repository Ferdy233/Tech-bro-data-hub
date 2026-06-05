/** Convert mongodb+srv URI to direct URI when SRV DNS lookup fails (common on Windows). */
export function resolveMongoUri(uri: string): string {
  if (!uri.startsWith('mongodb+srv://')) return uri

  const withoutProtocol = uri.slice('mongodb+srv://'.length)
  const at = withoutProtocol.indexOf('@')
  if (at === -1) return uri

  const credentials = withoutProtocol.slice(0, at)
  const rest = withoutProtocol.slice(at + 1)
  const slash = rest.indexOf('/')
  const host = slash === -1 ? rest : rest.slice(0, slash)
  const path = slash === -1 ? '' : rest.slice(slash)

  const parts = host.split('.')
  if (parts.length < 3) return uri

  const clusterName = parts[0]
  const suffix = parts.slice(1).join('.')
  const hosts = [0, 1, 2]
    .map((i) => `${clusterName}-shard-00-0${i}.${suffix}:27017`)
    .join(',')

  const dbPath = path || '/'
  const joiner = dbPath.includes('?') ? '&' : '?'
  return `mongodb://${credentials}@${hosts}${dbPath}${joiner}ssl=true&authSource=admin`
}
