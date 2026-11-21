---
title: 'post Opus 5.5 era: deslop everything'
date: 2026-11-21
excerpt: Slop is everywhere, and your evals are not the solution.
hidden: false
---

Hello fellow _bottlenecks_! We are in post opus 5.5 era. Math hypotheses are getting proven and guess what? We are still dealing with slop. Everywhere. and I don't mean the code we get from AI.

![](/images/blog/IMG_5668.jpg)

Opus 5.5 made agents trustworthy enough to let it take the steering wheel, which is great, until you realize they're grinding on top of **your** old mess. We brag about harnesses we have but we avoid talking about sloppy workflows we humans have. Unless you are not in a super chill startup, nowadays you probably have more fixing to do and i want to point out to some of them in three layers.

**The code:** Poteto put it best: agents copy whatever's already in your codebase. Your 2023 workaround is now "a must follow" in your MDs. Harjot Gill (codeRabbit) went even spicier: "humans were writing slop, not AI." yikes, but... fair? I add another layer, the model you worked on last year did some shitty job probably by today's standards. So the we need to keep gardening the code, both the code that agents write and what we had in the past and then we can watch the seed grow.

**The process**: Code is cheap nowadays (sorta) but SDLC was kinda built  around the fact that writing code was slow.So we need to go back to drawing board again and try to remove the bottlenecks in every process. I wrote about in details from my experience dealing with it in my team [over on Medium](https://medium.com/@sinabastani/ai-is-changing-the-software-lifecycle-and-we-need-to-evolve-with-it-945c9034f413) if you want the long version. But tldr just plugging in Claude into same workflow you have cannot make a big change. We need to intentionally break some of those old habits.

**Your head:** This is where I'm with the Pi ppl (Mario & Armin), just a bit less grumpy. Mario: "the industry is running away from understanding." A green CI with a metric ton of agent-written tests proves nothing since the agent easily can fool you with them. So stop bragging about evals if you can't take agency of your code or your product. That's how CVEs gonna get ya!

Thariq called it an industrial revolution **and** a Renaissance at the same time. We are putting the gears in place, but the soul of things needs a refresh as well. Be AGI pilled and human centered at the same time. Let agents fly but take more accountability and agency. Deslopping is a mindset now so both human and clankers are in our radar now

But things won't be that linear since we are still working with humans and making things for them. Be patient, spend time with others too and  grab a good coffee now. You deserve that ☕

Things that inspired this post:

- [AI is changing the software lifecycle. And we need to evolve with it.](https://medium.com/@sinabastani/ai-is-changing-the-software-lifecycle-and-we-need-to-evolve-with-it-945c9034f413?sharedUserId=sinabastani) (my Medium post)
- [Software factories and code reviews with Harjot Gill](https://newsletter.pragmaticengineer.com/p/software-factories-and-code-reviews) (The Pragmatic Engineer podcast)
- [Writing code that doesn't suck with the creators of Pi](https://www.youtube.com/watch?v=ZBTegd8DUZM)
- [All Code Is Slop (Except Mine)](https://youtu.be/O_zcc6Xl12g?si=9C2bUjkkikXgm7_m), Lauren Tan
- [The Sweet Side of the Bitter Lesson](https://youtu.be/xRJMiaUoD_8?si=Eibft0D_5hJBAXop), Thariq Shihipar
- [I Looked Into How Devs Are Actually Using AI](https://youtu.be/qCheZDyFX2U?si=yHC4dnvFSXiMNM6s) - ForestKnight
