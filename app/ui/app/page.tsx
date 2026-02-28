import Link from "next/link";
import { getFeaturedProjects, getRecommendedProjects, getPopularProjects, type Project } from "../lib/api";

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-green-100 border-2 border-dashed border-green-200 flex flex-col items-center justify-center text-green-300 gap-1 ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs">Image placeholder</span>
    </div>
  );
}

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = Math.min(Math.round((raised / goal) * 100), 100);
  return (
    <div className="w-full bg-green-100 rounded-full h-1.5 overflow-hidden">
      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
      {label}
    </span>
  );
}

// ─── Card variants ────────────────────────────────────────────────────────────

/** Large horizontal card used in the Featured section */
function FeaturedCard({ project }: { project: Project }) {
  const pct = Math.min(Math.round((project.raised / project.goal) * 100), 100);
  return (
    <Link href={project.redirect_link ?? "/campaign"} className="group flex flex-col md:flex-row bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {project.front_pic ? (
        <img src={project.front_pic} alt={project.title} className="md:w-[28rem] h-64 md:h-auto flex-shrink-0 object-cover" />
      ) : (
        <ImagePlaceholder className="md:w-[28rem] h-64 md:h-auto flex-shrink-0" />
      )}

      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CategoryPill label={project.category} />
            {project.badge && (
              <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-0.5 rounded-full">
                {project.badge}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-green-950 group-hover:text-green-700 transition-colors mb-1">
            {project.title}
          </h3>
          <p className="text-sm text-green-600 mb-3">by {project.creator}</p>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{project.description}</p>
        </div>

        <div className="mt-5">
          <ProgressBar raised={project.raised} goal={project.goal} />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>
              <span className="font-bold text-green-700">{project.raised.toLocaleString()} XRP</span> raised of{" "}
              {project.goal.toLocaleString()} XRP
            </span>
            <span>{pct}%</span>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span>{project.backers.toLocaleString()} backers</span>
            <span>·</span>
            <span>{project.days_left} days left</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Standard vertical card used in Recommended / Popular sections */
function ProjectCard({ project }: { project: Project }) {
  const pct = Math.min(Math.round((project.raised / project.goal) * 100), 100);
  return (
    <Link href={project.redirect_link ?? "/campaign"} className="group flex flex-col bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {project.front_pic ? (
        <img src={project.front_pic} alt={project.title} className="aspect-video w-full object-cover" />
      ) : (
        <ImagePlaceholder className="aspect-video w-full" />
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <CategoryPill label={project.category} />
          {project.badge && (
            <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-0.5 rounded-full">
              {project.badge}
            </span>
          )}
        </div>
        <h3 className="font-bold text-green-950 group-hover:text-green-700 transition-colors mb-0.5 leading-snug">
          {project.title}
        </h3>
        <p className="text-xs text-green-600 mb-3">by {project.creator}</p>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">{project.description}</p>

        <div className="mt-4">
          <ProgressBar raised={project.raised} goal={project.goal} />
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span>
              <span className="font-bold text-green-700">{project.raised.toLocaleString()} XRP</span>
            </span>
            <span>{pct}% of {project.goal.toLocaleString()}</span>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span>{project.backers.toLocaleString()} backers</span>
            <span>·</span>
            <span>{project.days_left}d left</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Compact horizontal row used in the Popular section list view */
function PopularCard({ project, rank }: { project: Project; rank: number }) {
  const pct = Math.min(Math.round((project.raised / project.goal) * 100), 100);
  return (
    <Link href={project.redirect_link ?? "/campaign"} className="group flex gap-4 bg-white rounded-xl border border-green-100 p-4 hover:shadow-sm transition-shadow items-start">
      <span className="text-2xl font-black text-green-200 w-7 text-center flex-shrink-0 mt-0.5">
        {rank}
      </span>
      {project.front_pic ? (
        <img src={project.front_pic} alt={project.title} className="w-16 h-16 rounded-lg flex-shrink-0 object-cover" />
      ) : (
        <ImagePlaceholder className="w-16 h-16 rounded-lg flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <CategoryPill label={project.category} />
        </div>
        <h3 className="font-bold text-green-950 group-hover:text-green-700 transition-colors text-sm leading-snug truncate">
          {project.title}
        </h3>
        <p className="text-xs text-green-600 mb-2">by {project.creator}</p>
        <ProgressBar raised={project.raised} goal={project.goal} />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{project.raised.toLocaleString()} XRP raised</span>
          <span>{pct}% · {project.days_left}d left</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featured, recommended, popular] = await Promise.all([
    getFeaturedProjects(),
    getRecommendedProjects(),
    getPopularProjects(),
  ]);

  return (
    <div className="min-h-screen bg-green-50 font-sans">

      {/* ── NAV ── */}
      <nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-300" />
          <span className="font-bold text-lg tracking-wide">XRP Creates</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-green-800 rounded-full px-3 py-1.5 flex-1 max-w-sm mx-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects…"
            className="bg-transparent text-sm text-white placeholder-green-400 outline-none w-full px-2"
          />
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="#" className="hidden md:block hover:text-green-300 transition-colors">Discover</a>
          <a href="#" className="hidden md:block hover:text-green-300 transition-colors">Start a Project</a>
          <button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold px-5 py-2 rounded-full text-sm transition-colors">
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <section className="bg-green-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Powered by XRP Ledger</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Bring Creative Projects<br />to Life with XRP.
            </h1>
            <p className="text-green-200 text-lg mb-8 max-w-lg">
              Back groundbreaking ideas from artists, musicians, and makers worldwide — with instant XRP payments and built-in transparency.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#featured" className="bg-green-400 hover:bg-green-300 text-green-950 font-bold px-7 py-3 rounded-full transition-colors shadow-lg">
                Explore Projects
              </a>
            </div>
          </div>
          <div className="w-full md:w-[600px] aspect-video rounded-2xl overflow-hidden flex-shrink-0">
            <img
              src="https://images.pexels.com/photos/3094225/pexels-photo-3094225.jpeg"
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── CATEGORY PILLS ── */}
      <section className="bg-white border-b border-green-100 sticky top-[72px] z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {["All", "Art", "Music", "Film & Video", "Games", "Publishing", "Technology", "Food & Craft", "Education", "Photography", "Comics"].map(
            (cat) => (
              <button
                key={cat}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  cat === "All"
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ── FEATURED PROJECTS ── */}
        <section id="featured">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-green-950">Featured Projects</h2>
              <p className="text-green-600 text-sm mt-1">Hand-picked campaigns making waves right now</p>
            </div>
            <a href="#" className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">
              See all →
            </a>
          </div>
          <div className="space-y-5">
            {featured.map((p) => (
              <FeaturedCard key={p.id} project={p} />
            ))}
          </div>
        </section>

        {/* ── RECOMMENDED FOR YOU ── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-green-950">Recommended for You</h2>
              <p className="text-green-600 text-sm mt-1">Based on categories you love</p>
            </div>
            <a href="#" className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">
              See all →
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommended.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>

        {/* ── POPULAR PROJECTS ── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-green-950">Popular Projects</h2>
              <p className="text-green-600 text-sm mt-1">Trending campaigns with the most momentum</p>
            </div>
            <a href="#" className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">
              See all →
            </a>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {popular.map((p, i) => (
              <PopularCard key={p.id} project={p} rank={i + 1} />
            ))}
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-green-950 text-green-400 py-10 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600" />
            <span className="font-bold text-white">XRP Creates</span>
          </div>
          <p className="text-green-600">© 2026 XRP Creates. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-green-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-green-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-green-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
