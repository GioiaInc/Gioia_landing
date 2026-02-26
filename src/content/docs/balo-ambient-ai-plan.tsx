export default function BaloAmbientAIPlan() {
  return (
    <>
      <p>
        This document outlines the initial AI strategy for Balo, focused on
        ambient intelligence — AI features that feel invisible to the user while
        meaningfully enhancing the communication experience. This direction was
        agreed upon by Roman and Kambar on February 15, 2026, and represents the
        approach for the April 2026 prototype release.
      </p>

      <h2>Why Ambient AI First</h2>
      <p>
        After evaluating both ambient (background, invisible) and compositional
        (active, generative) AI approaches, the team aligned on ambient AI for
        three reasons:
      </p>
      <ul>
        <li>
          <strong>Zero infrastructure cost.</strong> All models run locally on
          device. No servers, no API calls, no revenue dependency. This is
          critical — Balo will be a free app with no near-term revenue.
        </li>
        <li>
          <strong>Privacy by default.</strong> On-device processing means
          conversations never leave the phone. No security concerns, no data
          transmission, no privacy policies to navigate.
        </li>
        <li>
          <strong>Design integration.</strong> Ambient AI is deeply tied to
          Balo&apos;s visual identity. The AI doesn&apos;t feel like a bolt-on feature —
          it <em>is</em> the experience. Mood-responsive visuals, subtle nudges,
          and emotional context all reinforce what makes Balo different.
        </li>
      </ul>

      <h2>Feature 1 — Semantic Mood Detection</h2>
      <p>
        A small on-device model analyzes message sentiment in real time and
        translates it into a visual signal — changing background tones, chat
        bubble colors, or ambient effects based on the emotional character of the
        conversation.
      </p>
      <p>
        <strong>How it works technically:</strong>
      </p>
      <ul>
        <li>
          Each device runs a lightweight local transformer that scores outgoing
          messages for emotional valence.
        </li>
        <li>
          The score (not the message content) is transmitted via WebSocket to the
          other participant.
        </li>
        <li>
          Both devices average the incoming and outgoing scores and map the
          result to a point in a latent mood space (vector-based).
        </li>
        <li>
          A shared algorithm translates that vector into visual parameters —
          color shifts, animation intensity, ambient effects.
        </li>
      </ul>
      <p>
        This creates a shared emotional atmosphere: if one person is agitated and
        the other calm, the visual lands somewhere in between. If both are
        relaxed, the environment reflects that warmth. The conversation has a
        <em> feeling</em> you can see.
      </p>
      <p>
        Exact visual implementation (background gradients, bubble effects,
        particle animations) to be determined with Enis in the next team design
        review.
      </p>

      <h2>Feature 2 — Emotional Nudges</h2>
      <p>
        A secondary micro-model monitors outgoing messages for extreme emotional
        signals — excessive negativity, hostility, or coldness — and surfaces a
        gentle, dismissable suggestion above the input bar.
      </p>
      <p>
        <strong>Example scenarios:</strong>
      </p>
      <ul>
        <li>
          User types a blunt, low-effort reply to something emotional →
          nudge: <em>&quot;Maybe say a little more — based on your past conversations,
          this matters to them.&quot;</em>
        </li>
        <li>
          User types something aggressive in a heated moment →
          nudge: <em>&quot;Take a breath. You might want to soften this.&quot;</em>
        </li>
      </ul>
      <p>
        The model operates on a simple binary signal: is this message at an
        emotional extreme or not? If extreme, it determines the direction of the
        nudge (scale back intensity, add more warmth, etc.). This keeps the model
        tiny and fast.
      </p>
      <p>
        <strong>Critical UX principle:</strong> This must be trivially easy to
        dismiss. A single &quot;never show me this again&quot; button for users who
        dislike it. Users who engage with it see it become more naturally
        integrated over time. A/B testing will be essential — this either
        resonates deeply or gets rejected entirely.
      </p>

      <h2>Feature 3 — Conversation Mood at a Glance</h2>
      <p>
        The ambient model analyzes the last ~10 messages of each conversation and
        produces a mood summary that&apos;s visually represented on the home screen.
        At a glance, users can recall the emotional tone of a conversation
        without opening it — creating a stronger memory and emotional connection
        to their relationships.
      </p>

      <h2>Future: Voice Note Intelligence</h2>
      <p>
        Voice messaging is heavily used in Central Asia, often carrying social
        dynamics (seniority, respect, informality). A future ambient feature
        could analyze voice notes for emotional tone and translate that into
        visual or textual indicators within the chat — bridging the gap between
        voice and text in a way no current app does.
      </p>
      <p>
        This is earmarked for a later release due to higher model complexity, but
        represents a significant differentiator for the Central Asian market.
      </p>

      <h2>What&apos;s Deferred</h2>
      <p>
        <strong>Compositional AI</strong> (active generation, writing
        suggestions, AI collaborators in DMs) and <strong>AI assistants</strong>{' '}
        (reminders, birthday tracking, meeting recall) are deferred to post-MVP.
        These require server-side inference, which requires revenue. They remain
        on the roadmap as future features once the user base and business model
        support them.
      </p>
      <p>
        <strong>Fine-tuning custom models</strong> was discussed and deprioritized.
        The consensus: as frontier labs improve rapidly, fine-tuning yields
        diminishing returns versus the infrastructure cost. The only reason to
        pursue it would be IP ownership for company valuation — not current
        product needs. Reference: Higgsfield AI (Kazakhstan-connected, Snapchat
        AI alumni) reached the same conclusion and pivoted away from custom model
        training.
      </p>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Roman to prototype the semantic mood detection model and WebSocket
          score exchange for the April release.
        </li>
        <li>
          Team design review with Enis to determine visual expression of mood
          states (backgrounds, bubbles, effects).
        </li>
        <li>
          Continue brainstorming more experimental, revolutionary AI features —
          current ideas are achievable but not yet breakthrough-level.
        </li>
        <li>
          Follow-up meeting between Roman and Kambar in 1–2 weeks to refine
          ideas further.
        </li>
      </ul>
    </>
  );
}
