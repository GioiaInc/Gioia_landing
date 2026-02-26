export default function TeamMeetingFeb24() {
  return (
    <>
      <p>
        Full team meeting — Saeed, Roman, Enis, and Kambar. Covered team
        communication expectations, onboarding UX, home screen design debates,
        the new Bello Communities initiative, emotional AI&apos;s social impact
        mission, and Apple App Store submission prep ahead of the March 31
        launch.
      </p>

      <h2>Team Communication &amp; Culture</h2>
      <p>
        Saeed opened by calling out the team for being too quiet in the group
        chat — most of the time only Roman responds. He asked everyone to at
        minimum react to messages so updates are acknowledged. The broader
        point: more energy, more engagement, more ownership from every member.
      </p>

      <h2>Onboarding &amp; Welcome Screens</h2>
      <p>
        Enis presented Figma designs for the onboarding flow: get-started
        screen, account creation (first name, last name, phone number, optional
        email), SMS verification, and profile photo upload. The team debated
        requiring a photo upfront vs. allowing a grace period. Saeed pushed for
        maximum simplicity to reduce drop-off — real names (not usernames),
        phone number as the unique identifier.
      </p>

      <h2>Home Screen &amp; Contact Sorting</h2>
      <p>
        The updated home screen gradient now flows bottom to top, with an
        &quot;all contacts&quot; view accessible by scrolling up. A lively
        debate broke out over alphabetical contact sorting — Roman argued
        nobody scrolls to the letter &quot;F&quot; anymore, they just search.
        Enis noted older demographics still use alphabetical lists. The team
        agreed search should be the primary pattern, with sorting revisited
        later.
      </p>

      <h2>Apple Liquid Glass &amp; Design Identity</h2>
      <p>
        Enis asked about replicating Apple&apos;s liquid glass UI. Roman
        explained it requires Apple&apos;s proprietary Metal/Swift stack —
        impossible in Flutter without tripling the work. Saeed said he
        doesn&apos;t want to copy Apple anyway; Bello should have its own
        identity. The current glassy look needs softening but the direction is
        right.
      </p>

      <h2>Bello Communities</h2>
      <p>
        The biggest new initiative. Saeed introduced{" "}
        <strong>Bello Communities</strong> — Discord/Telegram-style community
        features built into Bello. Roman was immediately enthusiastic, noting
        the existing backend already supports it — the challenge is mostly
        frontend and web design. The vision: WhatsApp-like personal messaging{" "}
        <em>and</em> Discord-like communities in one platform. Saeed tasked
        everyone with analyzing what Discord and Telegram do right and wrong.
      </p>

      <h2>Mental Health &amp; Social Impact</h2>
      <p>
        Saeed shared a story from his Stanford mentor meeting about a student
        suicide at Palo Alto High School, deepening the team&apos;s conviction
        around Bello&apos;s emotional AI mission. The idea: AI-driven emotional
        detection across conversations could flag signs of distress and alert
        close contacts or parents. Kazakhstan has one of the highest youth
        suicide rates globally — this isn&apos;t just a feature, it&apos;s a
        moral imperative and a compelling distribution story for schools.
      </p>

      <h2>Kambar&apos;s Strategy Update</h2>
      <p>
        Four workstreams: (1) competitive comparison chart — Bello vs. Discord,
        WhatsApp, WeChat, VK, Instagram; (2) distribution strategy for first
        users, including invite-only model analysis; (3) monetization plan with
        tasteful ad integration for Central Asian markets; (4) a first-principles
        document on how human communication works and what digital messaging
        loses.
      </p>

      <h2>Technical &amp; App Update</h2>
      <p>
        Roman summarized recent progress: new reactions, bug fixes, add-people
        flow (inspired by Discord), landing page and demo work. The most
        requested features from the team&apos;s top-10 list fall into two
        buckets: ambient AI for emotional detection and voice memo/voice typing.
        A formatting bug with @mentions in editing and replying was flagged for
        fixing.
      </p>

      <h2>Speech-to-Text &amp; Language Support</h2>
      <p>
        Enis proposed speech-to-text that converts voice to text messages for
        users who can&apos;t type. This raised the language gap — Albanian,
        Kazakh, and Tajik have poor or nonexistent speech recognition on
        existing platforms. Kambar noted Nazarbayev University trains Kazakh
        language models. Roman is confident hosted models can be found.
      </p>

      <h2>GIFs, Stickers &amp; Expression</h2>
      <p>
        Kambar advocated for GIF and sticker support — in Central Asian group
        chat culture, people send a GIF that says &quot;hi&quot; instead of
        typing it. The team agreed to add them, including custom user-uploaded
        stickers similar to WeChat.
      </p>

      <h2>Launch Timeline</h2>
      <p>
        <strong>March 31</strong> remains the public launch target. Apple App
        Store listing materials need to be submitted by next Friday (~March 6)
        since Apple&apos;s review takes up to two weeks. Emotional detection
        launches internally in early March for testing. Next meeting: Thursday.
        Saeed suggested extending future meetings to 1.5 hours.
      </p>

      <h2>Standout Quotes</h2>
      <p style={{ fontStyle: "italic", color: "#6a6560" }}>
        &quot;I think we&apos;re building something really noble here with this
        app… we have such a bigger reason to actually build this app now. And it
        goes far beyond just us.&quot;
        <br />— Saeed
      </p>
      <p style={{ fontStyle: "italic", color: "#6a6560" }}>
        &quot;It&apos;s kind of crazy with AI. We&apos;ve been able to develop
        the backend at the same pace as design, if not a little bit faster
        sometimes, which is definitely like flipping the script.&quot;
        <br />— Roman
      </p>
      <p style={{ fontStyle: "italic", color: "#6a6560" }}>
        &quot;Being lonely is super easy these days because you can just sit
        online and doom scroll… but if we create something where you&apos;re on
        your phone but it&apos;s actually productive and you can actually feel
        someone&apos;s emotion — that&apos;s different.&quot;
        <br />— Saeed
      </p>
    </>
  );
}
