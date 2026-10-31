# Nguvu Pad — UI/UX Pitch Notes

About 6 minutes of slides, then a 2-minute live demo. The slide deck is "Nguvu Pad — UI/UX Design Pitch".

| # | Slide | Time | Line to land |
| --- | --- | --- | --- |
| 1 | Cover | 0:15 | "One app: guests through the door fast, the room voting, the organizer seeing it all." |
| 2 | The brief | 0:30 | "Three jobs on one night. Everything we designed serves one of them." |
| 3 | Users | 0:40 | "One hand at the door, five seconds in the seat, a glance for the organizer." |
| 4 | Principles | 0:40 | "No confirm dialogs: a confirm costs every guest a tap; Undo only costs the rare mistake." |
| 5 | Visual language | 0:40 | "Orange means *act*, green means *done*: colour carries meaning." |
| 6 | Usher screen | 1:00 | Three banners: green done, amber already in, red not found. |
| 7 | Poll screen | 0:45 | "Whole row is the target; Submit sits where the thumb already is." |
| 8 | Organizer screen | 0:45 | "Size follows importance; the leader differs in lightness, not just hue." |
| 9 | Accessibility | 0:30 | 48 px targets; 16 px inputs so iPhones don't zoom. |
| 10 | Edge states | 0:30 | "Good UX is what happens when things go wrong." |
| 11 | Scope | 0:30 | Name the localStorage limit before a judge does. |
| 12 | Close | 0:15 | "Fast at the door. Easy in the seat. Clear for the organizer." |

## New since the deck: mention in the demo

- **Two-role sign-in:** attendees join in one tap; organizers use email + PIN.
- **Rich polls:** organizers add an image or video to a question and can use **picture answers**, which most poll tools don't offer.
- **Attendee suggestions:** the room posts and upvotes ideas, and organizers mark them noted.

## Likely judge questions

- **Why no confirmation before check-in?** Speed in the queue; Undo covers mistakes; the amber warning stops double entry.
- **Several ushers / Wi-Fi drops?** Today it's one browser (the brief allowed localStorage). The Supabase version adds sync and an offline queue.
- **How did you prioritise?** The client's worst case is a jammed door, so we built usher, then poll, then organizer.
- **Accessible?** 48 px targets, 4.5:1 contrast, colour + icon + words for every status, reduced-motion support.

## Demo script

See the README → "Demo script (2 minutes)".
