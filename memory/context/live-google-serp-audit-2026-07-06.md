# Live Google SERP Audit - July 6, 2026

## Method

- Ran live Google searches in a rendered browser session.
- Query parameters for the main sample: `hl=en`, `gl=us`, `pws=0`, `num=10`.
- Also ran `site:obxncinsurance.com` probes to see which OBXNCInsurance.com URL Google associates with each query.
- SERPs are volatile and localized; this sample did not reproduce the user's personalized screenshot for `homeowners insurance outer banks nc`.

## Query Findings

| Query | Our Visible Result In Clean Top 10 | Main Competitor/Result Types |
| --- | --- | --- |
| homeowners insurance outer banks nc | Not in clean top 10 | Weatherly, Outer Banks Insurance, Nationwide agent page, Yelp, Mollie Fearing, Gray Berryman PDF, State Farm agent, OuterBanksHome directory |
| outer banks home insurance | Not in clean top 10 | Outer Banks Insurance, Weatherly, BayCoast, Gray Berryman PDF, OuterBanksHome, Reddit, Midgett, Yelp |
| outer banks insurance | Not in clean top 10 | Outer Banks Insurance, Gray Berryman PDF, travel insurance/vacation rental brands, health insurance, Yelp, Facebook |
| obx insurance | Homepage appeared #2 | Outer Banks Insurance, OBXNCInsurance.com homepage, Yelp, State Farm, Gray Berryman PDF, Weatherly |
| kitty hawk homeowners insurance | Not in clean top 10 | Towne Insurance, Midgett, Nationwide, TGS programmatic city page, Yelp, State Farm, IZC programmatic city page |
| kitty hawk home insurance | Not in clean top 10 | Towne Insurance, Midgett, Nationwide, State Farm, TGS, Yelp, OuterBanksHome, IZC |
| homeowners insurance in kitty hawk | Not in clean top 10 | Towne Insurance, Midgett, State Farm, Nationwide, Yelp, TGS, OuterBanksHome, IZC |
| kill devil hills home insurance | Not in clean top 10 | Weatherly, TGS programmatic city page, Nationwide, Yelp, Elite Insurance, OuterBanksHome, BBB, Insurox |
| homeowners insurance in kill devil hills | Not in clean top 10 | Weatherly, Nationwide, Yelp, TGS, BBB, Outer Banks Insurance, OuterBanksHome, Liberty Mutual agent |
| southern shores homeowners insurance | `/southern-shores-home-insurance/` appeared #2 | South Shore Insurance, OBXNCInsurance.com, Southern Oak, Yelp, Goosehead, unrelated South Shore brands |
| outer banks vacation rental insurance | Not in clean top 10 | Mostly guest travel-insurance pages from OBX vacation rental companies |
| roof age insurance north carolina | Not in clean top 10 | Roofing contractors, underwriting guideline pages, HOAIC, FORTIFIED, Facebook |
| north shore home insurance coverage | Not in clean top 10 | Non-OBX North Shore insurance/coverage pages and generic homeowners coverage explainers |
| south shore homeowners coverage | Not in clean top 10 | Non-OBX South Shore insurance brands and generic homeowners coverage explainers |

## Site Architecture Probes

| Site Query | Google's First OBXNCInsurance.com Result |
| --- | --- |
| site:obxncinsurance.com homeowners insurance outer banks nc | Homepage, then `/outer-banks-homeowners-insurance/` |
| site:obxncinsurance.com outer banks home insurance | Homepage, then `/outer-banks-home-insurance/` |
| site:obxncinsurance.com obx insurance | Homepage |
| site:obxncinsurance.com kitty hawk homeowners insurance | `/kitty-hawk-home-insurance/` |
| site:obxncinsurance.com homeowners insurance in kitty hawk | `/kitty-hawk-home-insurance/` |
| site:obxncinsurance.com kill devil hills home insurance | `/kill-devil-hills-home-insurance/` |
| site:obxncinsurance.com southern shores homeowners insurance | `/southern-shores-home-insurance/` |
| site:obxncinsurance.com outer banks vacation rental insurance | `/obx-vacation-rental-insurance/` |
| site:obxncinsurance.com roof age insurance north carolina | `/obx-roof-age-insurance/` |
| site:obxncinsurance.com south shore homeowners coverage | Homepage only; new shore coverage hub is live but not yet reflected in Google's index. |

## Architecture Conclusions

- Town-query architecture is directionally correct: Google associates Kitty Hawk, Kill Devil Hills, and Southern Shores site probes with their intended town pages.
- Broad homeowners intent had homepage/topic-page ambiguity. The homepage title and H1 were exact-match `Outer Banks Homeowners Insurance`, which competed with `/outer-banks-homeowners-insurance/`.
- The homepage should act as the broad brand/category hub for `obx insurance`, `Outer Banks insurance`, and conversion-intent searches.
- `/outer-banks-homeowners-insurance/` should own exact homeowners-intent queries such as `homeowners insurance outer banks nc`.
- The new shore hub should remain a disambiguation/capture page because live Google results for `north shore` and `south shore` are not OBX-specific.

## Action Taken

- Repositioned the homepage metadata, H1, and static fallback from exact homeowners intent to broad `Outer Banks insurance review`.
- Left the dedicated homeowners page as the exact-match page for broad homeowners-insurance queries.
