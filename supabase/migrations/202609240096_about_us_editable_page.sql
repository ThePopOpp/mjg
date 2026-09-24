-- Seed "About Us" — an Editor-owned twin of the code-owned /about page.
--
-- WHY: /about is a hand-built static page (main/about-us.html). It has no block
-- model, so it cannot be edited from the dashboard. This creates a second page
-- at /about-us carrying the same content, assembled entirely from approved
-- blocks, so every word, button, image and section is editable in CMS → Editor.
--
-- It lands as a DRAFT and is deliberately NOT added to any navigation menu:
-- review it in the editor's preview first, then publish when you are happy.
--
-- FIDELITY: the content is a faithful copy; the rendering is not pixel-identical.
-- The static page uses bespoke CSS (.about-hero, .about-card, .about-timeline);
-- this one renders through the shared block components and the same design
-- tokens. That is the trade that makes it editable — a pixel clone would mean
-- re-freezing it into hand-written markup.
--
-- Idempotent: skipped entirely if a page already owns the /about-us address, so
-- re-running migrations can never clobber later edits.

do $$
declare
  content jsonb;
begin
  if exists (select 1 from public.website_pages where slug = 'about-us') then
    raise notice 'about-us already exists — leaving it untouched.';
    return;
  end if;

  content := jsonb_build_object(
    'version', 1,
    'blocks', jsonb_build_array(

      -- Hero: copy left, family photo right.
      jsonb_build_object(
        'id', 'about_hero',
        'type', 'hero',
        'props', jsonb_build_object(
          'eyebrow', 'About Michael',
          'title', 'Michael J. Gauthier',
          'description', 'CFP® · Author · Financial Steward — “Using God-given resources for God-given purposes.”',
          'primaryCta', jsonb_build_object('label', 'Join the Movement', 'href', '/join-the-movement', 'newTab', false),
          'secondaryCta', jsonb_build_object('label', 'Contact Michael', 'href', '/contact', 'newTab', false),
          'imageUrl', '/media/Gauthier-Family-840x1020-1.png',
          'imageAlt', 'The Gauthier Family',
          'layout', 'split',
          'background', 'default', 'spacing', 'lg', 'width', 'standard', 'align', 'left', 'hideOnMobile', false
        )
      ),

      -- Stats bar.
      jsonb_build_object(
        'id', 'about_stats',
        'type', 'stats',
        'props', jsonb_build_object(
          'title', '',
          'items', jsonb_build_array(
            jsonb_build_object('value', '2013',  'label', 'Left Wall Street to follow his calling'),
            jsonb_build_object('value', 'CFP®',  'label', 'Certified Financial Planner'),
            jsonb_build_object('value', '25K',   'label', 'People to educate & inspire'),
            jsonb_build_object('value', '$1B+',  'label', 'Impact investment goal')
          ),
          'background', 'muted', 'spacing', 'md', 'width', 'standard', 'align', 'center', 'hideOnMobile', false
        )
      ),

      -- My Story / A Leap of Faith.
      jsonb_build_object(
        'id', 'about_story',
        'type', 'richText',
        'props', jsonb_build_object(
          'title', 'A Leap of Faith',
          'content', E'Hello, I''m Michael J. Gauthier, CFP®. My journey in financial planning has been one of faith, growth, and a deep desire to help others.\n\nIn 2013, I took a leap of faith and left my secure job at a national Wall Street firm to create something new. This calling led to the founding of **Strategic Income Group** — a wealth management company focused on empowering people from all walks of life to become better stewards of their money.\n\nSince then, my mission has continued to evolve. I am passionate about teaching others how to use their *God-given resources for God-given purposes*. Over the years, my faith journey has profoundly shaped my work and life.\n\nThrough *The Stewardship Blueprint*, I''m sharing the framework I wish I''d had earlier — a practical, faith-rooted guide to designing a life of meaning, generosity, and lasting impact.',
          'background', 'default', 'spacing', 'md', 'width', 'standard', 'align', 'left', 'hideOnMobile', false
        )
      ),

      jsonb_build_object(
        'id', 'about_story_buttons',
        'type', 'buttonGroup',
        'props', jsonb_build_object(
          'items', jsonb_build_array(
            jsonb_build_object('label', 'Read The Blueprint', 'href', '/resources', 'newTab', false, 'style', 'primary'),
            jsonb_build_object('label', 'Our Mission', 'href', '/mission', 'newTab', false, 'style', 'outline')
          ),
          'background', 'default', 'spacing', 'sm', 'width', 'standard', 'align', 'left', 'hideOnMobile', false
        )
      ),

      -- The two side cards from the bio grid.
      jsonb_build_object(
        'id', 'about_cards',
        'type', 'cardGrid',
        'props', jsonb_build_object(
          'title', '',
          'description', '',
          'items', jsonb_build_array(
            jsonb_build_object(
              'title', 'Why I''m Writing This Book',
              'description', 'The Stewardship Blueprint — After years in faith-based financial planning, I saw a pattern: many people pursue money and status but feel unsatisfied. I began writing this book to help others discover what it means to be created for more — and to stop building the wrong life.',
              'imageUrl', '', 'imageAlt', '',
              'href', '/resources', 'linkLabel', 'Start Designing Your Life'
            ),
            jsonb_build_object(
              'title', 'Strategic Income Group',
              'description', E'Professional Background — Founded to help families build a solid financial foundation rooted in Biblical principles: not just wealth accumulation, but purposeful stewardship and generosity.\n\nCertified Financial Planner · Wealth Management · Biblical Finance · Impact Investing',
              'imageUrl', '', 'imageAlt', '',
              'href', 'tel:+14804667070', 'linkLabel', '(480) 466-7070'
            )
          ),
          'columns', '2',
          'background', 'default', 'spacing', 'md', 'width', 'standard', 'align', 'left', 'hideOnMobile', false
        )
      ),

      jsonb_build_object(
        'id', 'about_divider',
        'type', 'divider',
        'props', jsonb_build_object(
          'style', 'line',
          'background', 'default', 'spacing', 'sm', 'width', 'standard', 'align', 'left', 'hideOnMobile', false
        )
      ),

      -- Scripture.
      jsonb_build_object(
        'id', 'about_scripture',
        'type', 'quote',
        'props', jsonb_build_object(
          'quote', 'Command those who are rich in this present world not to be arrogant nor to put their hope in wealth, which is so uncertain, but to put their hope in God, who richly provides us with everything for our enjoyment. Command them to do good, to be rich in good deeds, and to be generous and willing to share. In this way, they will lay up treasure for themselves as a firm foundation for the coming age, so that they may take hold of the life that is truly life.',
          'attribution', 'One of my favourite scriptures · 1 Timothy 6:17–19 (New International Version)',
          'background', 'muted', 'spacing', 'lg', 'width', 'narrow', 'align', 'left', 'hideOnMobile', false
        )
      ),

      -- The journey timeline.
      jsonb_build_object(
        'id', 'about_timeline',
        'type', 'timeline',
        'props', jsonb_build_object(
          'eyebrow', 'The Journey',
          'title', 'A Life Designed, Not Drifted',
          'description', '',
          'items', jsonb_build_array(
            jsonb_build_object('marker', 'Early Career', 'title', 'Wall Street & National Firms',
              'description', 'Built foundational expertise in wealth management and financial planning at a national Wall Street firm — gaining the skills that would later serve a very different mission.'),
            jsonb_build_object('marker', '2013', 'title', 'The Leap of Faith',
              'description', 'Left the security of a prestigious firm to follow his calling — founding Strategic Income Group with a singular conviction: that financial planning, rooted in Biblical principles, can transform lives and communities.'),
            jsonb_build_object('marker', 'Present', 'title', 'The Stewardship Blueprint',
              'description', 'Now writing the book he wishes existed — a practical, faith-rooted framework for designing a life of purpose, generosity, and lasting impact. Chapters 1 & 2 are live and available now.'),
            jsonb_build_object('marker', 'The Goal', 'title', '25,000 People. $1 Billion in Impact.',
              'description', 'The mission is clear and ambitious: to educate and inspire 25,000 people to positively transform communities through charitable contributions and impact investments — totaling $1 billion or more.')
          ),
          'background', 'default', 'spacing', 'lg', 'width', 'standard', 'align', 'left', 'hideOnMobile', false
        )
      ),

      -- Join the movement. The newsletter block is a REAL working signup (it posts
      -- to the same endpoint the rest of the site uses), where the static page's
      -- form only opened a modal.
      jsonb_build_object(
        'id', 'about_join',
        'type', 'newsletter',
        'props', jsonb_build_object(
          'title', 'Join Me as I Write The Blueprint',
          'description', 'Get early chapter drafts, reflection worksheets, and blueprint action steps delivered to your inbox — before anyone else sees them.',
          'submitLabel', 'Join the Journey',
          'consentNote', 'No spam. Your info is used only to send Blueprint updates. Unsubscribe anytime.',
          'background', 'ink', 'spacing', 'md', 'width', 'standard', 'align', 'center', 'hideOnMobile', false
        )
      ),

      -- Same ink background as the block above so the two read as one dark band,
      -- the way the secondary link sits inside the card on the original page.
      jsonb_build_object(
        'id', 'about_join_secondary',
        'type', 'buttonGroup',
        'props', jsonb_build_object(
          'items', jsonb_build_array(
            jsonb_build_object('label', 'Our Mission', 'href', '/mission', 'newTab', false, 'style', 'outline')
          ),
          'background', 'ink', 'spacing', 'sm', 'width', 'standard', 'align', 'center', 'hideOnMobile', false
        )
      )
    )
  );

  insert into public.website_pages (
    title, slug, page_type, template, status,
    draft_content, published_content,
    seo_title, seo_description,
    navigation_visibility, has_unpublished_changes, last_edited_source
  ) values (
    'About Us', 'about-us', 'page', 'standard', 'draft',
    content, null,
    'About Michael J. Gauthier | CFP®, Author & Financial Steward',
    'Michael J. Gauthier left Wall Street in 2013 to found Strategic Income Group and help people use God-given resources for God-given purposes.',
    false, true, 'manual'
  );

  insert into public.website_audit_logs (actor_type, action, resource_type, summary, metadata)
  values ('user', 'page.created', 'page',
          'Seeded "About Us" as an editable copy of the code-owned /about page.',
          jsonb_build_object('slug', 'about-us', 'source', 'main/about-us.html', 'migration', '202609240096'));
end $$;
