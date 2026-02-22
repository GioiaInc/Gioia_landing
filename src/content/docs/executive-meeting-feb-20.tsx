export default function ExecutiveMeetingFeb20() {
  return (
    <>
      <p>
        One-on-one between Saeed and Roman. Triggered by Saeed&apos;s investor
        call earlier that day — evolved into a wide-ranging conversation about
        vision alignment, market strategy, chat interface design, and the
        creative process behind the landing page.
      </p>

      <h2>Investor Call Debrief</h2>
      <p>
        Saeed debriefed his call with the <strong>Kazakh corporate contact</strong> —
        turns out he&apos;s CIO of a railway company, not a telecom. The contact
        was honest: he lacks startup experience (career has been big corporate)
        and can&apos;t serve as a hands-on mentor. But he offered to connect the
        team to VCs when they have a working product, and invited them to meet
        in person in Astana.
      </p>
      <p>
        Saeed took the call as a net positive. Key takeaway: potential investors
        and mentors in the region grew up in or were shaped by the
        <strong> Soviet-era mentality</strong> — pragmatic, skeptical of big
        dreams, and unwilling to commit until they see something real. This
        reinforced the urgency of having a <strong>working product</strong> before
        any serious fundraising conversations.
      </p>

      <h2>Vision Alignment</h2>
      <p>
        Saeed asked Roman directly what drew him to GIOIA beyond the Central
        Asia market strategy. Roman laid it out: <strong>cultural and
        technological stagnation</strong> is everywhere — people still consume
        decades-old media, and software hasn&apos;t meaningfully evolved for
        end users. Messaging is one of the most ambitious things to try to
        reinvent precisely because people don&apos;t even think about it
        anymore. The Steve Jobs principle of giving people something they
        didn&apos;t know they wanted is what makes this compelling.
      </p>
      <p>
        Roman framed it as an opportunity of a lifetime — applying real design
        and engineering ambition to something that&apos;s been mundane for too
        long. Saeed confirmed this is exactly the alignment he was looking for.
      </p>

      <h2>Market Strategy: Central Asia vs. US</h2>
      <p>
        Both agreed <strong>Central Asia remains the primary target</strong>.
        Roman expressed low confidence in a US launch — the market is saturated,
        the bar is the highest in the world, and the effort-to-success ratio
        doesn&apos;t justify it early on. In other regions, demonstrating you
        can build something as good as the West but locally is enough to build
        a company. In the US, that&apos;s table stakes.
      </p>
      <p>
        Saeed raised a new data point: his US-based mentor has connections that
        could potentially source funding domestically, even for a product
        launching abroad. Both agreed this is worth exploring as a hybrid model —
        US capital funding Central Asian deployment — but not a priority shift.
      </p>

      <h2>Chat Interface Design</h2>
      <p>
        Reviewed Enis&apos;s latest chat interface draft. Both flagged the same
        issues: <strong>chat bubbles are too sharp</strong>, too close to the
        generic messenger template you&apos;d find on a Google search. The
        gradient looks fine on the contacts list but doesn&apos;t work on the
        chat screen.
      </p>
      <p>
        Roman pushed for <strong>fully custom design</strong> — no pre-made
        Figma components, no default shapes. With AI handling most of the
        backend, design is the differentiator and has to be original. He also
        suggested Enis produce <strong>more iterations</strong> per round so the
        team can compare options side-by-side rather than evaluating one at a
        time.
      </p>

      <h2 style={{ fontSize: '1.2rem' }}>Emotional visualization concepts</h2>
      <p>
        The two explored ideas for how emotion manifests in the chat view:
      </p>
      <ul>
        <li>
          <strong>Background-as-mood:</strong> Instead of colored chat bubbles,
          the chat screen background itself shifts — your side of the screen
          tints based on your detected emotion, the other side reflects theirs,
          and the middle blends into an overall conversation mood.
        </li>
        <li>
          <strong>Emotion tapestry:</strong> Roman proposed a scrollable color
          history — like a temperature heatmap across a year — where scrolling
          up through old messages reveals a visual timeline of emotional shifts.
          You could find a happy moment with a family member just by scanning
          the colors.
        </li>
        <li>
          <strong>Opt-out by tap:</strong> Roman suggested users should always
          be able to tap the detected emotion to cycle through alternatives and
          override it. Gives users control without killing the feature.
        </li>
        <li>
          <strong>Sender-only visibility:</strong> Saeed confirmed that users
          should only see the emotion of the person texting them, never their
          own outgoing emotion as the recipient sees it. Prevents overthinking
          and self-censoring.
        </li>
      </ul>

      <h2>Vibe Coding &amp; Creative Process</h2>
      <p>
        Saeed acknowledged Roman&apos;s <strong>design instincts</strong> —
        called out the landing page as evidence that Roman has the eye for good
        design, specifically the kind of simplicity-that&apos;s-different they
        both value. Roman described the landing page as an experiment in
        <strong> vibe coding</strong>: building it almost entirely through AI
        without touching the keyboard, iterating through 20+ background
        variations to find the right one. Saeed wants to take on more of these
        creative builds himself to free up Roman&apos;s bandwidth.
      </p>

      <h2>Action Items</h2>
      <ul>
        <li>
          <strong>Roman:</strong> Fix image download on Balo app. Create
          vertical Balo wallpaper for Saeed. Send Saeed the demo write-up
          (what the demo should show) by tonight or Saturday.
        </li>
        <li>
          <strong>Saeed:</strong> Push Enis for chat interface designs by
          Sunday evening. Pass along design feedback (custom bubbles, more
          iterations, no sharp edges). Schedule speed evaluation for next
          Tuesday.
        </li>
      </ul>

      <h2>Standout Quotes</h2>
      <p style={{ fontStyle: 'italic', color: '#6a6560' }}>
        &quot;If there&apos;s a project where I&apos;m going to make an impact on
        something and try to help reinvent it, messaging is one of the most
        ambitious ones. It&apos;s an opportunity of a lifetime to at least
        try.&quot;
        <br />— Roman
      </p>
      <p style={{ fontStyle: 'italic', color: '#6a6560' }}>
        &quot;No one&apos;s gonna take us seriously no matter how great our idea
        is. We gotta get a product done ASAP.&quot;
        <br />— Saeed
      </p>
    </>
  );
}
