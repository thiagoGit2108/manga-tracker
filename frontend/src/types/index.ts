export interface Site {
  id: number;
  name: string;
  base_url: string;
  latest_updates_url: string;
  manga_card_selector: string;
  title_selector: string;
  chapter_selector: string;
  navigation_mode: string;
  load_more_button_text?: string;
}

export interface Manga {
  id: number;
  primary_name: string;
  aliases?: string[];
}

export interface MangaSource {
  id: number;
  manga_id: number;
  site_id: number;
  url_on_site: string;
  last_chapter_scraped: string;
  newly_found_chapters: string;
  status: string;
}

export interface MangaWithDetails {
  manga_id: number;
  manga_name: string;
  site_name?: string;
  url_on_site?: string;
  last_chapter_scraped?: string;
  newly_found_chapters?: string;
  status?: string;
}

export interface SiteWithLastSeen {
  site_id: number;
  site_name: string;
  load_more_text?: string;
  base_url: string;
  last_seen_manga?: string;
  last_seen_chapter?: string;
}

export interface AddSiteRequest {
  name: string;
  base_url: string;
  latest_updates_url: string;
  manga_card_selector: string;
  title_selector: string;
  chapter_selector: string;
  navigation_mode?: string;
  load_more_button_text?: string;
}

export interface AddMangaRequest {
  manga_name: string;
  aliases?: string[];
}
