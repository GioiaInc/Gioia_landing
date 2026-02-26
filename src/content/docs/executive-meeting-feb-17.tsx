export default function ExecutiveMeetingFeb17() {
  return (
    <>
      <p>
        Full team meeting — Saeed, Roman, Kambar, and Enis. This was the longest
        and most substantive session to date, covering product status, server
        infrastructure, AI strategy, company vision, design direction, and the
        March 31 public launch deadline.
      </p>

      <h2>Product Status — Balo App &amp; Web</h2>
      <p>
        <strong>The app is live.</strong> All team members are logged in and
        communicating on Balo. A team group chat is active. Key updates from
        Roman:
      </p>
      <ul>
        <li>
          <strong>Balo Web launched.</strong> A full web client is deployed —
          same backend as mobile, chat history syncs across devices. Design is a
          blend of Discord and WhatsApp. Web calling also works (low quality due
          to single server, but functional). Video calling was demoed live.
        </li>
        <li>
          <strong>iPad support</strong> works unexpectedly well — full layout,
          not just a stretched iPhone view.
        </li>
        <li>
          <strong>Voice memos deferred</strong> — traded off to prioritize phone
          authentication reliability.
        </li>
        <li>
          <strong>Reactions</strong> are live on mobile (three emojis for now,
          expandable — region-specific emoji sets discussed as a future feature).
        </li>
        <li>
          <strong>Known issues:</strong> archive feature not yet functional, image
          paste on web not working, web login persistence unreliable (re-requesting
          SMS codes — this is a cost concern at $0.10 per verification).
        </li>
      </ul>
      <p>
        <strong>Directive from Saeed:</strong> effective immediately, all team
        communication moves to Balo. Discord is only for voice calls. Everyone
        should spend dedicated time trying to break the app and log detailed bug
        reports in Trello.
      </p>

      <h2>Server Infrastructure — Kambar&apos;s Presentation</h2>
      <p>
        Kambar presented a comprehensive cost analysis for hosting at 1 million
        users (roughly 1% Central Asian market share), sourced from local
        Kazakh providers. All figures exclude GPU costs.
      </p>
      <ul>
        <li>
          <strong>Renting dedicated servers:</strong> ~$9,400/month. No upfront
          capital. No need to hire a server team. Easiest to start.
        </li>
        <li>
          <strong>Owning servers:</strong> ~$200K upfront hardware +
          ~$464K first year total (includes facilities, energy, personnel).
        </li>
        <li>
          <strong>Hybrid (rent → own):</strong> ~$129K first year. Starts
          like renting, transitions to owned. Migration period doubles costs
          temporarily.
        </li>
        <li>
          <strong>VPS/shared (serverless-style):</strong> ~$2,000/month for 1M
          users. Scales with demand. Roman emphasized this is the industry
          direction and critical for a pre-revenue startup — you pay for what
          you use.
        </li>
      </ul>
      <p>
        Roman noted the dedicated estimates may be overprovisioned (Claude being
        conservative) and that half the specified hardware could likely handle
        the load. Current Balo hosting is ~$260/year supporting roughly 1,000
        users.
      </p>
      <p>
        <strong>SMS costs:</strong> ~$0.04 per message. At scale, self-hosting
        SMS would require telecom partnerships — not a concern until ~10K users.
      </p>
      <p>
        <strong>Regulatory note:</strong> Kazakhstan is the strictest in the
        region. Local server rental complies easily as long as raw data stays
        in-country. Data migration between Kazakh servers is legally
        straightforward. A designated privacy officer (DPO) is required in
        Kazakhstan.
      </p>

      <h2>AI Strategy Recap</h2>
      <p>
        Kambar presented the ambient AI plan agreed upon with Roman (see
        separate doc). Key points reinforced for the full team:
      </p>
      <ul>
        <li>
          Three ambient features for April: mood detection (visual atmosphere
          changes), emotional nudges (intervention on extreme messages),
          conversation mood at a glance (home screen indicators).
        </li>
        <li>
          Compositional AI and AI assistants deferred — require server-side
          inference and revenue to fund.
        </li>
        <li>
          <strong>Voice message AI</strong> highlighted as an untapped niche —
          no one is doing AI-assisted voice notes.
        </li>
        <li>
          <strong>Device capability problem:</strong> In Kazakhstan, only 35–45%
          of devices can run on-device models well. 15–20% can run weaker
          models. Up to 50% can&apos;t run any. In Tajikistan, the numbers are far
          worse. A hybrid edge/server approach is necessary.
        </li>
        <li>
          <strong>Monetization question raised:</strong> Would Central Asian
          users pay for AI features? Consensus: unlikely. Revenue must come from
          partnerships or other business models, not subscriptions.
        </li>
      </ul>

      <h2>Digital Twins &amp; Data Vision</h2>
      <p>
        This emerged as a major strategic theme. Roman described the concept:
        with user consent, Balo data creates vectorized behavioral profiles —
        digital twins — that can be applied across domains.
      </p>
      <ul>
        <li>
          <strong>Healthcare:</strong> knowing a user&apos;s behavioral patterns
          (impulsivity, stress responses, communication style) before they walk
          into a doctor&apos;s office.
        </li>
        <li>
          <strong>Finance:</strong> recognizing an impulsive trader before they
          lose money — guiding them with guardrails.
        </li>
        <li>
          <strong>E-Government:</strong> providing consented behavioral data to
          Kazakh government systems for better citizen services.
        </li>
      </ul>
      <p>
        Saeed strongly endorsed this direction. He wants GIOIA to lay the
        foundations for being an AI data provider — not just a messaging company.
        The moat isn&apos;t the app itself (competitors could replicate within a
        year), it&apos;s the data infrastructure and regional positioning.
      </p>
      <p>
        <strong>Data architecture:</strong> user data stored as vector embeddings,
        updated continuously, retrieved in-context as needed. This is more
        efficient than fine-tuning models per user. Whether condensing happens
        on-device (edge) or server-side remains an open experiment.
      </p>

      <h2>Company Vision — Saeed&apos;s Direction</h2>
      <p>
        Saeed laid out the clearest articulation of GIOIA&apos;s identity to date:
      </p>
      <ul>
        <li>
          <strong>Immediate focus:</strong> Balo — make it the best messaging
          app that has ever existed. Think about the human side, not just
          engineering. Google made 15+ messaging apps and all failed because
          they only thought about the backend.
        </li>
        <li>
          <strong>Parallel foundation:</strong> Digital twins and AI data
          infrastructure. This is what makes GIOIA defensible when WhatsApp or
          Telegram copies the emotional features.
        </li>
        <li>
          <strong>Future vertical — finance:</strong> Still a personal priority
          for Saeed (Central Asian financial markets are &quot;extremely outdated&quot;),
          but not being pitched to investors yet. No plan, no market research,
          no promises. When it happens, it will be a natural transition — same
          user base, no new user acquisition needed.
        </li>
        <li>
          <strong>Partnerships over building:</strong> Rather than constructing
          6 verticals from scratch, GIOIA integrates its AI data layer with
          existing regional players. The pitch to investors: Balo demonstrates
          the possibility of seamless cross-domain integration, whether through
          GIOIA-built products or partnerships.
        </li>
        <li>
          <strong>GIOIA&apos;s identity</strong> (Roman&apos;s framing, endorsed by
          Saeed): a collective of individuals pushing every technological
          envelope with a specific focus on Central Asia. Not copying what
          exists — building what doesn&apos;t.
        </li>
      </ul>

      <h2>Design Direction</h2>
      <ul>
        <li>
          <strong>Main page design locked in.</strong> Enis&apos; latest design
          approved by Saeed — different colors representing different emotions.
          No changes before March 31; any iterations happen after launch.
        </li>
        <li>
          <strong>Emotional visual design system</strong> — Enis to define how
          mood translates to UI (messaging backgrounds, bubble colors,
          animations). <strong>Deadline: March 15.</strong>
        </li>
        <li>
          <strong>Animation &amp; motion design</strong> — page transitions,
          interaction animations. Target: 2 weeks before March 31.
        </li>
        <li>
          <strong>Saeed taking over branding/marketing design</strong> — logos,
          color portal, marketing materials. Frees Enis to help Roman with
          frontend implementation.
        </li>
        <li>
          <strong>UI/UX designer hire deprioritized.</strong> Freelancers for
          specific tasks instead (typography consultation, logo work, ~$20–200
          per project).
        </li>
        <li>
          <strong>Enis presenting design journey Thursday</strong> — full
          walkthrough of design evolution from start to current.
        </li>
        <li>
          <strong>Slight logo change</strong> noted — Saeed to discuss further.
        </li>
      </ul>

      <h2>Name Discussion</h2>
      <p>
        &quot;Balo&quot; was flagged as meaning &quot;evil&quot; in Farsi — a problem for the
        Tajikistan market. Saeed is considering a minor variation.
        &quot;Belo&quot; is the current frontrunner. Decision pending.
      </p>

      <h2>VC &amp; Fundraising Landscape</h2>
      <p>
        Kambar presented regional VC data:
      </p>
      <ul>
        <li>
          Kazakhstan is the largest VC market in Central Asia. Uzbekistan growing
          fast — a $250M deal in Q3 2025.
        </li>
        <li>
          Key investment sectors: fintech, enterprise software, AI.
        </li>
        <li>
          Few major startups from the region — Higgsfield (Kazakhstan), UZoom
          (Uzbekistan, multi-vertical unicorn: marketplace + food delivery +
          finance).
        </li>
        <li>
          Kosovo networking: Enis had a call with a contact — setting up future
          GIOIA introduction. Also exploring Kosovo-origin VCs in the US.
        </li>
      </ul>

      <h2>March 31 Launch Plan</h2>
      <p>
        Hard deadline. The app goes to inner circle with organic distribution —
        &quot;send it to whoever you want.&quot; No heavy promotion. Must have:
      </p>
      <ul>
        <li>Fully working app with emotional AI features</li>
        <li>Design system implemented</li>
        <li>App Store and Play Store listings (Enis researching requirements)</li>
        <li>Bug-free core experience (team stress-testing now)</li>
      </ul>

      <h2>Action Items</h2>
      <ul>
        <li>
          <strong>Everyone:</strong> Switch all communication to Balo
          immediately. Spend 10+ minutes actively trying to break the app.
          Detailed Trello bug reports. Write 10+ ideas for features that would
          make Balo the best messaging app in the world.
        </li>
        <li>
          <strong>Roman:</strong> Fix web image paste, investigate web login
          persistence (SMS cost leak), build internal document archive system
          (by ~Feb 22), continue ambient AI development for March 31.
        </li>
        <li>
          <strong>Kambar:</strong> Document organization system by Feb 22.
          Continue server &amp; AI research.
        </li>
        <li>
          <strong>Enis:</strong> Emotional visual design system by March 15.
          Research App Store / Play Store submission requirements. Design
          journey presentation Thursday. Help Roman with frontend
          implementation.
        </li>
        <li>
          <strong>Saeed:</strong> Official plan document &amp; pitch deck
          for team. Branding portal (colors, logos). Name decision. Freelancer
          sourcing for typography &amp; design.
        </li>
      </ul>

      <h2>Notable Quotes</h2>
      <p style={{ fontStyle: 'italic', color: '#6a6560' }}>
        &quot;I want to challenge everyone here to do things that are just different
        in the world — not just bringing something that exists in the US to
        Central Asia. I want us to be doing better.&quot;
        <br />— Saeed
      </p>
      <p style={{ fontStyle: 'italic', color: '#6a6560' }}>
        &quot;What if GIOIA is a collective of individuals trying to push every
        single envelope in terms of technology with a specific focus on Central
        Asia? That&apos;s pretty unique as is.&quot;
        <br />— Roman
      </p>
      <p style={{ fontStyle: 'italic', color: '#6a6560' }}>
        &quot;This is the best meeting in history. Put it in the archives.&quot;
        <br />— Saeed
      </p>
    </>
  );
}
