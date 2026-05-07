const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'

// XML tag-ийн утгыг namespace-г үл харгалзан авна
function getTag(xml, tag) {
  const re = new RegExp(`<(?:[^:>]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[^:>]+:)?${tag}>`)
  const m = xml.match(re)
  return m ? m[1].trim() : null
}

// XML injection-оос хамгаалж тусгай тэмдэгтүүдийг escape хийнэ
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// SOAP XML хүсэлт /ws endpoint рүү илгээнэ
async function soapPost(body) {
  const res = await fetch(`${GATEWAY}/ws`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    body,
  })
  return res.text()
}

// Шинэ хэрэглэгч бүртгэх
export async function register(username, password, email) {
  const xml = await soapPost(`<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:auth="http://example.com/auth">
  <soapenv:Body>
    <auth:registerRequest>
      <auth:username>${escapeXml(username)}</auth:username>
      <auth:password>${escapeXml(password)}</auth:password>
      <auth:email>${escapeXml(email)}</auth:email>
    </auth:registerRequest>
  </soapenv:Body>
</soapenv:Envelope>`)

  return {
    success: getTag(xml, 'success') === 'true',
    message: getTag(xml, 'message'),
    userId: getTag(xml, 'userId'),
  }
}

// Хэрэглэгч нэвтрэх — амжилттай бол token буцаана
export async function login(username, password) {
  const xml = await soapPost(`<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:auth="http://example.com/auth">
  <soapenv:Body>
    <auth:loginRequest>
      <auth:username>${escapeXml(username)}</auth:username>
      <auth:password>${escapeXml(password)}</auth:password>
    </auth:loginRequest>
  </soapenv:Body>
</soapenv:Envelope>`)

  return {
    success: getTag(xml, 'success') === 'true',
    message: getTag(xml, 'message'),
    token: getTag(xml, 'token'),
    userId: getTag(xml, 'userId'),
  }
}
