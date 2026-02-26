export default function ExecutiveMeetingFeb15() {
  return (
    <>
      <p>
        AI strategy meeting between Roman (CTO) and Kambar. Duration ~45
        minutes. This summary covers the key decisions, discussion points, and
        open questions raised for the broader team.
      </p>

      <h2>Key Decisions</h2>
      <ul>
        <li>
          <strong>Ambient AI for April MVP.</strong> The team will focus
          exclusively on ambient, on-device AI features for the initial Balo
          prototype. This means mood-responsive visuals, emotional nudges, and
          conversation-level mood indicators — all running locally with zero
          server cost and zero privacy concerns.
        </li>
        <li>
          <strong>No custom model training.</strong> Fine-tuning or training
          proprietary models is deprioritized. Frontier labs are improving too
          fast for custom training to yield sustainable ROI at our stage. This
          aligns with the approach taken by Higgsfield AI, who abandoned custom
          model training in favor of leveraging existing models.
        </li>
        <li>
          <strong>Compositional AI deferred.</strong> Server-side features
          (AI writing assistance, in-chat AI collaborators, smart reminders) are
          future releases. They require revenue to fund inference costs, which we
          don&apos;t yet have.
        </li>
      </ul>

      <h2>Balo AI — What We&apos;re Building</h2>
      <p>
        Three ambient features are planned for the April prototype:
      </p>
      <ol>
        <li>
          <strong>Semantic mood detection</strong> — real-time sentiment analysis
          that changes the visual atmosphere of the chat (colors, effects)
          based on the averaged emotional state of both participants.
        </li>
        <li>
          <strong>Emotional nudges</strong> — gentle, dismissable suggestions
          when the model detects extreme sentiment. Designed to be easily
          disabled; will require A/B testing to validate.
        </li>
        <li>
          <strong>Home screen mood glance</strong> — a visual summary of each
          conversation&apos;s recent emotional tone, visible from the main screen
          without opening the chat.
        </li>
      </ol>
      <p>
        All three run entirely on-device using micro transformers. Scores (not
        messages) are exchanged via WebSocket. Visual implementation pending
        design review with Enis.
      </p>

      <h2>Central Asia Market Insights</h2>
      <p>
        Kambar raised several cultural dynamics relevant to product design:
      </p>
      <ul>
        <li>
          <strong>Voice notes carry social hierarchy.</strong> In Kazakh culture,
          sending a voice memo can signal seniority — &quot;I&apos;m too important to
          type.&quot; When the dynamic is reversed (the senior person needs
          something), they switch to text. This asymmetry is a design
          opportunity.
        </li>
        <li>
          <strong>Unknown contacts create anxiety.</strong> When receiving
          messages from unfamiliar people (especially in corporate settings),
          users immediately check the sender&apos;s rank or role before calibrating
          their response tone.
        </li>
        <li>
          <strong>WhatsApp and WeChat are mass-market.</strong> They cannot
          optimize for regional nuances. Balo&apos;s advantage is being small enough
          to deeply serve Central Asian communication patterns that global
          platforms ignore.
        </li>
      </ul>

      <h2>Company Direction — Open Discussion</h2>
      <p>
        A significant portion of the meeting explored the broader GIOIA
        strategy beyond Balo. This remains unresolved and requires full team
        input.
      </p>

      <h2 style={{ fontSize: '1.2rem' }}>The core question</h2>
      <p>
        Does GIOIA become a multi-vertical company (messaging + finance +
        healthcare + education), or does it become an AI data company that
        partners with existing vertical players?
      </p>

      <h2 style={{ fontSize: '1.2rem' }}>The case for partnerships</h2>
      <ul>
        <li>
          Building 6+ verticals simultaneously is equivalent to building 6
          companies at once — an unrealistic scope for a pre-revenue team.
        </li>
        <li>
          Balo generates rich behavioral and emotional data. That data becomes
          exponentially more valuable when connected to other domains (finance,
          health, education) — but GIOIA doesn&apos;t have to build those domains.
        </li>
        <li>
          Partnering with existing niche apps in Central Asia and integrating
          via a shared AI data layer could be faster and more capital-efficient.
        </li>
      </ul>

      <h2 style={{ fontSize: '1.2rem' }}>The data opportunity</h2>
      <p>
        Regardless of direction, the underlying thesis is the same: Balo is
        one of the richest possible sources of behavioral data. Every
        conversation reveals communication patterns, emotional tendencies, and
        social dynamics. If structured correctly (vectorized per-user, updated
        continuously), this data could power personalized AI across any domain.
      </p>
      <p>
        <strong>Key constraint:</strong> the biggest barrier isn&apos;t technical —
        it&apos;s legal. Cross-platform data sharing is locked behind incompatible
        privacy policies and regional laws. This is a regulatory problem more
        than an engineering one, and GIOIA operating in Central Asia (with
        potentially more flexible digital sovereignty frameworks) could be an
        advantage.
      </p>

      <h2 style={{ fontSize: '1.2rem' }}>Data architecture note</h2>
      <p>
        Roman clarified the technical approach: user data will be stored as
        vector embeddings (not fine-tuned into models). Vectors are updated
        continuously and retrieved in-context as needed — this is the
        industry-standard approach and avoids the diminishing returns of
        pre-training on user data. Whether condensing happens on-device (edge)
        or server-side is an open experiment.
      </p>

      <h2>Reference: Higgsfield AI</h2>
      <p>
        Discussed as a relevant case study. Higgsfield (Kazakh-connected, founded
        by a former senior Snapchat AI engineer) started with consumer video
        templates but frames their long-term vision as integrated marketing
        workflows across social platforms. They explicitly acknowledged that big
        labs could replicate their current product, so their moat is the
        workflow integration — not the model. GIOIA&apos;s position is analogous: the
        moat is the data and the regional relationships, not the AI models
        themselves.
      </p>

      <h2>Action Items</h2>
      <ul>
        <li>
          <strong>Roman:</strong> Prototype ambient AI features for April
          release. Prepare a presentation of planned features for next team
          meeting.
        </li>
        <li>
          <strong>Roman + Kambar:</strong> Continue brainstorming experimental AI
          features. Schedule follow-up in 1–2 weeks.
        </li>
        <li>
          <strong>Full team (Tuesday):</strong> Discuss the verticals vs.
          partnerships question. This decision fundamentally shapes the AI and
          data strategy.
        </li>
        <li>
          <strong>Enis:</strong> Design review for mood-responsive visual
          system — how sentiment scores translate to UI (backgrounds, bubbles,
          animations, particle effects).
        </li>
        <li>
          <strong>Saeed + team:</strong> Align on what GIOIA looks like
          post-Balo. The AI roadmap depends on this answer.
        </li>
      </ul>
    </>
  );
}
