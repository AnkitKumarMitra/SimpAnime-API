import axios from 'axios';
import * as cheerio from 'cheerio';

export const loadHTML = async (url) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
};
