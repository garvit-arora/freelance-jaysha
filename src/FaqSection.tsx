import { ScrollTrigger } from 'gsap/ScrollTrigger'
const faqs = [
  ['Is Jaysha a real person?', 'Unfortunately, yes. We understand why you might have doubts.'],
  ['Is she single?', 'Stupid question. Who do you think spent days making this entire website?'],
  ['Can I get her number?', "Of course. You can also ask for the keys to the Prime Minister's residence. Both requests have similar chances of approval."],
  ['Does she ever overreact?', "That's a very disrespectful way to describe her completely reasonable emotional performances."],
  ['Can she cook?', "We're currently waiting for sufficient evidence to support this claim."],
  ['What’s her address?', 'We appreciate your curiosity. Her boyfriend, however, would like to know your address first.'],
  ['Where can I meet her?', "You can meet her in your dreams. Although, personally, I'd prefer you didn't do that either."],
  ["What's her biggest talent?", 'Turning a five minute conversation into a three part documentary.'],
  ['How does Jaysha handle stress?', "By creating additional stress, just to make sure the original stress doesn't feel lonely."],
  ['Does she have common sense?', 'Yes, but she prefers to save it for special occasions.'],
  ['Is she good at taking criticism?', "Of course, she's extremely open to constructive feedback. However, any feedback that isn't overwhelmingly positive will be considered a personal attack."],
  ['Is she a good listener?', "She's an exceptional listener and pays close attention to everything you say. Particularly the one sentence you wish you could take back."],
  ['Can I interact with her?', "She's generally a very sweet and approachable person. However, any attempts at flirting may result in your self esteem being permanently damaged."],
  ['What’s her Instagram?', "She has a fake account. She believes in staying updated on everyone's lives while contributing absolutely nothing to theirs."],
  ["What's the most beautiful thing about her?", "You'd probably expect us to say her smile, and honestly, that would be a perfectly reasonable answer. But it's the way she loves people, so completely and unconditionally, that makes her truly beautiful."],
  ['Is she easy to impress?', "Depends on who's making the effort. You could produce an entire feature film dedicated to her, and she'd still be talking about that one time her boyfriend surprised her with a ₹20 chocolate."],
  ['Is she easy to understand?', 'Good luck figuring out why a 20 rupees chocolate means more to her than a fuckin gold set.'],
  ['Is she difficult to love?', 'Not even for a second. Loving her is probably the easiest thing anyone could ever do, the difficult part is finding enough ways to show her just how much.'],
  ['Are there any known bugs?', 'Yes. Excessive overthinking, and an inability to decide what to eat and what to watch. Developers are working on it.'],
  ['Can I leave a review about her?', 'Of course. Whether anyone cares is a completely different matter.'],
]

export function FaqSection() {
  return <section className="faq-section" aria-labelledby="faq-title"><h2 id="faq-title">FAQs</h2>{faqs.map(([question, answer]) => <details key={question} onToggle={() => requestAnimationFrame(() => ScrollTrigger.refresh())}><summary>{question}</summary><p>{answer}</p></details>)}</section>
}
