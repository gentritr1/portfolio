import { useState } from 'react'

const passages = [
  'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice, “without pictures or conversations?”',
  'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
]

export function ReadingArtboard() {
  const [page, setPage] = useState(0)
  const [large, setLarge] = useState(false)
  return (
    <div className="dc-reader">
      <div className="dc-reader-top"><span>Lewis Carroll</span><button type="button" aria-pressed={large} onClick={() => setLarge(!large)}>Larger text</button></div>
      <h3>Alice’s Adventures<br />in Wonderland</h3>
      <p className="dc-reader-passage" data-large={large}>{passages[page]}</p>
      <div className="dc-reader-bottom"><span>Passage {page + 1} of 2</span><button type="button" onClick={() => setPage(1 - page)}>{page ? 'Previous passage' : 'Next passage'}</button></div>
    </div>
  )
}
