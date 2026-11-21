---
title: 'post Opus 5.5 era: deslop everything'
date: 2026-11-21
excerpt: Slop is everywhere, and your Evals can't fix them alone.
hidden: false
---

Hello fellow _bottlenecks_! We are in opus 5.5 era. And guess what? We have slop. Everywhere. and I don't mean the code we get from AI.

Opus 5.5 made agents trustworthy enough to let it take your job, which is great, until you realize they're grinding on top of **your** old mess. We brag about harnesses we have but we avoid talking about sloppy workflows we humans have. So nowadays we have more fixing to do and i want to point out to some of them in three layers.

**The code:** Lauren Tan put it best: agents copy whatever's already in your codebase. Your 2023 workaround is now "the established pattern.". Harjot Gill (codeRabbit) went even spicier: "humans were writing slop, not AI." yikes, but... fair? I add another layer, the model you worked on last year did some shitty job probably by today's standards. So the only choice we have is to always try to git gud and be better with new models.

**The process**: Code is cheap nowadays (sorta) but we had all our SDLC around that fact. So we need to go back to drawing board again and try to remove the bottlenecks in every process. I wrote about in details from my experience [over on Medium](https://medium.com/@sinabastani/ai-is-changing-the-software-lifecycle-and-we-need-to-evolve-with-it-945c9034f413) if you want the long version.

**Your head.** This is where I'm with the Pi ppl (Mario & Armin), just a bit less grumpy. Mario: "the industry is running away from understanding." A green CI with a metric ton of agent-written tests proves nothing since the agent easily can fool you with them. So stop bragging about evals if you can't take agency of your code or your product. Do that and then you can stop blaming the CVE bombs!

Thariq called it an industrial revolution **and** a Renaissance at the same time. So it's time to Industrialize the boring parts, but keep the soul in the rest. Stop thinking about reading code or not and take more accountability and agency. Deslopping is a mindset now so both human and clankers are in our radar now! But things won't be that linear since we are still working with humans and making things for them. Ok now grab a good coffee and get back to it ☕

![](/images/blog/IMG_5658.jpg)

Things that inspired this post:

- [AI is changing the software lifecycle. And we need to evolve with it.](https://medium.com/@sinabastani/ai-is-changing-the-software-lifecycle-and-we-need-to-evolve-with-it-945c9034f413?sharedUserId=sinabastani) (my Medium post)
- [Software factories and code reviews with Harjot Gill](https://newsletter.pragmaticengineer.com/p/software-factories-and-code-reviews) (The Pragmatic Engineer podcast)
- [Writing code that doesn't suck with the creators of Pi](https://www.youtube.com/watch?v=ZBTegd8DUZM)
- [All Code Is Slop (Except Mine)](https://youtu.be/O_zcc6Xl12g?si=9C2bUjkkikXgm7_m), Lauren Tan
- [The Sweet Side of the Bitter Lesson](https://youtu.be/xRJMiaUoD_8?si=Eibft0D_5hJBAXop), Thariq Shihipar
