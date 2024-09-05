import {
    fetchFromJikanById,
    fetchFromJikanByName,
    fetchFromJikanSeasonAnime,
    fetchFromGogoByName,
    fetchRecentUpload,
    fetchAnimeEpisode,
    fetchEpisodeSources
} from '../utils/apiHandler.js';

export async function getAnimeDetailsById(req, res) {
    const animeId = req.params.id;
    try {
        const { data } = await fetchFromJikanById(animeId);
        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(500).send('Error fetching anime data');
    }
}

export async function searchAnime(req, res) {
    const animeName = req.query.q;
    try {
        const { data } = await fetchFromJikanByName(animeName);

        const filteredData = data.map(anime => ({
            id: anime.mal_id,
            title: anime.title_english,
            image: anime.images,
            type: anime.type,
            episodes: anime.episodes,
            status: anime.status,
            score: anime.score,
            season: anime.season,
            year: anime.year
        }));

        res.send(filteredData)
    } catch (error) {
        res.status(500).send('Error fetching anime data');
    }
}

export async function getSeasonAnime(req, res) {
    try {
        const { data } = await fetchFromJikanSeasonAnime();

        const filteredData = data.map(anime => ({
            id: anime.mal_id,
            title: anime.title,
            image: anime.images,
            type: anime.type,
            episodes: anime.episodes,
            status: anime.status,
            score: anime.score,
            season: anime.season,
            year: anime.year,
            synopsis: anime.synopsis
        }));

        res.send(filteredData)
    } catch (error) {
        res.status(500).send('Error fetching season anime data');
    }
}

export async function getTopSeasonAnime(req, res) {
    try {
        const { data } = await fetchFromJikanSeasonAnime();

        const filteredAndSortedData = data
            .filter(anime => anime.type === 'TV' || anime.type === 'Movie')
            .map(anime => ({
                id: anime.mal_id,
                title: anime.title,
                image: anime.images,
                type: anime.type,
                episodes: anime.episodes,
                score: anime.score,
            }))
            .sort((a, b) => b.score - a.score);

        res.send(filteredAndSortedData)
    } catch (error) {
        res.status(500).send('Error fetching top anime data');
    }
}

export async function getAnimeDetailsByName(req, res) {
    try {
        const query = req.query.q;
        const page = req.query.p || 1;
        const data = await fetchFromGogoByName(query, page);


        res.send(data)
    } catch (error) {
        res.status(500).send('Error fetching search results');
    }
}

export async function recentUpload(req, res) {
    try {
        const page = req.query.page || 1;
        const data = await fetchRecentUpload(page);
        res.send(data)
    } catch (error) {
        res.status(500).send('Error fetching recent uploads');
    }
}

export async function episode(req, res) {
    try {
        const id = req.params.id;
        const data = await fetchAnimeEpisode(id);
        res.send(data)
    } catch (error) {
        res.status(500).send('Error fetching episode details');
    }
}

export async function getEpisodeSource(req, res) {
    try {
        const id = req.params.id;
        const data = await fetchEpisodeSources(id);

        res.send(data)
    } catch (error) {
        res.status(500).send('Error fetching episode source');
    }
}
