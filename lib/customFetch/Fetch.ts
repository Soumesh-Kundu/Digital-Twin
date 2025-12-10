export function Fetch(url: string, options?: RequestInit) {
    return fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
            ...options?.headers,
        },
        credentials: 'include',
    });
}

