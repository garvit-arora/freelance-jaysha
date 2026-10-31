export type RomeoChapter = { title: string; year: string; date: string; paragraphs: string[]; media: { id: string; caption?: string }[]; poem?: string[] }
export const romeoChapters: RomeoChapter[] = [
 { title: 'The first interaction', year: '2019', date: 'December 10, 2019', paragraphs: [
 'December 10, 2019. I came across her story and decided to shoot my shot with what I thought was a pretty good compliment. Told her I couldn’t get over her smile. And after putting all that effort into one sentence. I got one painfully casual response 🙃',
 'Not exactly the beginning of a fairytale, was it? Little did I know, this was going to be the first page of a very long story.',
 ], media: [{ id: 'chapter1' }] },
 { title: 'Hey, stranger', year: '2020', date: 'June 9, 2020', paragraphs: [
 'Fast forward to June 9, 2020. Had we started talking? Nope. Had we met? Absolutely not. Did I still decide to write an entire poem about this girl? Of course I did.',
 'Now when I look back, I was either ridiculously optimistic or just a little too filmy. Probably both. Obviously I copied a few lines from here and there 😌',
 ], media: [{ id: 'chapter2' }] },
 { title: 'The comeback', year: '2021', date: 'April 12, 2021', paragraphs: [
 'So, after writing an entire poem about a girl I barely knew, we finally started talking. For 15 whole days. Impressive, I know. Then we stopped talking. \uD83D\uDE02',
 'Almost a year later, on April 12, 2021, she decided to make a comeback with a groundbreaking opening line : HEY',
 'And somehow, that one word changed everything.',
 ], media: [{ id: 'chapter3' }] },
 { title: 'Juliet', year: '2021', date: 'June 12, 2021', paragraphs: [
 'June 12, 2021. The day a girl I’d only known through pictures, messages and a few conversations finally became someone standing right in front of me.',
 'Now, a normal person would’ve probably just brought flowers. But apparently, my love language was writing poems for a girl who had already witnessed my questionable poetry skills once before.',
 'So I wrote another one, this time hiding her entire name in the first letters of every line.',
 'Because now, that stranger finally had a name.',
 ], media: [{ id: 'chapter4' }] },
 { title: 'Mission successful', year: '2021', date: 'July 3, 2021', paragraphs: [
 'I had been constantly writing about being hers for quite some time. On July 3, 2021, I finally got to say it for real. “Mai tera, Mai tera”',
 ], media: [{ id: 'chapter5' }] },
 { title: 'The director’s cut', year: '2022–24', date: 'All the ordinary days in between', paragraphs: [
 'And just like that, the years started flying by. Somewhere between endless laughter, silly arguments and countless memories, I kept finding new reasons to fall for her.',
 'And naturally, I kept making edits about it.',
 ], media: [
 { id: 'v1', caption: 'One girl, a hundred personalities, and somehow I managed to fall for every single one of them.' },
 { id: 'v2', caption: 'No special occasions, no big plans. Just two idiots having the time of their lives doing absolutely ordinary things.' },
 { id: 'v3', caption: 'By this point, we’d survived countless arguments, several dramatic episodes, and each other’s extremely questionable personalities.' },
 ] },
 { title: 'Yo Yo Romeo', year: '2025', date: 'November 8, 2025', paragraphs: [
 'November 8, 2025. On her birthday, the amateur poet decided to become an amateur singer.',
 'But hey, when the inspiration is right, you somehow become a lyricist, composer, rapper and singer overnight.',
 'Lyrics by: Me.\nComposed by : Me.\nVocals by : Me.\nPerformed by : Me.\nInspired by : Her',
 ], media: [{ id: 'chapter7' }] },
 { title: 'To be continued..', year: '2026', date: 'And all the years still waiting for us', paragraphs: [], media: [], poem: [
 'I used to look for perfect words,\nto make a stranger smile.\nnow I just want to hold her hand\nFor a little longer, a little more while.',
 'One more drive with nowhere planned,\none more “don’t go yet,”\none more ordinary evening\nthat we’ll never quite forget.',
 'Let the poems lose their rhythm,\nlet my singing miss a note\nyou’ll still be every reason\nbehind every word I wrote.',
 'And if you ask what happens next,\nI haven’t got a clue\njust leave a little room for me,\non every page with you.',
 ] },
]
