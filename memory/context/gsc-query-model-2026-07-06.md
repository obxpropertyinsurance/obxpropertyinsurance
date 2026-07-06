# GSC Query Model - 2026-07-06

## Source

- Export: `/Users/user/Downloads/obxncinsurance.com-Performance-on-Search-2026-07-06.zip`
- GSC filter in export: Web search, last 3 months
- Measured query rows: 21
- Measured totals in `Queries.csv`: 1 click, 37 impressions
- Screenshot seed rows not present in `Queries.csv`: south shore homeowners coverage, south shore vacation home insurance, south shore property insurance, south shore homeowners insurance policy, south shore homeowners liability insurance, north shore homeowners coverage
- External geography references:
  - Outer Banks Visitors Bureau towns and villages: https://www.outerbanks.org/plan-your-trip/explore/towns-and-villages/
  - Dare County municipalities, villages, and areas: https://www.darenc.gov/about and https://www.darenc.gov/about/towns-villages-areas
  - Visit NC Currituck/Corolla/Carova context: https://www.visitnc.com/story/bask-on-the-outer-banks-beaches-of-corolla-and-carova

## Observed Clusters

| Cluster | Evidence | Action |
| --- | --- | --- |
| Outer Banks / OBX broad | `outer banks insurance`, `outer banks home insurance`, `homeowners insurance outer banks nc`, `obx insurance` | Keep broad hubs strong and internally link to town, shore coverage, homeowners, property, wind, flood, and rental pages. |
| Kitty Hawk | 9 impressions across `kitty hawk homeowners insurance`, `kitty hawk home insurance`, `homeowners insurance in kitty hawk`, `home insurance in kitty hawk`; weak positions 60-81.5 | Add exact phrase coverage, policy, liability, vacation home, and `in Kitty Hawk` language to the Kitty Hawk page. |
| Kill Devil Hills | 6 impressions across `homeowners insurance in kill devil hills`, `home insurance in kill devil hills`, `kill devil hills home insurance`, `kill devil hills homeowners insurance`; positions 29-46 | Add exact phrase coverage, policy, liability, vacation home, and `in Kill Devil Hills` language to the KDH page. |
| Shore coverage / policy | Screenshot and one CSV row show `north shore home insurance coverage`, `south shore homeowners coverage`, `south shore homeowners policy`, `south shore property insurance`, `south shore vacation home insurance`; positions 15-21 | Build one useful OBX shore coverage hub that disambiguates North Shore/South Shore searches rather than creating misleading non-OBX doorway pages. |
| North Carolina vacation / roof / elevation | `vacation home insurance north carolina`, `roof age insurance north carolina`, `raleigh elevation certificate` variants | Strengthen existing statewide vacation-home, roof-age, and elevation pages, but do not create non-service-area city pages unless the business intentionally expands beyond OBX. |

## Covered Geography

The SEO model now covers the primary Outer Banks towns and villages already on the site plus additional Dare County areas named by official county sources:

| Area group | Pages/terms covered |
| --- | --- |
| Currituck / Northern Outer Banks | Carova, Carova Beach, Swan Beach, North Swan Beach, Ocean Beach, Corolla, Whalehead, Ocean Sands, Pine Island, Corolla Light, Currituck Club |
| Northern Dare | Duck, Southern Shores, Kitty Hawk |
| Central Outer Banks | Kill Devil Hills, KDH, Nags Head, South Nags Head, Colington Island, Colington Harbour |
| Roanoke Island | Manteo, Wanchese, Roanoke Island |
| Hatteras Island | Rodanthe, Waves, Salvo, Avon, Buxton, Cape Hatteras, Frisco, Hatteras, Hatteras Village, Tri-Villages |
| Hyde County / Ocracoke | Ocracoke, Ocracoke Island |
| Dare County mainland | Manns Harbor, Stumpy Point, East Lake |

## Predictive Expansion Rules

For every OBX town/area page, cover these query families naturally inside one useful local page:

- `{town} home insurance`
- `{town} homeowners insurance`
- `home insurance in {town}`
- `homeowners insurance in {town}`
- `{town} property insurance`
- `{town} homeowners coverage`
- `{town} home insurance coverage`
- `{town} homeowners policy`
- `{town} homeowners insurance policy`
- `{town} homeowners liability insurance`
- `{town} vacation home insurance`
- `{town} vacation rental insurance`
- `{town} second home insurance`
- `{town} beach house insurance`
- `{town} rental property insurance`
- `{town} landlord insurance`
- `{town} condo insurance`
- `{town} dwelling fire insurance`
- `{town} home insurance quotes`
- `{town} homeowners insurance quotes`
- `{town} home insurance rates`
- `{town} homeowners insurance rates`
- `{town} insurance agent`
- `{town} insurance agency`
- `{town} home insurance near me`
- `{town} homeowners insurance near me`
- `{town} flood insurance`
- `{town} flood zone insurance`
- `{town} elevation certificate insurance`
- `{town} wind insurance`
- `{town} wind and hail insurance`
- `{town} hurricane insurance`
- `{town} roof age insurance`

Apply the same families to high-signal aliases, county names, and regional phrases when relevant:

- Northern Outer Banks
- Central Outer Banks
- Hatteras Island
- Roanoke Island
- Ocracoke Island
- Dare County
- Currituck County
- Hyde County

## Guardrail

Do not create dozens of thin city/term doorway pages. Add term variants to strong, navigable town/area pages and create cluster pages only when the search intent is meaningfully different, such as the shore coverage hub. Queries for Raleigh or Mount Holly appeared in GSC, but they are outside the current OBX service focus and should not become landing pages unless the business intentionally expands outside the Outer Banks.
