# belo by GIOIA

**Complete Product Specification** — AI-Native Messaging for Central Asia

Version 1.0 | March 2026 | Confidential

### Table of Contents

1. Product Overview

2. Core Interface: The Golden Circle

3. Identity & Authenticity

4. Ambient AI: Mood Scoring System

5. Emotional Intelligence

6. Compositional AI

7. Digital Twin

8. belo peek: Ephemeral Video

9. belo circles: Video Messages

10. belo pop: Social Moments

11. belo flow & openflow: Communities

12. Stackview: In-Chat Notes

13. Standard Messaging

14. Content Moderation & Safety

15. Privacy & Consent

16. Platform & Monetization

17. Future Ecosystem

18. Open Questions (Elaborated)

## 1. Product Overview

belo is an AI-native messaging application developed by GIOIA, designed to restore the paralinguistic communication elements that are lost in traditional text-based messaging. Where conventional messaging apps reduce human interaction to flat text on a screen, belo uses artificial intelligence to bring back the emotional richness, visual recognition, and contextual awareness that define face-to-face conversation.

The product targets Central Asian markets, specifically Kazakhstan, Uzbekistan, Kyrgyzstan, Tajikistan, and Turkmenistan, where nascent digital infrastructure presents a significant opportunity for a messaging platform built from the ground up with AI at its core.

### Core Philosophy

belo is built on the belief that messaging should feel as close to real-world interaction as possible. This is achieved through three pillars:

-   **Visual-first navigation:** Real photos and real names replace usernames and avatars, so you recognize contacts the way you recognize people in person.

-   **Emotional awareness:** AI-driven mood scoring, ambient visual feedback, and emotional nudges ensure that the emotional dimension of conversation is never lost.

-   **Personal intelligence:** A digital twin system learns each user's communication style through contextual embeddings, enabling AI-powered features that speak in the user's own voice.

### Monetization

belo is free to use. Future revenue streams under investigation include intelligent advertising based on behavioral embeddings and a separate financial intelligence application. No core features are gated behind payment.

## 2. Core Interface: The Golden Circle

The Golden Circle is belo's home screen and primary navigation paradigm. Instead of a chronological list of conversations, contacts are arranged in concentric circles organized by communication frequency and importance. The contacts you communicate with most sit at the center; those you interact with less frequently occupy outer rings.

### Structure

-   **Center (2 contacts):** Your two most important and frequently contacted people.

-   **Inner ring (6 contacts):** The next tier of close contacts.

-   **Outer rings:** Expand outward with additional contacts. The exact sizes of rings beyond the inner 6 and the question of whether rings expand dynamically based on total contact count are open questions (see Section 18).

### Weighted Scoring System

The Golden Circle does not rely solely on raw message count. Every interaction type is scored, and predefined relationship tags apply multipliers that weight certain contacts higher.

### Interaction Types That Score Points

All of the following contribute to a contact's Golden Circle position: text messages, voice calls, video calls, belo peek sessions (with duration factoring in --- longer peeks score more), belo circles (video messages), belo pop reactions and comments, GIF and sticker exchanges, emoji reactions, and voice memos.

### Relationship Tags & Multipliers

Users can assign predefined relationship tags to contacts. Each tag carries a preset multiplier. For example, a contact tagged "MOM" might have a 10x multiplier, meaning every interaction with that person scores 10 points instead of 1. This makes it highly likely --- but not guaranteed --- that tagged contacts appear in the inner circles. belo will provide a sufficiently broad set of predefined tags to cover common relationship types.

### Contact Movement & Decay

Contacts do not decay out of the Golden Circle due to inactivity alone. A contact only moves outward if another contact accumulates a higher score and displaces them. There is no minimum interaction threshold to remain in any ring. The recalculation timing is an implementation detail to be determined.

### Group Chat Golden Circle

Group chats have their own separate Golden Circle, distinct from the individual contact circle. A group's weighted score is calculated as the average of all participants' individual tag weights. This means a group containing heavily tagged members will naturally rank higher.

### Displacement Visibility

When a contact is displaced from one ring to another, this movement is invisible to all users. No one is notified that they have been moved.

## 3. Identity & Authenticity

belo enforces real identity as a core design principle. This is not optional or suggested --- it is fundamental to the product's mission of replicating face-to-face recognition in a digital context.

### Real Profile Photos

Users must use real photographs of themselves as profile pictures. Illustrated avatars, cartoons, default silhouettes, and AI-generated images are not permitted. The enforcement mechanism for this policy is an open question (see Section 18) --- options under consideration include AI-based photo verification during onboarding, ID-matching selfie checks, or community-based reporting.

### Real Names

Users must register with their real names. There are no usernames, handles, or display name aliases. This ensures that every conversation happens between identifiable people, reinforcing trust and the real-world communication experience.

### Contact Search

For contacts not visible in the Golden Circle, a search function allows users to quickly find any existing contact. This search is limited to people already in the user's contact list. A separate discovery mechanism exists for finding new people (details in Section 18, Open Questions).

## 4. Ambient AI: Mood Scoring System

belo's Ambient AI is a real-time emotional intelligence layer that analyzes conversations across every communication modality and translates emotional tone into visual feedback. The goal is to make the emotional temperature of a relationship visible at a glance.

### How Mood Scoring Works

An AI model performs sentiment analysis on every interaction. Mood is scored per message or per interaction (a single call, a single video message, etc.), not as a session-level aggregate. The score feeds into two visual systems: chat background color and contact aura.

### Modalities Analyzed

Mood scoring operates across all communication types within belo:

-   **Text messages:** Sentiment analysis of written content.

-   **Voice messages:** Tone analysis of vocal characteristics, not just transcribed text.

-   **Voice calls:** Real-time vocal tone analysis during calls.

-   **Video calls:** Tone analysis from video call audio.

-   **belo peek:** Tone analysis from ephemeral video sessions.

-   **belo circles:** Tone analysis from video messages. Scored once on first send/receipt, not re-scored on replay.

### Aggregation

When multiple modalities produce different mood signals (for example, an angry text followed by a conciliatory voice call), the system uses a weighted average across all interactions. No single modality overrides another; instead, the cumulative emotional picture emerges from the blend.

### Chat Background Color

Based on the real-time mood score, a color from a predefined vector palette is assigned to the chat background. This color shifts dynamically as the conversation's emotional tone changes. The palette maps emotional states to colors, creating an ambient visual layer that communicates mood without requiring the user to think about it.

### Contact Aura

On the Golden Circle home screen, each contact's profile photo is surrounded by a colored glow (aura) that reflects the current mood of your conversation with that person. This allows users to scan their contacts and immediately sense the emotional state of each relationship.

### Update Timing

For live interactions (voice calls, video calls, belo peek), the mood score and associated visual changes (background color, aura) update only after the call or session ends, not during. For text-based interactions, updates occur per message.

### User Visibility

Users do not see numeric mood scores. The mood data is expressed exclusively through visual elements: chat background colors and contact auras. A potential mood dashboard showing personal emotional trends over time is under consideration (see Section 18).

### Privacy & Consent

Users consent to mood scoring once during onboarding. The other person in a conversation is aware that mood analysis occurs as part of belo's standard functionality, but there is no per-call or per-message notification.

### Scope Exception

belo pop posts are not mood scored. Mood scoring is designed to understand the emotional dynamics of conversations between people, not the emotional content of personal social posts.

## 5. Emotional Intelligence

### Emotional Nudges

Emotional nudges are AI-generated prompts that appear after a user sends a message that may not match the emotional weight of the conversation. The system is trained to detect moments where a person may not have put enough effort into responding.

### How Nudges Work

-   **Trigger:** The AI analyzes the message as it is typed (to avoid post-send delays) and evaluates it against multiple factors: message length relative to what was received, response time, and emotional tone mismatch.

-   **Timing:** The nudge appears after the user taps send, not before. The pre-analysis during typing ensures there is no perceptible delay.

-   **User action:** The user sees the nudge and can either acknowledge it and send the message as-is (tap send again), or retype/modify the message.

-   **Privacy:** Nudges are entirely private to the sender. The recipient never knows a nudge was triggered.

-   **Opt-out:** Users can disable nudges in settings.

### What Nudges Detect

The nudge system evaluates all of the following dimensions: short or low-effort replies to emotionally significant messages, dismissive tone in response to vulnerability or seriousness, aggressive escalation when the conversation does not warrant it, and mismatched emotional register on sensitive topics.

### Scope

Whether nudges apply only to one-on-one conversations or also to group chats and flow rooms is an open question (see Section 18). The emotional dynamics of large groups differ significantly from private conversations.

### Mismatch Detection for Inappropriate Content

Separate from emotional nudges, belo includes AI-based detection for nude and inappropriate content. When detected, the content is auto-blocked immediately, and the case is reported to belo's moderation team. Moderators review the flag and can unlock the account if the detection was incorrect. This moderation applies across all media types: photos, videos, belo peek, belo circles, and any shared visual content.

## 6. Compositional AI

### Smart Auto-Fill

Smart auto-fill is inline predictive text that appears as the user types, similar to phone keyboard predictions but trained on the user's personal communication style. It learns exclusively from the user's own conversations within belo (not from external sources like WhatsApp exports or social media). The predictions match the user's voice, vocabulary, and phrasing patterns.

### Full Message Generation

Full message generation is a separate feature (accessed via a dedicated button) that produces a complete message draft in the user's tone and style. Unlike auto-fill, which assists word by word, this feature generates an entire response.

-   **Intent inference:** The AI infers what the user is likely to say based on the conversation context. The user does not need to provide a prompt or instruction.

-   **Editable:** The generated message is a draft that the user can modify before sending.

-   **Powered by digital twin:** Both auto-fill and message generation use the contextual embeddings from the user's digital twin to ensure the output sounds like the user.

### Speech-to-Text

belo includes voice message transcription that converts speech to text, similar to Whisper-based transcription services. This allows users to read voice messages when they cannot listen to audio.

## 7. Digital Twin

The digital twin is belo's core personalization engine. It is the foundation that powers smart auto-fill, full message generation, and the user's personal AI voice across the platform.

### How It Works

The digital twin generates contextual embeddings from the user's conversations over time. These embeddings capture semantic meaning, personality traits, communication patterns, and topical knowledge without storing raw conversation text in model weights. The approach is analogous to giving an actor a set of characteristics and showing them how someone talks, rather than having them memorize a script.

### Key Technical Distinction

belo's digital twin uses contextual embeddings plus context, not model weight training. This is a fundamental architectural difference from systems like ChatGPT or Claude, which rely on context window stuffing, saved text memories, and RAG search. The embedding approach provides semantic understanding with stronger privacy guarantees than weight-level training.

### Contextual Retrieval

When the digital twin is invoked (for auto-fill, message generation, etc.), only relevant embeddings are retrieved based on the current conversation context. If the user is discussing food, food-related personality data and preferences are pulled in; completely unrelated context is excluded. This ensures efficient and accurate personalization.

### Learning Sources

The digital twin learns from all conversation types: one-on-one chats, group chats, and flow rooms. It does not import data from external platforms.

### Progression

The digital twin starts generic and improves over time as more conversations accumulate. There is no minimum threshold before it activates --- it begins building from the first message, with increasing accuracy as the dataset grows.

### User Control

Users cannot view, audit, or selectively modify what the digital twin has learned. Whether users can fully reset their digital twin is an open question (see Section 18).

## 8. belo peek: Ephemeral Video

belo peek is a press-and-hold ephemeral video feature designed for casual, seconds-long face-to-face moments without the formality of a video call.

### How It Works

-   **Initiation:** The initiator presses and holds the peek button. Their own camera activates immediately --- they see themselves while waiting for the other person.

-   **Joining:** The recipient joins by pressing and holding the same button on their end. Both parties now see each other.

-   **Ending:** Releasing the button ends the peek instantly. There is no exit flow, no confirmation dialog --- release and it's over.

-   **Timeout:** If the recipient never joins, the initiator's camera remains active until they release. Implementation of a timeout duration is a design detail to be finalized.

### Chat Indicators

After a peek session, a system message appears in the chat thread recording that a peek occurred, who joined, and for how long (e.g., "Kambar peeked for 4 seconds --- Saeed joined for 3 seconds"). These indicators are clearly formatted as system messages, distinct from user-sent content.

### Golden Circle Impact

Peek sessions contribute to Golden Circle scoring. Longer peeks score more points than shorter ones, reflecting deeper engagement.

### Group Peek

belo peek will initially support only one-on-one sessions. Group peek will be added later.

-   **Display:** In group peek, each participant appears in a small circular video frame (not a grid layout). A maximum of 6 participants are visible at once, showing the most recently active speakers. Users always see themselves.

-   **Capacity:** There is no limit to how many people can join a group peek, but only 6 are visible at any time.

### Mood Scoring

belo peek sessions are mood scored via tone analysis, consistent with all other communication modalities. The score updates after the peek ends.

### Moderation

How to moderate ephemeral live video is an open question (see Section 18). Since peek content is real-time and not stored, traditional content scanning approaches may not apply.

## 9. belo circles: Video Messages

belo circles are short video messages sent within chats, similar to Telegram's video message circles. They are recorded, sent, and displayed as circular video clips within the conversation thread.

### Key Characteristics

-   **Persistent:** Unlike belo peek, circles are not ephemeral. They remain in the chat history and can be replayed.

-   **Length limit:** Similar to Telegram's constraint of approximately 60 seconds.

-   **Mood scoring:** Circles are mood scored once on first send/receipt. Replaying a circle does not trigger re-scoring.

-   **Golden Circle impact:** Sending and receiving circles contributes to contact scoring.

## 10. belo pop: Social Moments

belo pop is belo's social posting feature, similar to WeChat Moments. It provides a space for users to share updates, photos, videos, and text with their contacts.

### Content Types

Pops can include photos, videos, and text --- any combination.

### Visibility & Audience Control

Users set a global visibility preference that controls who can see their pops. This is not a per-post setting --- the same audience rule applies to all pops. Options for audience selection (all contacts, close friends, Golden Circle only, etc.) follow the WeChat Moments model.

### Expiration

Pops disappear automatically after 24 hours, similar to Stories on other platforms.

### Discovery & Indicators

Pops are accessed by pressing and holding on a contact's avatar in the Golden Circle. A visual indicator (such as a ring or glow) appears on the avatar when that person has posted a new, unseen pop. Whether a dedicated feed or timeline for pops should also exist is an open question (see Section 18).

### Interactions

Users can react to and comment on pops. Interaction visibility follows the WeChat Moments model: reactions and comments are only visible to mutual friends of both the poster and the commenter. Users can also reply to a pop privately, similar to Instagram story replies.

### Golden Circle Impact

Pops contribute to Golden Circle scoring only through direct interactions: reacting to or commenting on someone's pop. Merely viewing a pop does not generate points.

### Mood Scoring

Pops are not mood scored. Mood scoring is reserved for interpersonal conversation dynamics, not personal social posts.

## 11. belo flow & openflow: Communities

belo flow is the community system inside belo, providing structured spaces for group interaction beyond standard group chats. There are two variants: flow (private, invite-only) and openflow (public, open to join).

### Structure

Both flow and openflow follow a three-level hierarchy: Flow → Rooms → Chat. A flow is the top-level container. Within a flow, the creator sets up rooms, each of which is a single continuous chat. Users navigate between rooms within a flow.

**flow (Private)**

-   **Access:** Invite-only. New members must be invited by existing members or the creator.

-   **Room creation:** Only the flow creator can create rooms, unless they explicitly grant room-creation privileges to other members.

-   **Ownership:** Tied to the creator's account. Ownership can be transferred by the owner granting full privileges to another member.

**openflow (Public)**

-   **Access:** Open communities that anyone can join.

-   **Structure:** Same Room → Chat hierarchy as private flow.

-   **Discovery:** How users find openflow communities (browse, categories, search, location-based suggestions) is an open question (see Section 18).

### Features Within Rooms

All standard belo features work inside flow rooms: text messaging, voice calls, video calls, belo peek, belo circles, and pinned messages/announcements.

### Location-Based Rooms

Rooms can optionally be linked to physical locations. When a room is linked to a location and users opt in to location sharing (a one-time GPS permission, standard across modern apps), other members can see which users are physically present at that location.

-   **Example:** A "Rochester Soccer" openflow has a room called "Play Soccer" linked to a specific soccer field. Members browsing the room can see Saeed's avatar indicating he is physically at the field right now.

-   **No map:** This is avatar-based presence, not a map interface. Users know which locations rooms are connected to, but there is no visual map for browsing rooms geographically. Whether a map interface should be added is an open question.

-   **Optional:** If a room is not linked to a location, it functions as a normal chat room without any location layer.

### Room Golden Circle

The rooms a user visits most frequently follow the Golden Circle concept, appearing in a prioritized arrangement. This is per-user, not community-wide.

### Simultaneous Access

A user can be a member of multiple flows and openflows, but can only actively view one at a time, similar to how you can only have one direct message conversation open at a time. Users switch between flows via a dedicated flows page/window.

### Roles & Permissions

The detailed roles and permissions structure (admin, moderator, member) for both flow and openflow is an open question (see Section 18).

## 12. Stackview: In-Chat Notes

Stackview is a feature that allows users to open a notes panel within any chat conversation. While in a chat, users can access Stackview to take notes on the conversation, track important information, or maintain personal context. Stackview is available in all chat types: one-on-one conversations, group chats, and flow rooms. Further design details for Stackview are to be determined.

## 13. Standard Messaging

belo includes a full suite of standard messaging features that users expect from any modern communication platform:

-   **Voice calls:** One-on-one and group voice calling.

-   **Video calls:** One-on-one and group video calling.

-   **Photo sharing:** Send and receive photos within conversations.

-   **Video sharing:** Send and receive videos within conversations.

-   **GIFs and stickers:** Access to a defined library of GIFs and stickers. AI-generated stickers are under consideration (see Section 18).

-   **Message reactions:** Emoji reactions on individual messages.

-   **Read receipts ("Seen Now"):** Indicates when a message has been seen. Details on whether this is toggleable and whether it shows timestamps or just status are open questions (see Section 18).

-   **Voice memos:** Record and send audio messages.

### Multi-Device Support

Users can log into belo on multiple devices simultaneously (phone, tablet, etc.). All data, including Golden Circle positions, mood scoring, and conversation history, syncs across devices in real-time.

## 14. Content Moderation & Safety

### Automated Detection

belo uses AI-powered content detection to automatically identify and block nude or inappropriate visual content. When content is flagged, it is blocked immediately (auto-block) and the case is escalated to belo's human moderation team.

### Human Review

Moderation employees review every auto-blocked case. If the AI's judgment was incorrect, the moderator can unlock the affected account and restore access.

### Scope

Content moderation applies across all media types: photos, videos, belo circles, and any shared visual content. The scope of moderation beyond nude content (hate speech, spam, scams) is an open question (see Section 18).

**belo peek Moderation**

How to moderate ephemeral live video (belo peek) is a significant open question. Since peek content is real-time and not stored, standard content scanning workflows may not directly apply. This requires a dedicated solution (see Section 18).

### Blocking

Users can block other users. In a flow or openflow room, blocking someone does not remove you from the room --- both users can remain in the same room. The specific behavior of blocking within shared rooms (whether blocked users' messages are hidden) is a design detail to be finalized.

## 15. Privacy & Consent

-   **Mood scoring consent:** One-time consent during onboarding. No per-interaction notifications.

-   **Location sharing:** One-time opt-in for GPS-based room presence in belo flow. Standard permission prompt.

-   **Emotional nudges:** Private to sender. Can be disabled.

-   **Digital twin:** Learns from user's own conversations only. Uses contextual embeddings, not model weight training.

Data localization, end-to-end encryption, and chat export capabilities are deferred for future specification.

## 16. Platform & Monetization

belo is free to use with no features gated behind payment. Platform details including launch platforms (iOS, Android, desktop), supported languages, and accessibility features are deferred for future specification.

## 17. Future Ecosystem

belo's long-term vision extends beyond messaging into an ecosystem of applications connected through shared digital twin identity:

-   **Financial Intelligence:** A separate application that uses the digital twin's understanding of the user's psycho-type to provide personalized trading and budgeting guidance.

-   **Intelligent Advertising:** Hyper-targeted advertising based on behavioral embeddings rather than traditional demographic targeting.

-   **Ecosystem Data Sharing:** Separate apps connected through shared digital twin identity, with user consent governing what data flows between applications.

All ecosystem features are planned/under investigation. The consent model for data sharing across apps is an open question (see Section 18).

## 18. Open Questions (Elaborated)

The following questions remain unresolved and require decisions before full specification can be completed. Each question includes context on why it matters, what the options are, and what considerations should inform the decision.

## 1. belo peek Moderation

How should belo moderate ephemeral live video content during a belo peek session?

-   **Why it matters:** belo peek is real-time and ephemeral --- video is not stored after the session ends. Standard content moderation workflows rely on scanning uploaded media before or after delivery, which does not apply to a live, unrecorded video stream. Without a solution, peek becomes a potential vector for inappropriate content that bypasses all other moderation systems.

-   **Options to consider:** Real-time frame-by-frame AI scanning during the live stream (technically intensive, adds latency); periodic frame sampling during the session (lighter but less comprehensive); post-session analysis if peek video is briefly buffered server-side before deletion; or relying on user reporting only for live content.

-   **Key tradeoff:** Performance and latency vs. safety coverage. Real-time scanning on devices with limited processing power (30-45% of Central Asian smartphones) may not be feasible without significant server-side infrastructure.

## 2. Golden Circle Ring Sizes

What are the exact sizes of rings beyond the center 2 and inner ring of 6?

-   **Why it matters:** Ring sizes directly affect the visual density of the home screen and how many contacts are "visible" without scrolling or searching. Too few rings with large sizes flatten the hierarchy; too many rings with small sizes create visual clutter.

-   **Options to consider:** A Fibonacci-like progression (2, 6, 12, 24); a consistent doubling (2, 6, 12, 24, 48); or a design-driven approach where ring sizes are determined by what fits comfortably on screen at each radius.

-   **Related question:** At what ring does the interface stop showing individual photos and switch to a more condensed representation?

## 3. Golden Circle Expansion

Does the Golden Circle have a fixed number of rings, or does it expand dynamically based on the user's total number of contacts?

-   **Why it matters:** A user with 20 contacts and a user with 500 contacts have very different needs. Fixed rings might leave the 500-contact user with most contacts invisible; dynamic expansion might make the interface inconsistent across users.

-   **Options to consider:** Fixed maximum rings with overflow to search only; dynamic ring generation up to a maximum; or a hybrid where inner rings are fixed and outer rings adapt.

## 4. Roles & Permissions in flow / openflow

What is the role and permission structure for flow and openflow rooms?

-   **Why it matters:** Community management requires clear authority structures. Without defined roles, flow creators bear all moderation burden. For openflow communities that may grow large, this becomes critical.

-   **Options to consider:** Standard three-tier (owner, moderator, member); more granular permissions (room-level moderators vs. flow-level admins); or a simplified two-tier (creator and everyone else) for initial launch.

-   **Key consideration:** Should the permission structure be identical for flow and openflow, or should openflow have additional moderation tools given its public nature?

## 5. Real Photo & Real Name Enforcement

How does belo verify that users are using real photos and real names?

-   **Why it matters:** Real identity is a core design pillar. Without enforcement, the policy becomes aspirational rather than structural. Fake profiles undermine trust and the face-to-face recognition experience that belo is built around.

-   **Options to consider:** AI-based photo verification during onboarding (liveness check + selfie matching); government ID upload and matching; community-based reporting with human review; or a combination of AI verification at signup with community reporting for ongoing enforcement.

-   **Key tradeoff:** Onboarding friction vs. identity integrity. Heavy verification slows signup; light verification risks fake profiles.

## 6. belo pop Feed

Should belo pop have a dedicated feed or timeline, or is avatar-based access sufficient?

-   **Why it matters:** Currently, pops are accessed by pressing and holding a contact's avatar. This is intimate and intentional, but it means users must individually check each contact for new pops. A dedicated feed would make pop discovery passive and effortless, but risks shifting belo toward a social media feed paradigm that may not align with its communication-first philosophy.

-   **Options to consider:** Avatar-only access (current plan) with strong visual indicators; a dedicated feed accessible from the Golden Circle interface; a hybrid where the Golden Circle surface highlights contacts with new pops in a dedicated ring or indicator bar; or a "pop reel" that plays through all new pops sequentially when accessed.

## 7. Onboarding & Contact Import

How do new users find their existing contacts on belo, and what does the app look like on first launch?

-   **Why it matters:** The first experience determines retention. An empty Golden Circle with no contacts is a dead end. The contact import method also affects growth --- phone number matching (WhatsApp model) creates natural network effects.

-   **Options to consider:** Phone number matching from device contacts (most common); QR code sharing; invite links; or manual search and add. For the empty Golden Circle: pre-populate positions based on phone contact frequency data, show an onboarding tutorial, or use a different interface until sufficient contacts are added.

## 8. Ecosystem & Digital Twin Consent

When digital twin data is shared across the planned ecosystem of apps, is consent per-app or blanket?

-   **Why it matters:** This is a critical privacy and trust decision. Blanket consent is simpler but may alarm users who did not expect their messaging personality data to inform financial trading tools. Per-app consent gives users control but adds friction to the ecosystem experience.

-   **Options to consider:** Per-app opt-in with clear disclosure of what data each app accesses; blanket consent during belo onboarding with the ability to revoke per app later; tiered consent where core personality data is shared broadly but sensitive categories require additional consent.

-   **Related question:** Can users see specifically what embedding data each ecosystem app is accessing? Transparency here builds trust.

## 9. Discovering New People

How do users find and add people who are not already in their contacts?

-   **Why it matters:** The separate search for finding new people is confirmed, but the mechanism is not defined. This affects both organic growth and user safety (discoverability vs. privacy).

-   **Options to consider:** Phone number lookup; QR code scanning (popular in Central Asian markets); nearby discovery via Bluetooth or location; username/handle search (though this conflicts with the real-name policy); or mutual contact suggestions.

-   **Related question:** Can users set their profile to be undiscoverable to strangers?

## 10. Read Receipts ("Seen Now")

Can users toggle read receipts off? Does "Seen Now" show a timestamp or just a status?

-   **Why it matters:** Read receipts are one of the most debated features in messaging. Making them mandatory aligns with belo's transparency philosophy but may deter users who value privacy. The "Seen Now" branding implies real-time awareness.

-   **Options to consider:** Always on (mandatory transparency); toggleable per-user (like WhatsApp); or toggleable per-conversation. For display: just "Seen" status, or "Seen at 3:42 PM" with a timestamp.

## 11. Notifications & Golden Circle Priority

Should notification behavior differ based on a contact's position in the Golden Circle?

-   **Why it matters:** The Golden Circle already reflects relationship priority. Extending that priority to notifications would create a powerful signal-to-noise filter: center contacts get immediate, prominent alerts while outer contacts might be batched or silenced.

-   **Options to consider:** Automatic priority notifications for inner circles with batch/digest for outer rings; user-configurable notification rules per ring; or standard notifications for all contacts with no Golden Circle integration.

## 12. Offline & Low Connectivity Behavior

How should belo function when the user has limited or no internet connectivity?

-   **Why it matters:** Central Asian markets have inconsistent connectivity, especially outside major cities. An app that becomes non-functional offline will lose users. This is not an edge case --- it is a core market condition.

-   **Options to consider:** Message queuing with automatic send on reconnection; offline access to chat history; graceful degradation where AI features (mood scoring, nudges, auto-fill) pause silently and resume on reconnection; or a dedicated offline mode with limited functionality clearly indicated.

## 13. AI-Generated Stickers

Should belo offer stickers generated by AI, potentially using the digital twin?

-   **Why it matters:** AI-generated stickers personalized to the user's style and personality would be a unique differentiator. It aligns with the digital twin philosophy of making every feature feel personal.

-   **Options to consider:** AI-generated sticker packs based on digital twin personality data; user-prompted sticker generation ("make a sticker of me saying\..."); real-time contextual sticker suggestions during conversation; or starting with a curated library and adding AI generation later.

## 14. Digital Twin Portability & Deletion

What happens to contextual embeddings if a user deletes their belo account? Can embeddings be exported?

-   **Why it matters:** With the planned ecosystem of multiple apps sharing digital twin data, account deletion on one platform raises complex questions. Users expect data deletion to be comprehensive, but if the twin lives across multiple apps, deletion from belo might not mean deletion everywhere.

-   **Options to consider:** Full deletion across all ecosystem apps when belo account is deleted; per-app deletion where removing belo only removes belo's contribution to the twin; exportable twin data that users can take to another service; or a "twin vault" that persists independently of any single app.

-   **Related:** Can users reset their digital twin without deleting their account (start fresh)?

## 15. belo flow Map Interface

Should belo flow include a visual map for browsing location-linked rooms geographically?

-   **Why it matters:** Currently, users know which locations rooms are connected to, but there is no map. A map interface would make location-linked rooms more discoverable and visually compelling, especially for openflow communities organized around physical spaces.

-   **Options to consider:** No map (current plan) --- rely on text descriptions and avatar presence indicators; an optional map view within flow that shows rooms plotted geographically; a city-level map in the openflow discovery section showing nearby communities; or a map only within specific room types that are explicitly location-based.

## 16. Group Chat & Flow Room Limits

What is the maximum number of participants in a standard group chat? Does this differ from flow room capacity?

-   **Why it matters:** Group size affects performance, moderation burden, and user experience. Very large groups behave fundamentally differently from small ones. Flow rooms serving as community spaces may need higher limits than personal group chats.

-   **Options to consider:** Standard group chats capped at a lower number (e.g., 50-256) while flow rooms allow larger communities (e.g., 1,000-10,000+); identical limits for both; or tiered limits that increase based on room type or community maturity.

## 17. belo flow / openflow Discovery

How do users find openflow communities to join?

-   **Why it matters:** Without a discovery mechanism, openflow communities rely entirely on word-of-mouth or external sharing. A built-in discovery system drives engagement and makes the community feature self-sustaining.

-   **Options to consider:** Search by keyword or topic; browse by category (sports, education, local, etc.); location-based suggestions showing nearby openflows; algorithmic recommendations based on user interests and digital twin data; trending/popular communities; or a combination.

## 18. Emotional Nudges Scope

Should emotional nudges apply in group chats and flow rooms, or only in one-on-one conversations?

-   **Why it matters:** Emotional dynamics differ drastically between intimate one-on-one conversations and group settings. A short reply in a busy 20-person group chat is normal; the same reply in a private conversation with a close friend might be dismissive. Applying nudges uniformly could generate false positives in group contexts.

-   **Options to consider:** One-on-one only (safest, fewest false positives); one-on-one plus small group chats (under a threshold like 5 members); all chat types with group-size-adjusted sensitivity; or user-configurable per chat type.

## 19. Mood Scoring Dashboard

Should users have access to a personal dashboard showing mood trends over time?

-   **Why it matters:** Currently, mood data is expressed only through visual auras and backgrounds --- ambient and in-the-moment. A dashboard would add a reflective dimension, letting users observe patterns in their emotional communication over days, weeks, or months.

-   **Options to consider:** No dashboard (keep mood purely ambient and visual); a personal-only dashboard showing your mood trends across all conversations; per-conversation mood history graphs; or a simple weekly/monthly emotional summary notification.

-   **Key consideration:** This could be a powerful self-awareness tool, but it could also create anxiety if users obsess over mood metrics. Design should encourage healthy reflection, not score optimization.

## 20. Mood Granularity

How many distinct mood states does the scoring system recognize?

-   **Why it matters:** The granularity of mood detection directly affects the richness of the aura/background color system and the accuracy of emotional nudges. Too few states (positive/negative) oversimplify; too many create noise.

-   **Options to consider:** A simple three-state spectrum (positive, neutral, negative); a five-point scale (very positive, positive, neutral, negative, very negative); discrete emotion categories (joy, sadness, anger, anxiety, excitement, calm, affection, frustration); or a multi-dimensional model combining valence (positive/negative) with arousal (high/low energy).

-   **Key consideration:** The color palette must map cleanly to whatever granularity is chosen. More states require more distinguishable colors.

## 21. Content Moderation Scope

Beyond nude content detection, what other content categories should be automatically moderated?

-   **Why it matters:** Nude content is one category, but messaging platforms face a much broader spectrum of harmful content: hate speech, spam, scams, phishing links, graphic violence, misinformation, and harassment. The moderation scope affects both user safety and the resources required to operate the platform.

-   **Options to consider:** Start narrow with nude content only and expand based on user reports; launch with a broader set including hate speech, spam, and scam detection; partner with established content moderation APIs for multi-category coverage; or build custom models aligned with Central Asian cultural and linguistic contexts.

-   **Key consideration:** Central Asian markets have specific linguistic diversity (Kazakh, Russian, Uzbek, Kyrgyz, Tajik, Turkmen) that off-the-shelf moderation models may not handle well. Custom training may be necessary.
