// Scene builders for code files and AI agent chats, played in player/code-c.html.

/** types `code` into a file editor; `caption` is shown while typing, `after` (optional) once it is done */
export function codeScene({ file, code, caption, after, prefix = '', charMs, lineMs, hold = 3000 }) {
  return {
    kind: 'browser',
    async run({ page, cue, sleep, player, start }) {
      await page.goto(player('code-c.html'))
      await page.waitForTimeout(800)
      await page.evaluate(([f, p]) => { window.setFile(f); window.setCode(p) }, [file, prefix])
      start()
      if (caption) cue(caption)
      await sleep(600)
      await page.evaluate(([c, o]) => window.typeCode(c, o), [code, { prefix, charMs, lineMs }])
      if (after) cue(after)
      await sleep(hold)
    },
  }
}

/** shows an AI agent chat: the prompt is typed, the agent answers line by line */
export function chatScene({ title = 'AI coding agent', prompt, agent = [], caption, after, hold = 3500 }) {
  return {
    kind: 'browser',
    async run({ page, cue, sleep, player, start }) {
      await page.goto(player('code-c.html'))
      await page.waitForTimeout(800)
      start()
      if (caption) cue(caption)
      await page.evaluate(([t, p, a]) => window.showChat(t, p, a), [title, prompt, agent])
      if (after) cue(after)
      await sleep(hold)
    },
  }
}
