// Returns the 1-based line numbers that start a new command and therefore get a prompt.
// Continuation lines (after a trailing \ or `), heredoc bodies (<<EOF ... EOF), and
// PowerShell here-strings (@' ... '@) don't.
export function promptLines(code: string, lang: string): Set<number> {
  const result = new Set<number>()
  let heredocEnd: string | null = null
  let continued = false
  code.split('\n').forEach((line, index) => {
    const n = index + 1
    if (heredocEnd !== null) {
      if (line.trim() === heredocEnd || line.trimStart().startsWith(heredocEnd)) heredocEnd = null
      return
    }
    if (!continued && line.trim() !== '' && !line.trimStart().startsWith('#')) result.add(n)
    const heredoc = lang === 'powershell' ? line.match(/@(['"])\s*$/) : line.match(/<<-?\s*['"]?(\w+)['"]?/)
    if (heredoc) heredocEnd = lang === 'powershell' ? `${heredoc[1]}@` : heredoc[1]
    continued = lang === 'powershell' ? /`\s*$/.test(line) : /\\\s*$/.test(line)
  })
  return result
}
