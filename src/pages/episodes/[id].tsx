import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { GetStaticProps, GetStaticPaths } from 'next'
import { api } from '../../services/api'
import Image from 'next/image'
import Link from 'next/link'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'
import styles from './episode.module.scss'

import Head from 'next/head'


type Episodes = {
  id: string,
  title: string,
  members: string,
  publishedAt: string,
  thumbnail: string,
  description: string,
  url: string,
  type: string,
  durationAsString: String
}
type EpisodesProps = {
  episode: Episodes
}

export default function Episodes({ episode }: EpisodesProps) {
  
  const imgSize = 24

  return (
      <div className={styles.episode}>
          <Head>
              <title>{episode.title}</title>
          </Head>
          <div className={styles.thumbnailContainer}>
              <Link href={'/'}>
                  <button type="button" >
                      <Image
                          src={'/arrow-left.svg'}
                          alt='Voltar'
                          width={imgSize}
                          height={imgSize}
                      />
                  </button>
              </Link>
              <Image
                  src={episode.thumbnail}
                  objectFit='cover'
                  alt='Thumbnail'
                  width={700}
                  height={160}
              />
              <button type="button">
                  <Image
                      
                      src={'/play.svg'}
                      alt='Reproduzir episódio'
                      width={imgSize}
                      height={imgSize}
                  />
              </button>
          </div>

          <header>
              <h1>{episode.title}</h1>
              <span>{episode.members}</span>
              <span>{episode.publishedAt}</span>
              <span>{episode.durationAsString}</span>
          </header>

          <div
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: episode.description }}
          />
      </div>
  )
}
export const getStaticPaths: GetStaticPaths = async (ctx) => {
  const { data } = await api.get('episodes', {
      params: {
          _limit: 2,
          _sort: 'published_at',
          _order: 'desc',
      }
  })

  const paths = data.map((episode: { id: string }) => {
      return {
          params: {
              id: episode.id
          }
      }
  })

  return {
      paths,
      fallback: 'blocking'
  }
}
export const getStaticProps: GetStaticProps = async (ctx) => {
  const { id } = ctx.params
  const { data } = await api.get(`/episodes/${id}`)

  const episode = {
      id: data.id,
      title: data.title,
      members: data.members,
      publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
      thumbnail: data.thumbnail,
      description: data.description,
      url: data.file.url,
      type: data.file.type,
      durationAsString: convertDurationToTimeString(Number(data.file.duration)),
  }

  return {
      props: {
          episode
      },
      revalidate: 60 * 60 * 24 // - 24h
  }
}