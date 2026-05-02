import { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Code,
  FileText,
  GitBranch,
  Library,
  Menu,
  Search,
  Tag,
  X,
} from 'lucide-react';
import { taxonomies } from './data/taxonomy';
import type { Paper, TaxonomyNode } from './types';

const BASE_CONFERENCES = ['ICLR', 'CVPR', 'ACL', 'NeurIPS', 'ICML', 'AAAI', 'ICCV', 'ECCV', 'SIGGRAPH', '3DV'];
const DISPLAY_LIMIT = 180;
const TAG_LIMIT = 36;

const findCategoryName = (nodes: TaxonomyNode[], id: string | null): string | null => {
  if (!id) return null;

  for (const node of nodes) {
    if (node.id === id) return node.name;
    const childMatch = node.children ? findCategoryName(node.children, id) : null;
    if (childMatch) return childMatch;
  }

  return id;
};

const githubSearchUrl = (title: string) =>
  `https://github.com/search?q=${encodeURIComponent(`${title} code`)}&type=repositories`;

function App() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConf, setSelectedConf] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(`${import.meta.env.BASE_URL}data/papers.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load papers: ${response.status}`);
        }
        return response.json() as Promise<Paper[]>;
      })
      .then((data) => {
        if (active) {
          setPapers(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setPapers([]);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      totalPapers: papers.length,
      totalConferences: new Set(papers.map((paper) => paper.conference)).size,
      topCategories: taxonomies.length,
      openSource: papers.filter((paper) => paper.codeUrl).length,
    }),
    [papers],
  );

  const conferences = useMemo(() => {
    const fromData = Array.from(new Set(papers.map((paper) => paper.conference).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    return ['All', ...BASE_CONFERENCES.filter((conf) => fromData.includes(conf)), ...fromData.filter((conf) => !BASE_CONFERENCES.includes(conf))];
  }, [papers]);

  const tagSourcePapers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return papers.filter((paper) => {
      const matchesSearch =
        !query ||
        [paper.title, paper.summary, paper.path, paper.category, paper.conference, ...paper.tags]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesConf = selectedConf === 'All' || paper.conference === selectedConf;
      const matchesCategory = !selectedCategory || paper.categoryId.startsWith(selectedCategory);

      return matchesSearch && matchesConf && matchesCategory;
    });
  }, [papers, searchQuery, selectedConf, selectedCategory]);

  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>();

    for (const paper of tagSourcePapers) {
      for (const tag of paper.tags) {
        if (/^\w+\s20\d{2}$/.test(tag)) continue;
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }

    const options = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, TAG_LIMIT)
      .map(([tag]) => tag);

    return selectedTag && !options.includes(selectedTag) ? [selectedTag, ...options.slice(0, TAG_LIMIT - 1)] : options;
  }, [tagSourcePapers, selectedTag]);

  const filteredPapers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return papers.filter((paper) => {
      const matchesSearch =
        !query ||
        [paper.title, paper.summary, paper.path, paper.category, paper.conference, ...paper.tags]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesConf = selectedConf === 'All' || paper.conference === selectedConf;
      const matchesCategory = !selectedCategory || paper.categoryId.startsWith(selectedCategory);
      const matchesTag = !selectedTag || paper.tags.includes(selectedTag);

      return matchesSearch && matchesConf && matchesCategory && matchesTag;
    });
  }, [papers, searchQuery, selectedConf, selectedCategory, selectedTag]);

  const visiblePapers = useMemo(() => filteredPapers.slice(0, DISPLAY_LIMIT), [filteredPapers]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedConf('All');
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const renderTaxonomy = (nodes: TaxonomyNode[], level = 0) =>
    nodes.map((node) => {
      const isSelected = selectedCategory === node.id;
      const isExpanded = selectedCategory?.startsWith(node.id) || level === 0;

      return (
        <div key={node.id} className="w-full">
          <button
            type="button"
            onClick={() => setSelectedCategory(isSelected ? null : node.id)}
            className={`group flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
              isSelected
                ? 'bg-ink text-white shadow-line'
                : level === 0
                  ? 'text-ink hover:bg-stone-100'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
            }`}
            style={{ paddingLeft: `${level * 0.8 + 0.5}rem` }}
          >
            <span className={`truncate ${level === 0 ? 'font-semibold' : 'font-medium'}`}>{node.name}</span>
            {node.children ? (
              <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition ${isExpanded ? 'rotate-90' : ''}`} />
            ) : null}
          </button>
          {node.children ? <div className={isExpanded ? 'mt-1 block' : 'hidden'}>{renderTaxonomy(node.children, level + 1)}</div> : null}
        </div>
      );
    });

  return (
    <div className="min-h-screen bg-paper research-grid">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-stone-200 p-2 text-stone-600 md:hidden"
              onClick={() => setIsMobileNavOpen((value) => !value)}
              aria-label="Toggle taxonomy"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-md bg-ink text-paper">
              <Library className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-semibold leading-tight text-ink">AI 顶会论文解读</h1>
              <p className="hidden text-xs text-stone-500 sm:block">AI · LLM · NLP · CV 顶会论文解读</p>
            </div>
          </div>
          <nav className="hidden items-center gap-2 text-sm font-medium text-stone-600 sm:flex">
            <a className="rounded-md px-3 py-2 hover:bg-stone-100 hover:text-ink" href="#papers">
              Papers
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-stone-100 hover:text-ink" href="#taxonomy">
              Taxonomy
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-paper hover:bg-stone-800"
              href="https://github.com/zhaoyang97/Paper-Notes"
              target="_blank"
              rel="noreferrer"
            >
              <GitBranch className="h-4 w-4" />
              Source
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row">
        <aside
          id="taxonomy"
          className={`w-full shrink-0 border-b border-stone-200 bg-paper/95 md:sticky md:top-16 md:h-[calc(100vh-64px)] md:w-80 md:overflow-y-auto md:border-b-0 md:border-r ${
            isMobileNavOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase text-stone-400">Taxonomy</h2>
              {selectedCategory ? (
                <button type="button" className="text-xs font-medium text-moss hover:text-ink" onClick={() => setSelectedCategory(null)}>
                  Clear
                </button>
              ) : null}
            </div>
            <div className="space-y-1">{renderTaxonomy(taxonomies)}</div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <section className="mb-6 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-line">
            <div className="grid gap-0 lg:grid-cols-[1.45fr_0.55fr]">
              <div className="p-5 md:p-7">
                <p className="mb-3 inline-flex rounded-sm bg-brass/10 px-2 py-1 text-xs font-bold uppercase text-brass">
                  AI Conference Paper Notes
                </p>
                <h2 className="max-w-3xl font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
                  📚 AI 顶会论文解读
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600 md:text-base">
                  AI · LLM · NLP · CV 顶会论文解读，每篇 5 分钟读懂核心思想。
                  覆盖 ICLR · CVPR · ACL · NeurIPS · ICML · AAAI · ICCV · ECCV 等会议，持续更新中。
                </p>
              </div>
              <div className="grid grid-cols-2 border-t border-stone-200 bg-stone-50/80 lg:border-l lg:border-t-0">
                {[
                  ['Papers', stats.totalPapers],
                  ['Venues', stats.totalConferences],
                  ['Top Nodes', stats.topCategories],
                  ['Code Links', stats.openSource],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-r border-stone-200 p-4 last:border-r-0">
                    <div className="font-display text-3xl font-semibold text-moss">{value}</div>
                    <div className="mt-1 text-xs font-bold uppercase text-stone-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-lg border border-stone-200 bg-white p-4 shadow-line">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by title, summary, tags, path..."
                className="h-11 w-full rounded-md border border-stone-200 bg-paper pl-10 pr-4 text-sm outline-none transition focus:border-moss focus:bg-white focus:ring-2 focus:ring-moss/15"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-stone-500">Conference</span>
              {conferences.map((conf) => (
                <button
                  key={conf}
                  type="button"
                  onClick={() => setSelectedConf(conf)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedConf === conf
                      ? 'border-ink bg-ink text-white'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-moss hover:text-moss'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium transition ${
                    selectedTag === tag ? 'bg-brass text-white' : 'bg-stone-100 text-stone-600 hover:bg-brass/10 hover:text-brass'
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </button>
              ))}
              {tagSourcePapers.length > 0 ? (
                <span className="inline-flex items-center rounded-sm px-2 py-1 text-xs text-stone-400">
                  Top {tagOptions.length} tags from current results
                </span>
              ) : null}
            </div>

            {(selectedCategory || selectedTag || selectedConf !== 'All' || searchQuery) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                <span className="text-sm font-semibold text-stone-500">Active</span>
                {selectedCategory ? (
                  <span className="inline-flex items-center gap-2 rounded-sm bg-moss/10 px-2 py-1 text-xs font-medium text-moss">
                    {findCategoryName(taxonomies, selectedCategory)}
                    <button type="button" onClick={() => setSelectedCategory(null)} aria-label="Clear category">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null}
                {selectedTag ? (
                  <span className="inline-flex items-center gap-2 rounded-sm bg-brass/10 px-2 py-1 text-xs font-medium text-brass">
                    {selectedTag}
                    <button type="button" onClick={() => setSelectedTag(null)} aria-label="Clear tag">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null}
                <button type="button" className="ml-auto text-xs font-bold text-stone-500 hover:text-ink" onClick={clearFilters}>
                  Reset all
                </button>
              </div>
            )}
          </section>

          <section id="papers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-ink">
                {isLoading ? 'Loading papers...' : `Showing ${filteredPapers.length} Papers`}
              </h3>
              <span className="text-xs font-semibold uppercase text-stone-400">
                Client-side filtered · {Math.min(filteredPapers.length, DISPLAY_LIMIT)} visible
              </span>
            </div>

            {visiblePapers.map((paper) => (
              <article key={paper.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-line transition hover:-translate-y-0.5 hover:border-moss/40 hover:shadow-md">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold leading-snug text-ink">{paper.title}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span className="rounded-sm bg-moss/10 px-2 py-1 font-bold text-moss">
                        {paper.conference} {paper.year}
                      </span>
                      <span className="rounded-sm bg-stone-100 px-2 py-1">{paper.path}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {paper.paperUrl ? (
                      <a className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50" href={paper.paperUrl} target="_blank" rel="noreferrer">
                        <FileText className="h-3.5 w-3.5" />
                        Paper
                      </a>
                    ) : null}
                    {paper.codeUrl ? (
                      <a className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-stone-800" href={paper.codeUrl} target="_blank" rel="noreferrer">
                        <Code className="h-3.5 w-3.5" />
                        Code
                      </a>
                    ) : paper.codeNote ? (
                      <a
                        className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200"
                        href={githubSearchUrl(paper.title)}
                        target="_blank"
                        rel="noreferrer"
                        title={`原数据标记为：${paper.codeNote}`}
                      >
                        <Code className="h-3.5 w-3.5" />
                        GitHub 搜索
                      </a>
                    ) : null}
                  </div>
                </div>

                <p className="mt-4 rounded-md border border-stone-100 bg-paper p-4 text-sm leading-7 text-stone-700">
                  <span className="font-semibold text-ink">核心思想：</span>
                  {paper.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {paper.tags.slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className="rounded-sm bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 transition hover:bg-brass/10 hover:text-brass"
                    >
                      #{tag}
                    </button>
                  ))}
                  {paper.tags.length > 5 ? <span className="px-2 py-1 text-xs text-stone-400">+{paper.tags.length - 5}</span> : null}
                </div>
              </article>
            ))}

            {!isLoading && filteredPapers.length > DISPLAY_LIMIT ? (
              <div className="rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500 shadow-line">
                结果超过 {DISPLAY_LIMIT} 条，当前只渲染前 {DISPLAY_LIMIT} 条，继续收窄搜索 / 分类可以更快定位。
              </div>
            ) : null}

            {!isLoading && filteredPapers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-12 text-center text-stone-500">
                <FileText className="mx-auto mb-3 h-12 w-12 opacity-25" />
                <p>没有找到符合条件的论文，请尝试调整筛选条件。</p>
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
