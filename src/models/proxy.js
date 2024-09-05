import axios from 'axios';

export class Proxy {
    /**
     *
     * @param proxyConfig The proxy config (optional)
     * @param adapter The axios adapter (optional)
     */
    constructor(proxyConfig, adapter) {
        this.proxyConfig = proxyConfig;
        this.adapter = adapter;
        this.validUrl = /^https?:\/\/.+/;
        this.client = axios.create();

        if (proxyConfig) this.setProxy(proxyConfig);
        if (adapter) this.setAxiosAdapter(adapter);
    }

    rotateProxy(proxy) {
        setInterval(() => {
            const url = proxy.urls.shift();
            if (url) proxy.urls.push(url);
            this.setProxy({ url: proxy.urls[0], key: proxy.key });
        }, proxy.rotateInterval ?? 5000);
    }

    toMap(arr) {
        return arr.map((v, i) => [i, v]);
    }

    /**
     * Set or Change the proxy config
     */
    setProxy(proxyConfig) {
        if (!proxyConfig?.url) return;
        
        if (typeof proxyConfig.url === 'string') {
            if (!this.validUrl.test(proxyConfig.url))
                throw new Error('Proxy URL is invalid!');
        } else if (Array.isArray(proxyConfig.url)) {
            for (const [i, url] of this.toMap(proxyConfig.url)) {
                if (!this.validUrl.test(url))
                    throw new Error(`Proxy URL at index ${i} is invalid!`);
            }
            this.rotateProxy({ ...proxyConfig, urls: proxyConfig.url });
        }

        this.client.interceptors.request.use(config => {
            if (proxyConfig?.url) {
                config.headers = {
                    ...config.headers,
                    'x-api-key': proxyConfig.key ?? '',
                };
                config.url = `${proxyConfig.url}${config?.url ?? ''}`;
            }

            if (config?.url?.includes('anify')) {
                config.headers = {
                    ...config.headers,
                    'User-Agent': 'consumet',
                };
            }
            
            return config;
        });
    }

    /**
     * Set or Change the axios adapter
     */
    setAxiosAdapter(adapter) {
        this.client.defaults.adapter = adapter;
    }
}

export default Proxy;
