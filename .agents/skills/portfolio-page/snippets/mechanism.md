# A mechanism the visitor drives: the spec and the accessible pattern

Write this spec before building a hook. If a line is empty, the mechanism is not ready.

| Line | Answer |
|---|---|
| Fact it reveals | (also on the page as text before any input) |
| Pointer | click / drag; capture the pointer only after 5px of movement so clicks still work; suppress the click after a drag |
| Touch | `touch-action: pan-y` on horizontal controls so the page still scrolls; a tap does the same as a click |
| Keyboard | arrow keys or Tab + Enter; keyboard changes are instant (no travel) |
| Interrupt | a second input mid-motion reverses from the current position and velocity (spring, not keyframes) |
| Ends | rubber band at the ends (friction), never a hard stop |
| Reduced motion | the end state of each input, instantly; loops off |
| Delete test | remove the mechanism: every fact still readable |
| Still capture | what a screenshot of the resting state shows (reviewers judge captures first; the material or idea must read without motion) |
| Proof it is real | an independent check (a decoder reads the generated code; the computed light matches an ephemeris; a test passes on both apps) |

## Accessible selector (pick one of N)

```tsx
<fieldset className="sel">
  <legend className="sr-only">Choose an app</legend>
  {apps.map((app, i) => (
    <label key={app.id} className="sel-option">
      <input type="radio" name="app" value={app.id} checked={i === index}
             onChange={() => setIndex(i)} className="sr-only" />
      <span>{app.name}</span>
    </label>
  ))}
</fieldset>
```

A radio group gives arrow-key selection, a single Tab stop and the right announcement for free. Drag is an extra input on top of it, never the only one.

## Generated artefacts

If the hook produces an artefact (a code, a print, a receipt), it is the hook, not the work. The work share on the first screen still comes from real product screens.
