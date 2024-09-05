import axios from 'axios';
import { loadHTML } from './loadHTML.js';
import GogoCDN from '../extractors/gogocdn.js';
import StreamSB from '../extractors/streamsb.js';
import StreamWish from '../extractors/streamwish.js';
import { USER_AGENT } from './utils.js';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { StreamingServers } from '../models/types.js';

export async function fetchFromJikanById(animeId) {
    try {
        const JIKAN_API = process.env.JIKAN_API;
        const response = await axios.get(`${JIKAN_API}anime/${animeId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching from Jikan:', error);
        throw error;
    }
}

export async function fetchFromJikanByName(animeName) {
    try {
        const JIKAN_API = process.env.JIKAN_API;
        const response = await axios.get(`${JIKAN_API}anime/?q=${animeName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching from Jikan:', error);
        throw error;
    }
}

export async function fetchFromJikanSeasonAnime() {
    try {
        const JIKAN_API = process.env.JIKAN_API;
        const response = await axios.get(`${JIKAN_API}seasons/now??continuing=true`);
        return response.data;
    } catch (error) {
        console.error('Error fetching from Jikan:', error);
        throw error;
    }
}

export async function fetchFromGogoByName(animeName, page) {
    try {
        const GOGO_URL = process.env.BASE_URL
        const $ = await loadHTML(`${GOGO_URL}/filter.html?keyword=${encodeURIComponent(animeName)}&page=${page}`);
        const searchResults = {
            currentPage: page,
            hasNextPage: $('div.anime_name.new_series > div > div > ul > li.selected').next().length > 0,
            results: []
        };

        $('div.last_episodes > ul > li').each((i, el) => {
            searchResults.results.push({
                id: $(el).find('p.name > a').attr('href').split('/')[2],
                title: $(el).find('p.name > a').text(),
                // url: `${GOGO_URL}${$(el).find('p.name > a').attr('href')}`,
                image: $(el).find('div > a > img').attr('src'),
                releaseDate: $(el).find('p.released').text().trim().replace('Released: ', ''),
                subOrDub: $(el).find('p.name > a').text().toLowerCase().includes('(dub)') ? 'DUB' : 'SUB'
            });
        });

        return searchResults;
    } catch (error) {
        console.error('Error fetching from GOGO:', error);
        throw error;
    }
}

export async function fetchRecentUpload(page) {
    try {
        const AJAX_URL = process.env.AJAX_URL;
        const GOGO_URL = process.env.BASE_URL;
        const $ = await loadHTML(`${AJAX_URL}/page-recent-release.html?page=${page}`);
        const recentEpisodes = [];

        $('div.last_episodes.loaddub > ul > li').each((i, el) => {
            recentEpisodes.push({
                id: $(el).find('a').attr('href').split('/')[1].split('-episode')[0],
                episodeId: $(el).find('a').attr('href').split('/')[1],
                episodeNumber: parseFloat($(el).find('p.episode').text().replace('Episode ', '')),
                title: $(el).find('p.name > a').text(),
                image: $(el).find('div > a > img').attr('src'),
                url: `${GOGO_URL}${$(el).find('a').attr('href').trim()}`
            });
        });

        const hasNextPage = !$('div.anime_name_pagination.intro > div > ul > li').last().hasClass('selected');
        const response = { currentPage: page, hasNextPage, results: recentEpisodes };
        return response;
    } catch (error) {
        console.error('Error fetching from GOGO:', error);
        throw error;
    }
}

export async function fetchAnimeEpisode(id) {
    const AJAX_URL = process.env.AJAX_URL;
    const GOGO_URL = process.env.BASE_URL;
    const url = id.includes('gogoanime') ? id : `${GOGO_URL}/category/${id}`;
    try {
        const $ = await loadHTML(url);
        const animeInfo = {
            id: new URL(url).pathname.split('/')[2],
            title: $('section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1').text().trim(),
            totalEpisodes: 0,
            url: url,
            image: $('div.anime_info_body_bg > img').attr('src'),
            releaseDate: $('div.anime_info_body_bg > p:nth-child(8)').text().trim().split('Released: ')[1],
            description: $('div.anime_info_body_bg > div:nth-child(6)').text().trim().replace('Plot Summary: ', ''),
            type: $('div.anime_info_body_bg > p:nth-child(4) > a').text().trim().toUpperCase(),
            status: $('div.anime_info_body_bg > p:nth-child(9) > a').text().trim(),
            genres: [],
            episodes: []
        };

        $('div.anime_info_body_bg > p:nth-child(7) > a').each((i, el) => {
            animeInfo.genres.push($(el).attr('title').toString());
        });

        const epStart = $('#episode_page > li').first().find('a').attr('ep_start');
        const epEnd = $('#episode_page > li').last().find('a').attr('ep_end');
        const movieId = $('#movie_id').attr('value');
        const alias = $('#alias_anime').attr('value');

        const $$ = await loadHTML(`${AJAX_URL}/load-list-episode?ep_start=${epStart}&ep_end=${epEnd}&id=${movieId}&default_ep=0&alias=${alias}`);
        $$('#episode_related > li').each((i, el) => {
            animeInfo.episodes.push({
                id: $(el).find('a').attr('href').split('/')[1],
                number: parseFloat($(el).find('div.name').text().replace('EP ', '')),
                url: `${GOGO_URL}${$(el).find('a').attr('href').trim()}`
            });
        });

        animeInfo.episodes.reverse();
        animeInfo.totalEpisodes = parseInt(epEnd || '0');

        return animeInfo;
    } catch (err) {
        throw new Error(`Failed to fetch anime info: ${err.message}`);
    }
}

export async function fetchEpisodeSources(episodeId, server = StreamingServers.VidStreaming, downloadUrl = undefined, proxyConfig = null, adapter = null) {

    const AJAX_URL = process.env.AJAX_URL;
    const BASE_URL = process.env.BASE_URL;
    if (episodeId.startsWith('http')) {
        const serverUrl = new URL(episodeId);
        switch (server) {
            case StreamingServers.GogoCDN:
                return {
                    headers: { Referer: serverUrl.href },
                    sources: await new GogoCDN(proxyConfig, adapter).extract(serverUrl),
                    download: downloadUrl ? downloadUrl : `https://${serverUrl.host}/download${serverUrl.search}`,
                };
            case StreamingServers.StreamSB:
                return {
                    headers: {
                        Referer: serverUrl.href,
                        watchsb: 'streamsb',
                        'User-Agent': USER_AGENT,
                    },
                    sources: await new StreamSB(proxyConfig, adapter).extract(serverUrl),
                    download: downloadUrl ? downloadUrl : `https://${serverUrl.host}/download${serverUrl.search}`,
                };
            case StreamingServers.StreamWish:
                return {
                    headers: {
                        Referer: serverUrl.href,
                    },
                    sources: await new StreamWish(proxyConfig, adapter).extract(serverUrl),
                    download: downloadUrl ? downloadUrl : `https://${serverUrl.host}/download${serverUrl.search}`,
                };
            default:
                return {
                    headers: { Referer: serverUrl.href },
                    sources: await new GogoCDN(proxyConfig, adapter).extract(serverUrl),
                    download: downloadUrl ? downloadUrl : `https://${serverUrl.host}/download${serverUrl.search}`,
                };
        }
    }

    try {
        const res = await axios.get(`${BASE_URL}/${episodeId}`);
        const $ = cheerio.load(res.data);
        let serverUrl;
        switch (server) {
            case StreamingServers.GogoCDN:
                serverUrl = new URL(`${$('#load_anime > div > div > iframe').attr('src')}`);
                break;
            case StreamingServers.VidStreaming:
                serverUrl = new URL(`${$('div.anime_video_body > div.anime_muti_link > ul > li.vidcdn > a').attr('data-video')}`);
                break;
            case StreamingServers.StreamSB:
                serverUrl = new URL($('div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a').attr('data-video'));
                break;
            case StreamingServers.StreamWish:
                serverUrl = new URL($('div.anime_video_body > div.anime_muti_link > ul > li.streamwish > a').attr('data-video'));
                break;
            default:
                serverUrl = new URL(`${$('#load_anime > div > div > iframe').attr('src')}`);
                break;
        }
        const downloadLink = `${$('.dowloads > a').attr('href')}`;
        return downloadLink
            ? await fetchEpisodeSources(serverUrl.href, server, downloadLink, proxyConfig, adapter)
            : await fetchEpisodeSources(serverUrl.href, server, undefined, proxyConfig, adapter);
    } catch (err) {
        console.log(err);
        throw new Error('Episode not found.');
    }
}


/* export async function fetchFromKitsu(animeId) {
    try {
        const KITSU_API = process.env.KITSU_API;
        const response = await axios.get(`${KITSU_API}/${animeId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching from Kitsu:', error);
        throw error;
    }
} */
