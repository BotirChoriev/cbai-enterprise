-- CBAI — Evidence bookmarking (Platform Activation mission, "Close the final documented product
-- gaps"). The bookmarks table's entity_kind CHECK constraint only allowed the 5 kinds a Project
-- can also link as a "Related Entity" (country/company/university/research_topic/project) —
-- Evidence bookmarking is a general "saved for later" reference, not a Related Entity, so it gets
-- its own allowed value here rather than being added to project_entity_links, which stays scoped
-- to exactly the 5 original kinds.
--
-- Run after 0001/0002/0003 against the same project.

alter table public.bookmarks
  drop constraint if exists bookmarks_entity_kind_check;

alter table public.bookmarks
  add constraint bookmarks_entity_kind_check
  check (entity_kind in ('country', 'company', 'university', 'research_topic', 'project', 'evidence'));
