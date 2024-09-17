import {
    fetchFromJikanById,
    fetchFromJikanByName,
    fetchFromJikanSeasonAnime,
    fetchFromGogoByName,
    fetchRecentUpload,
    fetchAnimeEpisode,
    fetchEpisodeSources,
    fetchTrendingAnime,
    fetchSpotlightAnime,
    fetchAnimeBanner
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

        const filteredData = data
            .filter(anime => anime.rank != null)
            .sort((a, b) => {
                const rankA = parseInt(a.rank, 10);
                const rankB = parseInt(b.rank, 10);

                if (isNaN(rankA) || isNaN(rankB)) {
                    return 0;
                }
                return rankA - rankB;
            })
            .map(anime => ({
                id: anime.mal_id,
                title: anime.title,
                image: anime.images,
                type: anime.type,
                episodes: anime.episodes,
                score: anime.score,
                status: anime.status,
                season: anime.season,
                year: anime.year,
                aired: anime.aired.string,
                synopsis: anime.synopsis
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

export async function getTrendingAnime(req, res) {
    try {
        console.log()
        const { data } = await fetchTrendingAnime();
        const filteredData = data
            .filter(anime => anime.type === "TV" || anime.type === "movie")
            .sort((a, b) => {
                // First, sort by score in descending order
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                // If score is the same, then sort by popularity in descending order
                return a.popularity - b.popularity;
            })
            .map(anime => ({
                pop: anime.popularity,
                id: anime.mal_id,
                title: anime.title,
                image: anime.image_url,
                type: anime.type,
                episodes: anime.episodes,
                status: anime.status,
                score: anime.score,
                synopsis: anime.synopsis,
            }));

        res.send(filteredData);
    } catch (error) {
        res.status(500).send('Error fetching current trending anime.');
    }
}

export async function getAnimeDetailsByName(req, res) {
    try {
        const query = req.query.q;
        const page = req.query.p || 1;
        const data = await fetchFromGogoByName(query, page);


        res.send(data.results[0])
    } catch (error) {
        res.status(500).send('Error fetching search results');
    }
}

export async function spotlightAnime(req, res) {
    try {
        const spotlightData = await fetchSpotlightAnime();
        const animeList = spotlightData.results;
        const top10Anime = animeList.slice(0, 10);
        const bannerPromises = top10Anime.map(async (anime) => {
            try {
                const bannerData = await fetchAnimeBanner(anime.title);
                return {
                    id: anime.id,
                    title: bannerData.title,
                    type: bannerData.type,
                    startDate: bannerData.startDate,
                    synopsis: bannerData.synopsis,
                    bannerImage: bannerData.bannerImage
                };
            } catch (error) {
                console.error(`Error fetching banner for ${anime.title}:`, error);
                return { id: anime.id, title: anime.title, error: 'Banner not found' };
            }
        });

        const combinedData = await Promise.all(bannerPromises);

        const validData = combinedData.filter(item => !item.error);

        res.send(validData);
    } catch (error) {
        console.error('Error in spotlightAnime:', error);
        res.status(500).send('Internal Server Error');
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

export async function getBannerAndPoster(req, res) {
    try {
        const name = req.params.name
        const data = await fetchAnimeBanner(name);

        if (data.error) {
            res.status(404).send(data.error);
        } else {
            res.send(data);
        }
    } catch (error) {
        res.status(500).send('Error fetching banner');
    }
}