/**
 * Auto-detect the type of a search query
 */
export function detectInputType(query) {
  const q = query.trim()

  // IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(q)) return 'ip'

  // Email
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(q)) return 'email'

  // URL (with protocol)
  if (/^https?:\/\/.+/.test(q)) return 'url'

  // Phone number
  if (/^\+?[\d\s\-().]{7,15}$/.test(q)) return 'phone'

  // Domain (no protocol)
  if (/^[a-zA-Z0-9][a-zA-Z0-9\-.]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(q)) return 'domain'

  return 'unknown'
}

export const TYPE_LABELS = {
  url: 'URL',
  ip: 'IP Address',
  email: 'Email',
  domain: 'Domain',
  phone: 'Phone',
  unknown: 'Unknown',
}

export const TYPE_ICONS = {
  url: '🔗',
  ip: '🌐',
  email: '📧',
  domain: '🏠',
  phone: '📱',
  unknown: '🔍',
}

export const TYPE_COLORS = {
  url:    'text-cyan-400',
  ip:     'text-blue-400',
  email:  'text-purple-400',
  domain: 'text-green-400',
  phone:  'text-yellow-400',
  unknown:'text-gray-400',
}
