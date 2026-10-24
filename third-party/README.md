# Event Calendar attribution

Calendar month interval generation and week grouping are adapted from https://github.com/origin-space/event-calendar, components/event-calendar/month-view.tsx. The calendar toolbar and view navigation follow that component's structure. The Vite adaptation removes drag-and-drop editing and popups, uses full-page date routes, and adds responsive styling. Retained MIT terms are in event-calendar-LICENSE.md.

# Anveshan attribution

Background texture, timeline structure, SVG curve, original example milestones, pencil/robot illustrations, logo, and timeline display fonts are adapted/copied from https://github.com/pallavithegod/Anveshan. Relevant source files: src/app/globals.css, src/components/timeline/*, src/components/ui/timeline-effect.tsx, and src/config/timeline/index.ts. The Next.js and Motion implementation is adapted to Vite and the existing GSAP ScrollTrigger setup. MIT terms are retained in Anveshan-LICENSE.txt. Local assets are in public/anveshan; editable copied milestones are in src/timeline-data.ts.
