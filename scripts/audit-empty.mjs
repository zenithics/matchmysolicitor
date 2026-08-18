import pg from 'pg';
const c=new pg.Client({connectionString:process.env.DATABASE_URI,ssl:{rejectUnauthorized:false}});
await c.connect();
const pairs=[['pages_blocks_faq','pages_blocks_faq_items'],['pages_blocks_features','pages_blocks_features_features'],
['pages_blocks_testimonials','pages_blocks_testimonials_testimonials'],['pages_blocks_how_it_works','pages_blocks_how_it_works_steps'],
['pages_blocks_timeline','pages_blocks_timeline_events'],['pages_blocks_pricing','pages_blocks_pricing_plans'],
['pages_blocks_team_grid','pages_blocks_team_grid_members'],['pages_blocks_logo_carousel','pages_blocks_logo_carousel_logos'],
['pages_blocks_cta','pages_blocks_cta_links'],['pages_blocks_enquiry_wizard','pages_blocks_enquiry_wizard_bullets'],
['pages_blocks_hero_split','pages_blocks_hero_split_links'],['pages_blocks_image_gallery','pages_blocks_image_gallery_images']];
for(const [b,ch] of pairs){
  const {rows}=await c.query(`select p.slug, b.id from ${b} b join pages p on p.id=b._parent_id where not exists (select 1 from ${ch} s where s._parent_id=b.id)`);
  if(rows.length) console.log(b, rows.map(r=>r.slug).join(', '));
}
const {rows:cc}=await c.query("select p.slug from pages_blocks_content b join pages p on p.id=b._parent_id where not exists (select 1 from pages_blocks_content_columns c where c._parent_id=b.id)");
if(cc.length) console.log('content with no columns:', cc.map(r=>r.slug).join(', '));
await c.end();
