export function subdomainUrlBuilderWithRequest(slug, request) {
    const hostname = request.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost');

    if (isLocalhost) {
        return `${process.env.NEXT_PUBLIC_APP_URL}/console?hotel=${slug}`
    } else {
        return `https://${hostname}/console`
    }
}

export function subdomainUrlBuilderWithWindow(slug) {
    const isLocalhost = window.location.hostname.includes('localhost');

    if (isLocalhost) {
        return `${process.env.NEXT_PUBLIC_APP_URL}/console?hotel=${slug}`
    } else {
        return `https://${window.location.host}/console`
    }
}