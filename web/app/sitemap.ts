import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.cc-chat.dev'

  // Fetch posts from API
  let posts: any[] = []
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.cc-chat.dev'}/api/posts?limit=100`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    if (response.ok) {
      posts = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch posts for sitemap:', error)
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/saved`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]

  // Dynamic post pages
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...postPages]
}
